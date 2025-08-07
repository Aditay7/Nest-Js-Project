import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Doctor } from 'src/lib/db/entities/doctor.entity';
import { User } from 'src/lib/db/entities/user.entity';
import {
  DoctorAvailability,
  DayOfWeek,
  SessionType,
  getDayName,
} from 'src/lib/db/entities/doctor-availability.entity';
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
      daysOfWeek: DayOfWeek[];
      startTime: string;
      endTime: string;
      sessionType?: SessionType;
    }>,
  ) {
    // Soft delete existing active availabilities
    await this.regularRepo.update(
      { doctorId, isActive: true },
      { isActive: false },
    );

    // Add new
    const toSave = availabilities.map((a) =>
      this.regularRepo.create({
        ...a,
        doctorId,
        sessionType: a.sessionType || SessionType.CUSTOM,
        isActive: true,
      }),
    );
    return this.regularRepo.save(toSave);
  }

  // Legacy method for backward compatibility
  async setRegularAvailabilityLegacy(
    doctorId: number,
    availabilities: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>,
  ) {
    // Convert legacy format to new format
    const newFormat = availabilities.map((a) => ({
      daysOfWeek: [a.dayOfWeek as DayOfWeek],
      startTime: a.startTime,
      endTime: a.endTime,
      sessionType: SessionType.CUSTOM,
    }));

    return this.setRegularAvailability(doctorId, newFormat);
  }

  async setOverride(
    doctorId: number,
    override: {
      date: string;
      startTime?: string;
      endTime?: string;
      isAvailable?: boolean;
      sessionType?: SessionType;
    },
  ) {
    let entity = await this.overrideRepo.findOne({
      where: { doctorId, date: override.date, isActive: true },
    });
    if (!entity) {
      entity = this.overrideRepo.create({
        doctorId,
        ...override,
        isActive: true,
      });
    } else {
      Object.assign(entity, override);
    }
    return this.overrideRepo.save(entity);
  }

  async updateOverrideStatus(
    doctorId: number,
    date: string,
    isActive: boolean,
  ) {
    const entity = await this.overrideRepo.findOne({
      where: { doctorId, date },
    });
    if (!entity) {
      throw new NotFoundException('Override not found');
    }

    if (entity.isActive === isActive) {
      const status = isActive ? 'active' : 'inactive';
      throw new BadRequestException(`Override is already ${status}`);
    }

    entity.isActive = isActive;
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
      where: { doctorId, date, isActive: true },
    });
    if (override) {
      if (!override.isAvailable) return { available: false, date };
      return {
        available: true,
        date,
        startTime: override.startTime,
        endTime: override.endTime,
        sessionType: override.sessionType,
        type: 'override',
      };
    }

    // Fallback to regular availability
    const dayOfWeek = new Date(date).getDay() as DayOfWeek;
    const regulars = await this.regularRepo.find({
      where: { doctorId, isActive: true },
    });

    // Find regular availability that includes this day of week
    console.log(
      `📅 Checking regular availability for day ${dayOfWeek} (${getDayName(dayOfWeek)})`,
    );
    console.log(
      `📋 Found ${regulars.length} regular availability patterns:`,
      regulars.map((r) => ({
        id: r.id,
        daysOfWeek: r.daysOfWeek,
        daysOfWeekType: typeof r.daysOfWeek,
        startTime: r.startTime,
        endTime: r.endTime,
        sessionType: r.sessionType,
      })),
    );

    const regular = regulars.find((r) => {
      // Handle both string and array formats for daysOfWeek
      let days: DayOfWeek[] = [];

      if (typeof r.daysOfWeek === 'string') {
        try {
          // Parse string representation of array
          days = JSON.parse(r.daysOfWeek);
        } catch (e) {
          console.error('❌ Error parsing daysOfWeek string:', r.daysOfWeek, e);
          return false;
        }
      } else if (Array.isArray(r.daysOfWeek)) {
        days = r.daysOfWeek;
      } else {
        console.error('❌ Invalid daysOfWeek format:', r.daysOfWeek);
        return false;
      }

      // Convert all elements to numbers for comparison
      const numericDays = days.map((day) =>
        typeof day === 'string' ? parseInt(day, 10) : day,
      );

      console.log(
        `🔍 Checking if day ${dayOfWeek} is in days array:`,
        days,
        '-> converted to:',
        numericDays,
      );
      return numericDays.includes(dayOfWeek);
    });

    if (!regular) {
      console.log(`❌ No regular availability found for day ${dayOfWeek}`);
      return { available: false, date };
    }

    console.log(`✅ Found matching regular availability:`, regular);
    return {
      available: true,
      date,
      startTime: regular.startTime,
      endTime: regular.endTime,
      sessionType: regular.sessionType,
      type: 'regular',
    };
  }

  // NEW METHOD: Get upcoming available dates with slots pre-computed
  async getUpcomingAvailableDates(doctorId: number, maxDays: number = 30) {
    const availableDates: any[] = [];
    const today = new Date();

    // Get doctor's regular availability patterns
    const regularAvailabilities = await this.regularRepo.find({
      where: { doctorId, isActive: true },
      order: { id: 'ASC' },
    });

    // Get any overrides for the date range
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + maxDays);

    const overrides = await this.overrideRepo.find({
      where: {
        doctorId,
        date: `>= '${today.toISOString().split('T')[0]}'`,
        isActive: true,
      },
    });

    // Create a map of overrides by date for quick lookup
    const overrideMap = new Map();
    overrides.forEach((override) => {
      overrideMap.set(override.date, override);
    });

    // Check each day in the range
    for (let i = 0; i < maxDays; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayOfWeek = checkDate.getDay();
      const dayName = checkDate.toLocaleDateString('en-US', {
        weekday: 'long',
      });

      let isAvailable = false;
      let availabilityHours = null;

      // Check for override first
      const override = overrideMap.get(dateStr);
      if (override) {
        if (override.isAvailable) {
          isAvailable = true;
          availabilityHours = {
            startTime: override.startTime,
            endTime: override.endTime,
            sessionType: override.sessionType,
          };
        }
      } else {
        // Check regular availability
        const regular = regularAvailabilities.find((r) => {
          let days: any[] = [];
          if (typeof r.daysOfWeek === 'string') {
            try {
              days = JSON.parse(r.daysOfWeek);
            } catch (e) {
              return false;
            }
          } else if (Array.isArray(r.daysOfWeek)) {
            days = r.daysOfWeek;
          }
          const numericDays = days.map((day) =>
            typeof day === 'string' ? parseInt(day, 10) : day,
          );
          return numericDays.includes(dayOfWeek);
        });

        if (regular) {
          isAvailable = true;
          availabilityHours = {
            startTime: regular.startTime,
            endTime: regular.endTime,
            sessionType: regular.sessionType,
          };
        }
      }

      if (isAvailable && availabilityHours) {
        // Get existing slots for this date
        const slots = await this.slotRepo.find({
          where: { doctorId, date: dateStr, isActive: true },
          order: { startTime: 'ASC' },
        });

        // Calculate available capacity for each slot
        const slotsWithCapacity = await Promise.all(
          slots.map(async (slot) => {
            const appointmentCount = await this.appointmentRepo.count({
              where: {
                slotId: slot.id,
                appointmentDate: dateStr,
                status: In([
                  AppointmentStatus.SCHEDULED,
                  AppointmentStatus.CONFIRMED,
                  AppointmentStatus.IN_PROGRESS,
                ]),
                isActive: true,
              },
            });

            const availableCapacity = slot.capacity - appointmentCount;

            return {
              id: slot.id,
              startTime: slot.startTime,
              endTime: slot.endTime,
              capacity: slot.capacity,
              availableCapacity,
              appointmentCount,
              sessionType: slot.sessionType,
            };
          }),
        );

        // Only include dates that have available slots
        const availableSlots = slotsWithCapacity.filter(
          (slot) => slot.availableCapacity > 0,
        );

        if (availableSlots.length > 0) {
          availableDates.push({
            date: dateStr,
            dayName,
            dayOfWeek,
            availabilityHours,
            slots: availableSlots,
            totalAvailableSlots: availableSlots.length,
            totalAvailableCapacity: availableSlots.reduce(
              (sum, slot) => sum + slot.availableCapacity,
              0,
            ),
          });
        }
      }
    }

    return {
      doctorId,
      searchRange: {
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        daysSearched: maxDays,
      },
      availableDates,
      totalAvailableDates: availableDates.length,
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
      sessionType?: SessionType;
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
    // 3. Check for overlap with active slots (true interval overlap)
    const overlaps = await this.slotRepo
      .createQueryBuilder('slot')
      .where('slot.doctorId = :doctorId', { doctorId })
      .andWhere('slot.date = :date', { date: dto.date })
      .andWhere('slot.isActive = :isActive', { isActive: true })
      .andWhere('slot.startTime < :endTime', { endTime: dto.endTime })
      .andWhere('slot.endTime > :startTime', { startTime: dto.startTime })
      .getOne();
    if (overlaps)
      throw new BadRequestException('Slot overlaps with existing active slot');
    // 4. Create slot
    const slot = this.slotRepo.create({
      doctorId,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      capacity: dto.capacity || 1,
      sessionType: dto.sessionType || SessionType.CUSTOM,
      isActive: true,
    });
    const saved = await this.slotRepo.save(slot);
    this.slotGateway.emitSlotCreated(doctorId, saved);
    return saved;
  }

  async updateSlot(
    doctorId: number,
    slotId: number,
    dto: {
      startTime?: string;
      endTime?: string;
      capacity?: number;
      sessionType?: SessionType;
    },
  ) {
    const slot = await this.slotRepo.findOne({
      where: { id: slotId, doctorId, isActive: true },
    });
    if (!slot) throw new NotFoundException('Active slot not found');
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
      // Overlap check (exclude self and only check active slots)
      const overlaps = await this.slotRepo
        .createQueryBuilder('slot')
        .where('slot.doctorId = :doctorId', { doctorId })
        .andWhere('slot.date = :date', { date: slot.date })
        .andWhere('slot.id != :slotId', { slotId })
        .andWhere('slot.isActive = :isActive', { isActive: true })
        .andWhere('slot.startTime < :endTime', { endTime: newEnd })
        .andWhere('slot.endTime > :startTime', { startTime: newStart })
        .getOne();
      if (overlaps)
        throw new BadRequestException(
          'Slot overlaps with existing active slot',
        );
      slot.startTime = newStart;
      slot.endTime = newEnd;
    }
    if (dto.capacity) slot.capacity = dto.capacity;
    if (dto.sessionType) slot.sessionType = dto.sessionType;
    const saved = await this.slotRepo.save(slot);
    this.slotGateway.emitSlotUpdated(doctorId, saved);
    return saved;
  }

  async updateSlotStatus(doctorId: number, slotId: number, isActive: boolean) {
    const slot = await this.slotRepo.findOne({
      where: { id: slotId, doctorId },
    });
    if (!slot) throw new NotFoundException('Slot not found');

    if (slot.isActive === isActive) {
      const status = isActive ? 'active' : 'inactive';
      throw new BadRequestException(`Slot is already ${status}`);
    }

    // If enabling, check for overlaps with other active slots
    if (isActive) {
      const overlaps = await this.slotRepo
        .createQueryBuilder('slot')
        .where('slot.doctorId = :doctorId', { doctorId })
        .andWhere('slot.date = :date', { date: slot.date })
        .andWhere('slot.id != :slotId', { slotId })
        .andWhere('slot.isActive = :isActive', { isActive: true })
        .andWhere('slot.startTime < :endTime', { endTime: slot.endTime })
        .andWhere('slot.endTime > :startTime', { startTime: slot.startTime })
        .getOne();
      if (overlaps)
        throw new BadRequestException(
          'Cannot enable slot: overlaps with existing active slot',
        );
    }

    slot.isActive = isActive;
    const saved = await this.slotRepo.save(slot);

    // Emit appropriate event
    if (isActive) {
      this.slotGateway.emitSlotCreated(doctorId, saved);
    } else {
      this.slotGateway.emitSlotDeleted(doctorId, slotId);
    }

    return saved;
  }

  async deleteSlotPermanently(doctorId: number, slotId: number) {
    const slot = await this.slotRepo.findOne({
      where: { id: slotId, doctorId },
    });
    if (!slot) throw new NotFoundException('Slot not found');

    await this.slotRepo.remove(slot);
    this.slotGateway.emitSlotDeleted(doctorId, slotId);
    return { message: 'Slot permanently deleted' };
  }

  async listSlots(doctorId: number, date?: string, includeInactive = false) {
    const where: any = { doctorId };
    if (date) where.date = date;
    if (!includeInactive) where.isActive = true;

    return this.slotRepo.find({
      where,
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async getRegularAvailabilities(doctorId: number, includeInactive = false) {
    const where: any = { doctorId };
    if (!includeInactive) where.isActive = true;

    return this.regularRepo.find({
      where,
      order: { createdAt: 'ASC' },
    });
  }

  async updateAvailabilityStatus(
    doctorId: number,
    availabilityId: number,
    isActive: boolean,
  ) {
    const availability = await this.regularRepo.findOne({
      where: { id: availabilityId, doctorId },
    });
    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (availability.isActive === isActive) {
      const status = isActive ? 'active' : 'inactive';
      throw new BadRequestException(`Availability is already ${status}`);
    }

    availability.isActive = isActive;
    return this.regularRepo.save(availability);
  }

  async debugAvailabilityData(doctorId: number) {
    const regularAvailabilities = await this.regularRepo.find({
      where: { doctorId },
    });

    const overrides = await this.overrideRepo.find({
      where: { doctorId },
    });

    return {
      doctorId,
      regularAvailabilities: regularAvailabilities.map((r) => ({
        id: r.id,
        daysOfWeek: r.daysOfWeek,
        daysOfWeekType: typeof r.daysOfWeek,
        daysOfWeekRaw: r.daysOfWeek,
        startTime: r.startTime,
        endTime: r.endTime,
        sessionType: r.sessionType,
        isActive: r.isActive,
      })),
      overrides: overrides.map((o) => ({
        id: o.id,
        date: o.date,
        startTime: o.startTime,
        endTime: o.endTime,
        isAvailable: o.isAvailable,
        sessionType: o.sessionType,
        isActive: o.isActive,
      })),
    };
  }
}
