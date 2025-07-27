import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Doctor } from 'src/lib/db/entities/doctor.entity';
import { User } from 'src/lib/db/entities/user.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    const query = this.doctorRepository.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user');
    if (search) {
      query.where(
        'doctor.specialization ILIKE :search OR doctor.qualifications ILIKE :search OR user.name ILIKE :search',
        { search: `%${search}%` }
      );
    }
    query.skip((page - 1) * limit).take(limit);
    const [doctors, total] = await query.getManyAndCount();
    return { doctors, total, page, limit };
  }
}
