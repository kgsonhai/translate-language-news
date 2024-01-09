import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { translate } from 'bing-translate-api';
import { Model } from 'mongoose';

import { HttpService } from '@nestjs/axios';
import { Score } from 'src/entities/score.entity';
import { Session } from 'src/entities/session.entity';
import { Article } from 'src/schemas/article.schema';
import { Repository } from 'typeorm';
import { splitIntoChunks } from './utils';

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
    try {
      const sessionById = await this.sessionRepository.findOneBy({
        id: sessionId,
      });
      console.log('SAVE SESSION STARTED', sessionById);
      if (sessionById) {
        sessionById.finishedTime = new Date();
        sessionById.status = 'FINISHED';
        console.log('SAVE SESSION FINISHED');
        return this.sessionRepository.save(sessionById);
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  async handleSaveAudio(sessionId, uuid, text) {
    const endpoint = 'http://localhost:3001/convert-audio-vi-to-en';
    const result = await this.httpService.post(endpoint, {
      uuid,
      text,
    });

    result.subscribe(async (response) => {
      const MAX_RETRIES = 10;
      let retries = 0;
      while (retries < MAX_RETRIES) {
        try {
          const score = await this.scoreRepository.findOneBy({
            articleId: uuid,
            sessionId: sessionId,
          });

          if (response?.data?.msg?.uuid) {
            score.audioPathEn = `https://graduation-project-api.s3.amazonaws.com/${response?.data?.msg?.uuid}`;
            const res = await this.scoreRepository.save(score);
            console.log({ uuid: res?.articleId, session: res?.sessionId });
          }

          break;
        } catch (error) {
          console.log(
            `Transaction failed (attempt ${retries + 1}/${MAX_RETRIES}):`,
          );
          retries++;
          await new Promise((resolve) => setTimeout(resolve, 10000));
        }
      }

      if (retries === MAX_RETRIES) {
        console.error('Max retries reached. Unable to complete transaction.');
      }
    });
  }

  async convertLanguage(sessionId) {
    try {
      const scores = (
        await this.scoreRepository.find({
          where: {
            sessionId: sessionId,
          },
        })
      ).filter((score) => score.score > 0);

      const articles = await this.articleModel.find().exec();

      const scoresUuid = scores.map((score) => score.articleId);

      const listUpdatedScore = articles.filter((article) =>
        scoresUuid.includes(article.uuid),
      );

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

      const updateContentsPromise = translations.map(
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
      await Promise.all(updateContentsPromise);

      for (let i = 0; i < translations.length; i++) {
        const { articleUuid, translatedTitle, translatedContent } =
          translations[i];
        this.handleSaveAudio(
          sessionId,
          articleUuid,
          translatedTitle + '.' + translatedContent,
        );
        await new Promise((resolve) => setTimeout(resolve, 15000));
      }

      this.saveSession(sessionId);
    } catch (error) {
      const sessionById = await this.sessionRepository.findOneBy({
        id: sessionId,
      });
      sessionById.finishedTime = new Date();
      sessionById.status = 'FAILED';
      this.sessionRepository.save(sessionById);
      Logger.error(error);
    }
  }

  async translateText(text, currentLang) {
    console.log({ text });
    if (currentLang === 'vi') {
      return await translate(text, 'vi', 'en');
    }
    return await translate(text, 'en', 'vi');
  }
}
