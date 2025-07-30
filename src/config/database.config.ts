import { DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
require('dotenv').config();

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [path.join(__dirname, '/../lib/db/entities/*.entity.{js,ts}')],
  migrations: [path.join(__dirname, '/../lib/db/migrations/*.ts')],
  synchronize: false, // Changed to false for migration-based schema management
  logging: true,
};

export const typeOrmModuleConfig: TypeOrmModuleOptions =
  typeOrmConfig as TypeOrmModuleOptions;
