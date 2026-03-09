import { Link } from 'react-router-dom';
import { FaPlay, FaHeart, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MovieCard = ({ movie, onPlayTrailer, onAddFavorite }) => {
  const getYear = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('-')[0];
  };

  const getPoster = (posterPath) => {
    if (!posterPath) return 'https://via.placeholder.com/500x750?text=No+Poster';
    if (posterPath.startsWith('http')) return posterPath;
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  return (
    <motion.div
      initial={{ scale: 1 }}
      whileHover={{ 
        scale: 1.1, 
        zIndex: 50,
        transition: { duration: 0.3 }
      }}
      className="relative group cursor-pointer aspect-[2/3] w-full rounded-md overflow-hidden bg-zinc-900 shadow-2xl"
    >
      {/* Clicking the poster or card body navigates to details */}
      <Link to={`/movie/${movie._id || movie.id}`} className="block w-full h-full">
        <img
          src={getPoster(movie.poster)}
          alt={movie.title}
          className="w-full h-full object-cover rounded-md transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent flex flex-col justify-end p-4"
        >
          <motion.h3 
            initial={{ y: 10, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-white font-bold text-base md:text-lg leading-tight mb-2 line-clamp-2 drop-shadow-md"
          >
            {movie.title}
          </motion.h3>
          
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex items-center flex-wrap gap-2 text-[10px] md:text-xs text-gray-300 font-semibold mb-4"
          >
            <span className="text-green-500 font-bold">{(movie.vote_average * 10 || 0).toFixed(0)}% Match</span>
            <span className="border border-gray-600 px-1 rounded text-gray-400 capitalize">{getYear(movie.releaseDate)}</span>
            <span className="border border-gray-600 px-1 rounded text-red-500 font-bold">HD</span>
            <span className="flex items-center gap-1">
              <FaStar className="text-yellow-400" size={10} />
              {(movie.vote_average || 0).toFixed(1)}
            </span>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex gap-2"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevents navigating to details
                onPlayTrailer(movie);
              }}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white hover:bg-gray-200 text-black rounded-full shadow-lg transition transform hover:scale-110 active:scale-95"
              title="Play Trailer"
            >
              <FaPlay size={12} className="ml-1" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddFavorite(movie);
              }}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[#2a2a2a]/80 hover:bg-[#3a3a3a] text-white rounded-full transition border border-gray-500 transform hover:scale-110 active:scale-95"
              title="Add to Favorites"
            >
              <FaHeart size={14} />
            </button>
            
            {/* Navigates to details too - but redundant since card is a link, kept for icon feel */}
            <div className="ml-auto w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[#2a2a2a]/80 hover:bg-[#3a3a3a] text-white rounded-full transition border border-gray-500 transform hover:scale-110">
              <span className="text-lg font-bold">V</span>
            </div>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
