import { useEffect, useState } from 'react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import YouTube from 'react-youtube';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState('');
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchFavorites = async () => {
      try {
        const res = await api.get('/favorites');
        setFavorites(res.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [userInfo, navigate]);

  const removeFavorite = async (movieId) => {
    try {
      await api.delete(`/favorites/${movieId}`);
      setFavorites(favorites.filter(f => f.movie._id !== movieId));
    } catch (error) {
      console.error(error);
      alert('Error removing favorite');
    }
  };

  const playTrailer = async (movie) => {
    let activeMovie = movie;
    if (!movie.trailerLink) {
      try {
        const res = await api.get(`/movies/${movie._id || movie.id}`);
        activeMovie = res.data;
      } catch (error) {
        console.error('Failed to fetch movie details for trailer', error);
      }
    }
    let ytId = '';
    if (activeMovie.trailerLink && activeMovie.trailerLink.includes('v=')) {
      ytId = activeMovie.trailerLink.split('v=')[1].split('&')[0];
    }
    setCurrentTrailer(ytId);
    setModalOpen(true);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-netRed pl-2">My Favorites</h2>
      
      {favorites.length === 0 ? (
        <p className="text-gray-400">You haven't saved any movies to your favorites yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {favorites.map(fav => (
            <div key={fav._id} className="relative group">
              <MovieCard movie={fav.movie} onPlayTrailer={playTrailer} onAddFavorite={() => {}} />
              <button 
                onClick={() => removeFavorite(fav.movie._id)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-800 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {currentTrailer ? (
          <YouTube videoId={currentTrailer} opts={{ width: '100%', height: '500', playerVars: { autoplay: 1 } }} />
        ) : (
          <div className="p-10 text-center bg-zinc-900 rounded">
            <h3 className="text-xl text-white">Trailer is currently unavailable.</h3>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Favorites;
