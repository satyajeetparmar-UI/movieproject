import Movie from '../models/Movie.js';
import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper to call TMDB API — reads the key lazily so dotenv has time to load
// Added retry logic and timeout for better resilience against network issues (like ECONNRESET)
const tmdb = async (path, params = {}, retries = 3) => {
  try {
    return await axios.get(`${TMDB_BASE_URL}${path}`, {
      params: { api_key: process.env.TMDB_API_KEY, language: 'en-US', ...params },
      timeout: 10000, // 10 second timeout
    });
  } catch (error) {
    // Retry on specific network errors
    const retryCodes = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'];
    if (retries > 0 && (retryCodes.includes(error.code) || !error.response)) {
      console.warn(`TMDB Request failed (${error.code || 'Network Error'}), retrying... (${retries} retries left)`);
      // Wait a bit before retrying (exponential backoff could be added but simple 500ms for now)
      await new Promise(resolve => setTimeout(resolve, 500));
      return tmdb(path, params, retries - 1);
    }
    throw error;
  }
};


// Normalize TMDB movie shape → our frontend field names
const normalize = (m) => ({
  _id: String(m.id),
  id: m.id,
  title: m.title || m.name,
  overview: m.overview,
  description: m.overview,
  poster: m.poster_path,          // our MovieCard uses movie.poster
  poster_path: m.poster_path,
  backdrop: m.backdrop_path,
  backdrop_path: m.backdrop_path,
  releaseDate: m.release_date || m.first_air_date,
  vote_average: m.vote_average,
  genre: m.genre_ids,             // genre names only available on detail call
  trailerLink: '',
});

// @desc    Get trending movies (from TMDB)
// @route   GET /api/movies/trending
// @access  Public
const getTrendingMovies = async (req, res, next) => {
  try {
    const { data } = await tmdb('/trending/movie/week');
    res.json(data.results.map(normalize));
  } catch (error) {
    console.error('TMDB Trending Error:', error.message);
    res.json([]); // Return empty instead of 500 for list UI
  }
};

// @desc    Get popular movies (from TMDB)
// @route   GET /api/movies/popular
// @access  Public
const getPopularMovies = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const { data } = await tmdb('/movie/popular', { page });
    res.json(data.results.map(normalize));
  } catch (error) {
    console.error('TMDB Popular Error:', error.message);
    res.json([]); // Return empty instead of 500 for list UI
  }
};

// @desc    Search movies (from TMDB)
// @route   GET /api/movies/search?query=...
// @access  Public
const searchMovies = async (req, res, next) => {
  try {
    const query = req.query.query;
    if (!query) return res.json([]);
    const { data } = await tmdb('/search/movie', { query, page: 1 });
    res.json(data.results.map(normalize));
  } catch (error) {
    next(error);
  }
};

// @desc    Get movie by TMDB ID  (number) or MongoDB ObjectId
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // If id looks like a MongoDB ObjectId, check the local DB first
    if (/^[a-f\d]{24}$/i.test(id)) {
      const localMovie = await Movie.findById(id);
      if (localMovie) return res.json(localMovie);
    }

    // Otherwise treat as a TMDB movie ID
    const { data } = await tmdb(`/movie/${id}`, { append_to_response: 'videos' });

    // Normalise the response to match our frontend field names
    const movie = {
      _id: String(data.id),
      title: data.title,
      overview: data.overview,
      description: data.overview,
      poster: data.poster_path,
      backdrop: data.backdrop_path,
      backdrop_path: data.backdrop_path,
      releaseDate: data.release_date,
      vote_average: data.vote_average,
      genre: data.genres?.map((g) => g.name),
      trailerLink: (() => {
        const clip = data.videos?.results?.find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        );
        return clip ? `https://www.youtube.com/watch?v=${clip.key}` : '';
      })(),
    };

    res.json(movie);
  } catch (error) {
    next(error);
  }
};

export { getTrendingMovies, getPopularMovies, searchMovies, getMovieById };

