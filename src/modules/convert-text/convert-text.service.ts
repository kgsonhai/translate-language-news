import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { translate } from 'bing-translate-api';
import { Model } from 'mongoose';

import { Score } from 'src/entities/score.entity';
import { Article } from 'src/schemas/article.schema';
import { IsNull, Not, Repository } from 'typeorm';
import { sleep, splitArrayIntoSubarrays, splitIntoChunks } from './utils';
import { HttpService } from '@nestjs/axios';
import { Session } from 'src/entities/session.entity';

@Injectable()
export class ConvertTextService {
  constructor(
    @InjectRepository(Score)
    private readonly scoreRepository: Repository<Score>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectModel('Article') private readonly articleModel: Model<Article>,
    private readonly httpService: HttpService,
  ) {}

  async saveSession(sessionId) {
    const sessionById = await this.sessionRepository.findOneBy({
      id: sessionId,
    });
    sessionById.finishedTime = new Date().toString();
    sessionById.status = 'FINISHED';
    return await this.sessionRepository.save(sessionById);
  }

  async handleSaveAudio(sessionId, uuid, text) {
    try {
      const endpoint = 'http://localhost:3001/convert-audio-vi-to-en';
      const result = await this.httpService.post(endpoint, {
        uuid,
        text,
      });
      return result.subscribe(async (resonse) => {
        const score = await this.scoreRepository.findOneBy({
          articleId: uuid,
          sessionId: sessionId,
        });
        console.log({ res: resonse.data.msg.uuid });
        if (resonse.data.msg.uuid) {
          score.audioPathEn = `https://graduation-project-api.s3.amazonaws.com/${resonse?.data?.msg?.uuid}`;
          const res = await this.scoreRepository.save(score);
          console.log({ uuid: res?.articleId, session: res?.sessionId });
        }
      });
    } catch (error) {
      console.log({ error });
    }
  }

  async convertLanguage(sessionId) {
    const scores = await this.scoreRepository.find({
      where: {
        sessionId: sessionId,
        audioPath: Not(IsNull()),
      },
    });

    const articles = await this.articleModel.find().exec();

    const scoresUuid = scores.map((score) => score.articleId);

    const listUpdatedScore = articles.filter((article) =>
      scoresUuid.includes(article.uuid),
    );

    try {
      const translationPromises = listUpdatedScore.map(async (article) => {
        const translatedContent = [];

        for (const contentGroup of splitIntoChunks(article.content)) {
          const translation = await translate(contentGroup, 'vi', 'en');
          translatedContent.push(translation?.translation || '');
        }

        const finalTranslatedContent = translatedContent.join('.');

        const translatedTitle = await translate(article.title, 'vi', 'en');

        return {
          articleUuid: article.uuid,
          translatedTitle: translatedTitle?.translation.trim(),
          translatedContent: finalTranslatedContent.trim(),
        };
      });

      const translations = await Promise.all(translationPromises);

      const updateContentPromises = await translations.map(
        async ({ articleUuid, translatedTitle, translatedContent }: any) => {
          return await this.articleModel.updateOne(
            { uuid: articleUuid },
            {
              $set: {
                content_english: translatedContent,
                title_english: translatedTitle,
              },
            },
          );
        },
      );
      await Promise.all(updateContentPromises);

      for (const translation of translations) {
        const { articleUuid, translatedTitle, translatedContent } = translation;
        await this.handleSaveAudio(
          sessionId,
          articleUuid,
          translatedTitle + '.' + translatedContent,
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      return await this.saveSession(sessionId);
    } catch (error) {
      console.log({ error });
    }
  }
}
