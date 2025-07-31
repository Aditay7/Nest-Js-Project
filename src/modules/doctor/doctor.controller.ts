import {
  Controller,
  Post,
  Patch,
  Delete,
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
import {
  DayOfWeek,
  SessionType,
} from 'src/lib/db/entities/doctor-availability.entity';

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
  @Get('search')
  async getAllDoctors(
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.doctorService.getAllDoctors(search, pageNum, limitNum);
  }

  // --- Availability Management ---
  @Post('availability/regular')
  async setRegular(
    @Request() req,
    @Body()
    body: {
      availabilities: Array<{
        daysOfWeek: DayOfWeek[];
        startTime: string;
        endTime: string;
        sessionType?: SessionType;
      }>;
    },
  ) {
    if (
      !Array.isArray(body.availabilities) ||
      body.availabilities.length === 0
    ) {
      throw new BadRequestException('availabilities array required');
    }
    return this.doctorService.setRegularAvailability(
      req.user.userId,
      body.availabilities,
    );
  }

  // Legacy endpoint for backward compatibility
  @Post('availability/regular/legacy')
  async setRegularLegacy(
    @Request() req,
    @Body()
    body: {
      availabilities: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
      }>;
    },
  ) {
    if (
      !Array.isArray(body.availabilities) ||
      body.availabilities.length === 0
    ) {
      throw new BadRequestException('availabilities array required');
    }
    return this.doctorService.setRegularAvailabilityLegacy(
      req.user.userId,
      body.availabilities,
    );
  }

  @Post('availability/override')
  async setOverride(
    @Request() req,
    @Body()
    body: {
      date: string;
      startTime?: string;
      endTime?: string;
      isAvailable?: boolean;
      sessionType?: SessionType;
    },
  ) {
    if (!body.date) throw new BadRequestException('date is required');
    return this.doctorService.setOverride(req.user.userId, body);
  }

  @Patch('availability/override/status')
  async updateOverrideStatus(
    @Request() req,
    @Body() body: { date: string; isActive: boolean },
  ) {
    if (!body.date) throw new BadRequestException('date is required');
    if (typeof body.isActive !== 'boolean')
      throw new BadRequestException('isActive is required and must be boolean');
    return this.doctorService.updateOverrideStatus(
      req.user.userId,
      body.date,
      body.isActive,
    );
  }

  @Delete('availability/override')
  async cancelOverride(@Request() req, @Query('date') date: string) {
    if (!date) throw new BadRequestException('date is required');
    return this.doctorService.cancelOverride(req.user.userId, date);
  }

  @Get('availability/regular')
  async getRegularAvailabilities(
    @Request() req,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const includeInactiveBool = includeInactive === 'true';
    return this.doctorService.getRegularAvailabilities(
      req.user.userId,
      includeInactiveBool,
    );
  }

  @Patch('availability/regular/:id/status')
  async updateAvailabilityStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    if (typeof body.isActive !== 'boolean')
      throw new BadRequestException('isActive is required and must be boolean');
    return this.doctorService.updateAvailabilityStatus(
      req.user.userId,
      parseInt(id, 10),
      body.isActive,
    );
  }

  @Get('availability')
  async getAvailability(@Request() req, @Query('date') date: string) {
    if (!date) throw new BadRequestException('date is required');
    return this.doctorService.getAvailabilityForDate(req.user.userId, date);
  }

  // --- Slot Management ---
  @Post('slots')
  async createSlot(
    @Request() req,
    @Body()
    body: {
      date: string;
      startTime: string;
      endTime: string;
      capacity?: number;
      sessionType?: SessionType;
    },
  ) {
    return this.doctorService.createSlot(req.user.userId, body);
  }

  @Patch('slots/:id')
  async updateSlot(
    @Request() req,
    @Param('id') id: string,
    @Body()
    body: {
      startTime?: string;
      endTime?: string;
      capacity?: number;
      sessionType?: SessionType;
    },
  ) {
    return this.doctorService.updateSlot(
      req.user.userId,
      parseInt(id, 10),
      body,
    );
  }

  @Patch('slots/:id/status')
  async updateSlotStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    if (typeof body.isActive !== 'boolean')
      throw new BadRequestException('isActive is required and must be boolean');
    return this.doctorService.updateSlotStatus(
      req.user.userId,
      parseInt(id, 10),
      body.isActive,
    );
  }

  @Delete('slots/:id')
  async deleteSlotPermanently(@Request() req, @Param('id') id: string) {
    return this.doctorService.deleteSlotPermanently(
      req.user.userId,
      parseInt(id, 10),
    );
  }

  @Get('slots')
  async listSlots(
    @Request() req,
    @Query('date') date?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const includeInactiveBool = includeInactive === 'true';
    return this.doctorService.listSlots(
      req.user.userId,
      date,
      includeInactiveBool,
    );
  }
}
