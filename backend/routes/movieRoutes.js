import express from 'express';
import {
  getTrendingMovies,
  getPopularMovies,
  searchMovies,
  getMovieById,
} from '../controllers/movieController.js';

const router = express.Router();

router.get('/trending', getTrendingMovies);
router.get('/popular', getPopularMovies);
router.get('/search', searchMovies);
router.get('/:id', getMovieById);

export default router;
