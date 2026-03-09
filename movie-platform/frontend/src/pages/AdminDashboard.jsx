import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { FaTrash, FaEdit, FaBan } from 'react-icons/fa';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Movie Form specific
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', poster: '', description: '', movieId: '',
    releaseDate: '', trailerUrl: '', genre: '', category: 'movie'
  });

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [userInfo, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [moviesRes, usersRes] = await Promise.all([
        api.get('/movies/popular'), // Fetching all/popular movies
        api.get('/admin/users')
      ]);
      setMovies(moviesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
      alert('Error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/movies', formData);
      alert('Movie added successfully');
      setShowForm(false);
      fetchData();
      setFormData({
        title: '', poster: '', description: '', movieId: '',
        releaseDate: '', trailerUrl: '', genre: '', category: 'movie'
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding movie');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await api.delete(`/admin/movies/${id}`);
        setMovies(movies.filter((m) => m._id !== id));
      } catch (error) {
        alert('Error deleting movie');
      }
    }
  };

  const handleToggleBan = async (id) => {
    try {
      const res = await api.patch(`/admin/ban-user/${id}`);
      setUsers(users.map((u) => u._id === id ? { ...u, isBanned: res.data.isBanned } : u));
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating user status');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-netRed">Admin Dashboard</h2>

      <div className="flex gap-4 mb-8 border-b border-gray-700 pb-2">
        <button
          className={`px-4 py-2 font-semibold ${activeTab === 'movies' ? 'text-netRed border-b-2 border-netRed' : 'text-gray-400'}`}
          onClick={() => setActiveTab('movies')}
        >
          Manage Movies
        </button>
        <button
          className={`px-4 py-2 font-semibold ${activeTab === 'users' ? 'text-netRed border-b-2 border-netRed' : 'text-gray-400'}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
      </div>

      {activeTab === 'movies' && (
        <div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-6 bg-netRed hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            {showForm ? 'Cancel' : '+ Add New Movie'}
          </button>

          {showForm && (
            <form onSubmit={handleAddMovie} className="mb-10 p-6 glass rounded-xl space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Title" className="p-3 bg-dark/50 border border-gray-600 rounded text-white" />
                <input required type="number" name="movieId" value={formData.movieId} onChange={handleInputChange} placeholder="TMDB ID" className="p-3 bg-dark/50 border border-gray-600 rounded text-white" />
                <input type="text" name="poster" value={formData.poster} onChange={handleInputChange} placeholder="Poster URL or Path" className="p-3 bg-dark/50 border border-gray-600 rounded text-white" />
                <input type="text" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange} placeholder="Release Date (YYYY-MM-DD)" className="p-3 bg-dark/50 border border-gray-600 rounded text-white" />
                <input type="text" name="trailerUrl" value={formData.trailerUrl} onChange={handleInputChange} placeholder="Trailer URL (e.g. YouTube video link)" className="p-3 bg-dark/50 border border-gray-600 rounded text-white" />
                <input type="text" name="genre" value={formData.genre} onChange={handleInputChange} placeholder="Genre (comma separated)" className="p-3 bg-dark/50 border border-gray-600 rounded text-white" />
              </div>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" rows="3" className="w-full p-3 bg-dark/50 border border-gray-600 rounded text-white"></textarea>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-3 bg-dark/50 border border-gray-600 rounded text-white mb-4">
                <option value="movie">Movie</option>
                <option value="tv">TV Show</option>
              </select>
              <button type="submit" className="w-full bg-netRed hover:bg-red-700 text-white font-bold py-3 rounded transition">
                Save Movie
              </button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/10 text-gray-300">
                  <th className="p-4 rounded-tl-lg">ID</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 rounded-tr-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="p-4 text-gray-400">{movie.movieId}</td>
                    <td className="p-4 font-semibold">{movie.title}</td>
                    <td className="p-4 capitalize">{movie.category || 'Movie'}</td>
                    <td className="p-4 text-right flex justify-end gap-3">
                      <button onClick={() => handleDeleteMovie(movie._id)} className="text-red-500 hover:text-red-400 transition" title="Delete">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead>
              <tr className="bg-white/10 text-gray-300">
                <th className="p-4 rounded-tl-lg">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-4 font-semibold">{user.name}</td>
                  <td className="p-4 text-gray-400">{user.email}</td>
                  <td className="p-4 capitalize">{user.role}</td>
                  <td className="p-4">{user.isBanned ? <span className="text-red-500 font-semibold">Banned</span> : <span className="text-green-500 font-semibold">Active</span>}</td>
                  <td className="p-4 text-right">
                    {user.role !== 'admin' && (
                      <button 
                        onClick={() => handleToggleBan(user._id)} 
                        className={`transition px-3 py-1 rounded text-sm ${user.isBanned ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                      >
                         {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
