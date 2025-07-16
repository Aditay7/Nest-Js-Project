import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/lib/db/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createFromGoogle({
    email,
    name,
  }: {
    email: string;
    name: string;
  }): Promise<User> {
    const user = this.userRepository.create({
      email,
      name,
      password: '',
      gender: '',
      dob: new Date(),
      phone: '',
      address: '',
    });
    return this.userRepository.save(user);
  }

  async updateUserProfile(
    userId: number,
    update: Partial<User>,
  ): Promise<void> {
    await this.userRepository.update(userId, update);
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.userRepository.delete({ email });
  }
}
