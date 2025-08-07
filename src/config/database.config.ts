import { DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
require('dotenv').config();

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  // Support both individual env vars and DATABASE_URL (Render provides DATABASE_URL)
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(
    process.env.DATABASE_PORT || process.env.DB_PORT || '5432',
    10,
  ),
  username: process.env.DATABASE_USERNAME || process.env.DB_USERNAME,
  password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.DATABASE_NAME || process.env.DB_NAME,
  entities: [path.join(__dirname, '/../lib/db/entities/*.entity.{js,ts}')],
  migrations: [path.join(__dirname, '/../lib/db/migrations/*.ts')],
  synchronize: process.env.NODE_ENV !== 'production', // false in production, true in development
  migrationsRun: process.env.NODE_ENV === 'production', // Run migrations automatically in production
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  logging: process.env.NODE_ENV !== 'production',
};

export const typeOrmModuleConfig: TypeOrmModuleOptions =
  typeOrmConfig as TypeOrmModuleOptions;
