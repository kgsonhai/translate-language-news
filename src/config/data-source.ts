import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

export const mysqlOrmConfig = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'r00t',
  database: 'scraper_news',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  timezone: 'Z',
  dateStrings: true,
  charset: 'utf8mb4',
  logging: ['error'],
} as unknown as TypeOrmModuleOptions;

export const dataSource = new DataSource(mysqlOrmConfig as DataSourceOptions);
