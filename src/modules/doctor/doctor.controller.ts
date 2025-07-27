import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('doctor')
@UseGuards(JwtAuthGuard)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post('register')
  async register(@Request() req, @Body() body) {
    if (
      !body.specialization ||
      !body.years_of_experience ||
      !body.qualifications
    )
      throw new BadRequestException(
        'specialization, years_of_experience, and qualifications are required',
      );
    const doctor = await this.doctorService.createDoctor(req.user.userId, body);
    return { message: 'Doctor registered successfully', doctor };
  }

  @Patch('update')
  async update(@Request() req, @Body() body) {
    const doctor = await this.doctorService.updateDoctor(req.user.userId, body);
    return { message: 'Doctor profile updated successfully', doctor };
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const doctor = await this.doctorService.getDoctorById(req.user.userId);
    return { doctor };
  }

  @Get(':id')
  async getDoctorById(@Param('id') id: number) {
    const doctor = await this.doctorService.getDoctorById(id);
    return { doctor };
  }

  /**
   * Get all doctors with optional search and pagination
   * @param search (optional) search string for specialization, qualifications, or name
   * @param page (optional) page number (default 1)
   * @param limit (optional) page size (default 10)
   */
  @Get()
  async getAllDoctors(
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.doctorService.getAllDoctors(search, pageNum, limitNum);
  }
}
