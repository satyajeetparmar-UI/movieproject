import { useState, useEffect } from 'react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import YouTube from 'react-youtube';
import { useSelector } from 'react-redux';

// Hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState('');

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (debouncedSearchTerm) {
      doSearch(debouncedSearchTerm);
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  const doSearch = async (query) => {
    setLoading(true);
    try {
      const res = await api.get('/movies/search', { params: { query } });
      setResults(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const playTrailer = async (movie) => {
    let activeMovie = movie;
    
    // If trailer is missing, fetch full details (including videos)
    if (!movie.trailerLink) {
      try {
        const res = await api.get(`/movies/${movie.id || movie._id}`);
        activeMovie = res.data;
      } catch (error) {
        console.error('Failed to fetch movie details for trailer', error);
      }
    }

    if (userInfo) {
      api.post('/history', { 
        movieId: activeMovie._id || activeMovie.id,
        title: activeMovie.title,
        poster: activeMovie.poster || activeMovie.poster_path,
        releaseDate: activeMovie.releaseDate,
        vote_average: activeMovie.vote_average
      }).catch(console.error);
    }

    let ytId = '';
    if (activeMovie.trailerLink && activeMovie.trailerLink.includes('v=')) {
      ytId = activeMovie.trailerLink.split('v=')[1].split('&')[0];
    }
    setCurrentTrailer(ytId);
    setModalOpen(true);
  };

  const addFavorite = async (movie) => {
    if (!userInfo) return alert('Please login to add favorites');
    try {
      await api.post('/favorites', { 
        movieId: movie.id || movie._id,
        title: movie.title,
        poster: movie.poster || movie.poster_path,
        releaseDate: movie.releaseDate,
        vote_average: movie.vote_average
      });
      alert('Added to favorites!');
    } catch (e) {
      alert('Error adding favorite');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <div className="max-w-2xl mx-auto mb-10 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search movies, TV shows, actors..."
          className="w-full bg-zinc-900 border border-white/20 rounded-full px-6 py-4 text-white focus:outline-none focus:border-[#E50914] transition"
          autoFocus
        />
        {loading && <div className="absolute right-6 top-4"><Loader /></div>}
      </div>

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-10">
          {results.map(movie => (
            <MovieCard
              key={movie.id || movie._id}
              movie={{ ...movie, _id: movie.id || movie._id }}
              onPlayTrailer={playTrailer}
              onAddFavorite={addFavorite}
            />
          ))}
        </div>
      )}

      {!loading && debouncedSearchTerm && results.length === 0 && (
        <p className="text-center text-gray-400 mt-20">No results found for "{debouncedSearchTerm}"</p>
      )}

      {!debouncedSearchTerm && (
        <p className="text-center text-gray-500 mt-20">Type to search millions of movies from TMDB...</p>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {currentTrailer ? (
          <YouTube videoId={currentTrailer} opts={{ width: '100%', height: '500', playerVars: { autoplay: 1 } }} />
        ) : (
          <div className="p-10 text-center bg-zinc-900 rounded">
            <h3 className="text-xl text-white">Trailer not available for this movie.</h3>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Search;

