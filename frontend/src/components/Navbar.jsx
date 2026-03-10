import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-[#141414] shadow-md py-4' : 'bg-gradient-to-b from-black/80 to-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 md:px-12 lg:px-16 flex justify-between items-center transition-all">
        <Link to="/" className="text-3xl lg:text-4xl font-black text-[#E50914] tracking-tight drop-shadow-md">
          MOVIEVERSE
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/search" className="text-gray-300 hover:text-white transition">
            <FaSearch size={22} />
          </Link>

          {userInfo ? (
            <div className="flex items-center gap-4 group relative">
              <span className="cursor-pointer flex items-center gap-2">
                <FaUserCircle size={28} className="text-gray-300 hover:text-white transition drop-shadow-md" />
              </span>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 rounded border border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 shadow-2xl">
                <div className="px-4 py-2 border-b border-gray-800 font-bold hidden md:block text-white">{userInfo.name}</div>
                <Link to="/favorites" className="px-4 py-3 hover:bg-gray-800 transition text-sm text-gray-300 hover:text-white">My Favorites</Link>
                <Link to="/history" className="px-4 py-3 hover:bg-gray-800 transition text-sm text-gray-300 hover:text-white">Watch History</Link>
                {userInfo.role === 'admin' && (
                  <Link to="/admin" className="px-4 py-3 hover:bg-gray-800 transition text-sm text-[#E50914] font-semibold">Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="px-4 py-3 text-left hover:bg-gray-800 transition text-sm text-gray-300 hover:text-white border-t border-gray-800 mt-1">
                  Sign out of MovieVerse
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-[#E50914] hover:bg-[#b8070f] text-white px-5 py-2 rounded font-medium transition shadow-md"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
