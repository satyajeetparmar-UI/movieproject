import WatchHistory from '../models/WatchHistory.js';

// @desc    Get user watch history
// @route   GET /api/history
// @access  Private
const getHistory = async (req, res, next) => {
  try {
    const history = await WatchHistory.find({ user: req.user._id })
      .sort({ watchedAt: -1 });

    // Transform to maintain compatibility with frontend which expects item.movie.title etc.
    const transformed = history.map(item => ({
      ...item._doc,
      movie: {
        _id: item.movie,
        title: item.title,
        poster: item.poster,
        releaseDate: item.releaseDate,
        vote_average: item.vote_average
      }
    }));

    res.json(transformed);
  } catch (error) {
    next(error);
  }
};

// @desc    Add entry to watch history
// @route   POST /api/history
// @access  Private
const addHistory = async (req, res, next) => {
  try {
    const { movieId, title, poster, releaseDate, vote_average } = req.body;

    // Check if entry for this movie already exists for this user, if so update/remove old
    await WatchHistory.findOneAndDelete({ user: req.user._id, movie: movieId });

    const historyEntry = await WatchHistory.create({
      user: req.user._id,
      movie: movieId,
      title,
      poster,
      releaseDate,
      vote_average,
      watchedAt: Date.now(), // Explicitly set watchedAt for the new entry
    });

    res.status(201).json(historyEntry);
  } catch (error) {
    next(error);
  }
};

export { getHistory, addHistory };
