import { Schema, Document } from 'mongoose';

export interface Admin extends Document {
  email: string;
  fullName: string;
  picture: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AdminSchema = new Schema({
  email: { type: String, required: true },
  fullName: { type: String },
  picture: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});
