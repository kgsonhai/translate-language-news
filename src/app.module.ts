import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mysqlOrmConfig } from './config/data-source';
import { ConvertTextModule } from './modules/convert-text/convert-text.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/scraper-news'),
    TypeOrmModule.forRoot(mysqlOrmConfig),
    ConvertTextModule,
  ],
})
export class AppModule {}
