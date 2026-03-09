import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrending, setPopular } from '../redux/slices/movieSlice';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import YouTube from 'react-youtube';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FaPlay, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch();
  const { trending, popular } = useSelector((state) => state.movies);
  const { userInfo } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [moviesPage, setMoviesPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [infiniteMovies, setInfiniteMovies] = useState([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [trendingRes, popularRes] = await Promise.allSettled([
          api.get('/movies/trending'),
          api.get('/movies/popular')
        ]);
        
        if (trendingRes.status === 'fulfilled') {
          dispatch(setTrending(trendingRes.value.data));
        } else {
          console.error('Failed to fetch trending movies', trendingRes.reason);
        }

        if (popularRes.status === 'fulfilled') {
          dispatch(setPopular(popularRes.value.data));
          setInfiniteMovies(popularRes.value.data);
        } else {
          console.error('Failed to fetch popular movies', popularRes.reason);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Critical failure in fetchMovies', error);
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, [dispatch]);

  const fetchMoreData = async () => {
    try {
      // In a real app we'd pass page number. Here we just fetch popular again or random.
      const res = await api.get('/movies/popular'); // mock next page
      
      setTimeout(() => {
        setInfiniteMovies(prev => [...prev, ...res.data]);
        setMoviesPage(prev => prev + 1);
        if (moviesPage >= 5) setHasMore(false); // Stop after 5 pages for demo
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  };

  const playTrailer = async (movie) => {
    let activeMovie = movie;
    
    // If trailer is missing (common in list views), fetch details
    if (!movie.trailerLink) {
      try {
        const res = await api.get(`/movies/${movie._id || movie.id}`);
        activeMovie = res.data;
      } catch (error) {
        console.error('Failed to fetch movie details for trailer', error);
      }
    }

    // Attempt extracting youtube ID
    let ytId = '';
    if (activeMovie.trailerLink && activeMovie.trailerLink.includes('v=')) {
      ytId = activeMovie.trailerLink.split('v=')[1].split('&')[0];
    }
    
    // Add to history if logged in (send the most complete data we have)
    if (userInfo) {
       api.post('/history', { 
         movieId: activeMovie._id,
         title: activeMovie.title,
         poster: activeMovie.poster,
         releaseDate: activeMovie.releaseDate,
         vote_average: activeMovie.vote_average
       }).catch(console.error);
    }
    
    setCurrentTrailer(ytId);
    setModalOpen(true);
  };

  const addFavorite = async (movie) => {
    if (!userInfo) return alert('Please login to add favorites');
    try {
      await api.post('/favorites', { 
        movieId: movie._id,
        title: movie.title,
        poster: movie.poster,
        releaseDate: movie.releaseDate,
        vote_average: movie.vote_average
      });
      alert('Added to favorites!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add favorite');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Common props for cards
  const cardProps = { onPlayTrailer: playTrailer, onAddFavorite: addFavorite };

  const heroMovie = trending[0];

  return (
    <div className="pb-8">
      {/* Hero Section */}
      {heroMovie && (
        <div className="relative w-full h-[85vh] text-white">
          <div className="absolute w-full h-full">
            <img 
              src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path || heroMovie.backdrop || heroMovie.poster}`} 
              alt={heroMovie.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-dark to-transparent" />
          </div>
          
          <div className="absolute top-[30%] left-4 md:left-12 lg:left-16 w-full md:w-[50%] p-4 z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4 drop-shadow-xl"
            >
              {heroMovie.title || heroMovie.name}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-gray-200 text-sm md:text-base lg:text-lg mb-6 line-clamp-3 drop-shadow-md"
            >
              {heroMovie.overview}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex gap-4"
            >
              <button 
                onClick={() => playTrailer(heroMovie)}
                className="bg-white text-black px-6 py-2 md:px-8 md:py-3 rounded flex items-center justify-center gap-2 font-bold hover:bg-gray-200 transition"
              >
                <FaPlay size={18} /> Play
              </button>
              <Link
                to={`/movie/${heroMovie._id || heroMovie.id}`}
                className="bg-gray-500/70 text-white px-6 py-2 md:px-8 md:py-3 rounded flex items-center justify-center gap-2 font-bold hover:bg-gray-500/90 transition"
              >
                <FaInfoCircle size={20} /> More Info
              </Link>
            </motion.div>
          </div>
        </div>
      )}

      {/* Content wrapper with negative margin to overlap hero */}
      <div className="relative z-20 px-4 md:px-12 lg:px-16 -mt-32">
        {/* Trending Section */}
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-white drop-shadow-md px-2">Trending Movies</h2>
        <div className="flex overflow-x-auto gap-4 pb-10 mb-6 scrollbar-hide">
          {/* Skip the first movie as it is the Hero */}
          {trending.slice(1).map((movie, index) => (
            <div key={`trending-${movie._id}-${index}`} className="w-36 md:w-48 lg:w-56 flex-none">
              <MovieCard movie={movie} {...cardProps} />
            </div>
          ))}
        </div>

        {/* Infinite Scroll Section */}
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-white px-2">Discover Popular</h2>
        <InfiniteScroll
          dataLength={infiniteMovies.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<Loader />}
          endMessage={<p className="text-center text-gray-400 mt-4 pb-8">You have seen it all!</p>}
          className="overflow-visible"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-10 px-2 pb-10 overflow-visible">
            {infiniteMovies.map((movie, index) => (
              <div key={`popular-${movie._id}-${index}`} className="w-full">
                <MovieCard movie={movie} {...cardProps} />
              </div>
            ))}
          </div>
        </InfiniteScroll>
      </div>

      {/* Trailer Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {currentTrailer ? (
          <YouTube 
            videoId={currentTrailer} 
            opts={{ width: '100%', height: '500', playerVars: { autoplay: 1 } }} 
          />
        ) : (
          <div className="p-10 text-center">
            <h3 className="text-2xl text-white">Trailer for this movie is currently unavailable.</h3>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
