import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  question?: mongoose.Types.ObjectId;
  video?: mongoose.Types.ObjectId;
}

const BookmarkSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: Schema.Types.ObjectId, ref: 'Question' },
  video: { type: Schema.Types.ObjectId, ref: 'Video' }
}, { timestamps: true });

export default mongoose.model('Bookmark', BookmarkSchema);
