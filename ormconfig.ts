import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';
import { typeOrmConfig } from './src/config/database.config';

export const AppDataSource = new DataSource(typeOrmConfig);