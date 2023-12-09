import mongoose from 'mongoose';

export const ArticlesSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  url: { type: String },
  domain: { type: String },
  title: { type: String },
  category_url: { type: String },
  category: { type: String },
  time: { type: Date },
  content: { type: String },
  img_urls: [{ type: String }],
  title_english: { type: String, default: '' },
  content_english: { type: String, default: '' },
});

export interface Article extends mongoose.Document {
  uuid: string;
  url: string;
  domain: string;
  title: string;
  category_url: string;
  category: string;
  time: Date;
  content: string;
  img_urls: string;
  title_english: string;
  content_english: string;
}
