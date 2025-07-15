import { DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../lib/db/entities/*.entity.ts'],
  migrations: [__dirname + '/../lib/db/migrations/*.ts'],
  synchronize: false,
};

export const typeOrmModuleConfig: TypeOrmModuleOptions = typeOrmConfig as TypeOrmModuleOptions;
