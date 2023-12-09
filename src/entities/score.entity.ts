import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'scores' })
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id' })
  sessionId: number;

  @Column({ name: 'article_id' })
  articleId: string;

  @Column({ name: 'url' })
  url: string;

  @Column({ name: 'category' })
  category: string;

  @Column({ name: 'domain' })
  domain: string;

  @Column({ name: 'score' })
  score: string;

  @Column({ name: 'audio_path' })
  audioPath: string;

  @Column({ name: 'audio_path_en' })
  audioPathEn: string;

  @Column({ name: 'img_urls' })
  imgUrls: string;
}
