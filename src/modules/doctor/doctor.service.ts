import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Doctor } from 'src/lib/db/entities/doctor.entity';
import { User } from 'src/lib/db/entities/user.entity';
import { DoctorAvailability } from 'src/lib/db/entities/doctor-availability.entity';
import { DoctorAvailOverride } from 'src/lib/db/entities/doctor-avail-override.entity';
import { Slot } from 'src/lib/db/entities/slot.entity';
import { SlotGateway } from './slot.gateway';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DoctorAvailability)
    private readonly regularRepo: Repository<DoctorAvailability>,
    @InjectRepository(DoctorAvailOverride)
    private readonly overrideRepo: Repository<DoctorAvailOverride>,
    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,
    private readonly slotGateway: SlotGateway,
  ) {}

  async createDoctor(userId: number, dto: Partial<Doctor>) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) throw new NotFoundException('User not found');
    const existing = await this.doctorRepository.findOne({ where: { userId } });
    if (existing)
      throw new BadRequestException('Doctor already registered for this user');
    const doctor = this.doctorRepository.create({
      userId,
      user,
      qualifications: dto.qualifications,
      specialization: dto.specialization,
      years_of_experience: dto.years_of_experience,
      bio: dto.bio,
    });
    const savedDoctor = await this.doctorRepository.save(doctor);
    // Update user role to 'doctor'
    user.role = 'doctor';
    await this.userRepository.save(user);
    return savedDoctor;
  }

  async updateDoctor(userId: number, dto: Partial<Doctor>) {
    const doctor = await this.doctorRepository.findOne({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    Object.assign(doctor, dto);
    return this.doctorRepository.save(doctor);
  }

  async getDoctorById(userId: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async getAllDoctors(search?: string, page = 1, limit = 10) {
    const query = this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user');
    if (search) {
      query.where(
        'doctor.specialization ILIKE :search OR doctor.qualifications ILIKE :search OR user.name ILIKE :search',
        { search: `%${search}%` },
      );
    }
    query.skip((page - 1) * limit).take(limit);
    const [doctors, total] = await query.getManyAndCount();
    return { doctors, total, page, limit };
  }

  // --- Availability Management ---
  async setRegularAvailability(
    doctorId: number,
    availabilities: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>,
  ) {
    // Remove existing
    await this.regularRepo.delete({ doctorId });
    // Add new
    const toSave = availabilities.map((a) =>
      this.regularRepo.create({ ...a, doctorId }),
    );
    return this.regularRepo.save(toSave);
  }

  async setOverride(
    doctorId: number,
    override: {
      date: string;
      startTime?: string;
      endTime?: string;
      isAvailable?: boolean;
    },
  ) {
    let entity = await this.overrideRepo.findOne({
      where: { doctorId, date: override.date },
    });
    if (!entity) {
      entity = this.overrideRepo.create({ doctorId, ...override });
    } else {
      Object.assign(entity, override);
    }
    return this.overrideRepo.save(entity);
  }

  async cancelOverride(doctorId: number, date: string) {
    const entity = await this.overrideRepo.findOne({
      where: { doctorId, date },
    });
    if (!entity) throw new NotFoundException('Override not found');
    await this.overrideRepo.remove(entity);
    return { message: 'Override cancelled' };
  }

  async getAvailabilityForDate(doctorId: number, date: string) {
    // Check for override first
    const override = await this.overrideRepo.findOne({
      where: { doctorId, date },
    });
    if (override) {
      if (!override.isAvailable) return { available: false, date };
      return {
        available: true,
        date,
        startTime: override.startTime,
        endTime: override.endTime,
        type: 'override',
      };
    }
    // Fallback to regular
    const dayOfWeek = new Date(date).getDay();
    const regular = await this.regularRepo.findOne({
      where: { doctorId, dayOfWeek },
    });
    if (!regular) return { available: false, date };
    return {
      available: true,
      date,
      startTime: regular.startTime,
      endTime: regular.endTime,
      type: 'regular',
    };
  }

  // --- Slot Management ---
  async createSlot(
    doctorId: number,
    dto: {
      date: string;
      startTime: string;
      endTime: string;
      capacity?: number;
    },
  ) {
    // 1. Check not in past
    const now = new Date();
    const slotDate = new Date(`${dto.date}T${dto.startTime}:00`);
    if (slotDate < now)
      throw new BadRequestException('Cannot create slot in the past');
    // 2. Check within availability
    const avail = await this.getAvailabilityForDate(doctorId, dto.date);
    if (!avail.available)
      throw new BadRequestException('Doctor not available on this date');
    if (
      typeof avail.startTime === 'undefined' ||
      typeof avail.endTime === 'undefined'
    )
      throw new BadRequestException(
        'Doctor availability hours not set for this date',
      );
    if (dto.startTime < avail.startTime || dto.endTime > avail.endTime)
      throw new BadRequestException('Slot must be within available hours');
    // 3. Check for overlap (true interval overlap)
    const overlaps = await this.slotRepo
      .createQueryBuilder('slot')
      .where('slot.doctorId = :doctorId', { doctorId })
      .andWhere('slot.date = :date', { date: dto.date })
      .andWhere('slot.startTime < :endTime', { endTime: dto.endTime })
      .andWhere('slot.endTime > :startTime', { startTime: dto.startTime })
      .getOne();
    if (overlaps)
      throw new BadRequestException('Slot overlaps with existing slot');
    // 4. Create slot
    const slot = this.slotRepo.create({
      doctorId,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      capacity: dto.capacity || 1,
    });
    const saved = await this.slotRepo.save(slot);
    this.slotGateway.emitSlotCreated(doctorId, saved);
    return saved;
  }

  async updateSlot(
    doctorId: number,
    slotId: number,
    dto: { startTime?: string; endTime?: string; capacity?: number },
  ) {
    const slot = await this.slotRepo.findOne({
      where: { id: slotId, doctorId },
    });
    if (!slot) throw new NotFoundException('Slot not found');
    // If changing time, check for overlap and availability
    if (dto.startTime || dto.endTime) {
      const newStart = dto.startTime || slot.startTime;
      const newEnd = dto.endTime || slot.endTime;
      const avail = await this.getAvailabilityForDate(doctorId, slot.date);
      if (!avail.available)
        throw new BadRequestException('Doctor not available on this date');
      if (
        typeof avail.startTime === 'undefined' ||
        typeof avail.endTime === 'undefined'
      )
        throw new BadRequestException(
          'Doctor availability hours not set for this date',
        );
      if (newStart < avail.startTime || newEnd > avail.endTime)
        throw new BadRequestException('Slot must be within available hours');
      // Overlap check (exclude self)
      const overlaps = await this.slotRepo
        .createQueryBuilder('slot')
        .where('slot.doctorId = :doctorId', { doctorId })
        .andWhere('slot.date = :date', { date: slot.date })
        .andWhere('slot.id != :slotId', { slotId })
        .andWhere('slot.startTime < :endTime', { endTime: newEnd })
        .andWhere('slot.endTime > :startTime', { startTime: newStart })
        .getOne();
      if (overlaps)
        throw new BadRequestException('Slot overlaps with existing slot');
      slot.startTime = newStart;
      slot.endTime = newEnd;
    }
    if (dto.capacity) slot.capacity = dto.capacity;
    const saved = await this.slotRepo.save(slot);
    this.slotGateway.emitSlotUpdated(doctorId, saved);
    return saved;
  }

  async deleteSlot(doctorId: number, slotId: number) {
    const slot = await this.slotRepo.findOne({
      where: { id: slotId, doctorId },
    });
    if (!slot) throw new NotFoundException('Slot not found');
    await this.slotRepo.remove(slot);
    this.slotGateway.emitSlotDeleted(doctorId, slotId);
    return { message: 'Slot deleted' };
  }

  async listSlots(doctorId: number, date?: string) {
    const where: any = { doctorId };
    if (date) where.date = date;
    return this.slotRepo.find({
      where,
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }
}
