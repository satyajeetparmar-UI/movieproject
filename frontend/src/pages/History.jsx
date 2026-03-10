import { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await api.get('/history');
        setHistory(res.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userInfo, navigate]);

  if (loading) return <div className="h-screen flex flex-col items-center justify-center"><Loader /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-netRed pl-2">Watch History</h2>
      
      {history.length === 0 ? (
        <p className="text-gray-400">You haven't watched any trailers or visited any movie pages yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map(item => (
            <Link 
              key={item._id} 
              to={`/movie/${item.movie._id}`}
              className="group bg-[#1a1a1a] p-3 rounded-lg flex items-center gap-4 hover:bg-[#252525] transition border border-transparent hover:border-white/10"
            >
              <div className="relative w-16 h-24 flex-none overflow-hidden rounded-md shadow-lg">
                <img 
                  src={item.movie?.poster?.startsWith('http') ? item.movie.poster : `https://image.tmdb.org/t/p/w200${item.movie.poster}`} 
                  alt={item.movie.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150x225?text=No+Poster' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white group-hover:text-red-600 transition truncate">
                  {item.movie.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Watched on: {new Date(item.watchedAt).toLocaleDateString()} at {new Date(item.watchedAt).toLocaleTimeString()}
                </p>
                {item.movie.vote_average && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-green-500 font-bold text-[10px]">{(item.movie.vote_average * 10).toFixed(0)}% Match</span>
                  </div>
                )}
              </div>
              <div className="text-gray-500 group-hover:text-white px-2">
                <span className="text-xl font-bold">V</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
