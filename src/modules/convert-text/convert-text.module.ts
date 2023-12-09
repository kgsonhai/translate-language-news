import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from 'src/entities/score.entity';
import { ConvertTextController } from './convert-text.controller';
import { ConvertTextService } from './convert-text.service';
import { ArticlesSchema } from 'src/schemas/article.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { Session } from 'src/entities/session.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Score, Session]),
    MongooseModule.forFeature([{ name: 'Article', schema: ArticlesSchema }]),
  ],
  controllers: [ConvertTextController],
  providers: [ConvertTextService],
})
export class ConvertTextModule {}
