import mongoose from 'mongoose';

const watchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    movie: {
      type: String,   // TMDB ID
      required: true,
    },
    title: {
      type: String,
    },
    poster: {
      type: String,
    },
    releaseDate: {
      type: String,
    },
    vote_average: {
      type: Number,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);

export default WatchHistory;
