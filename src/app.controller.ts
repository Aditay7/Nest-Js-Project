import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHome() {
    return {
      message: 'Server is running perfectly! 🚀',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())} seconds`,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      endpoints: {
        health: '/health',
        healthSimple: '/health/simple',
        auth: '/auth/login',
        users: '/user',
        doctors: '/doctor',
        patients: '/patient',
      },
      description: 'Schedula Backend - Elastic Scheduling System',
    };
  }
}
