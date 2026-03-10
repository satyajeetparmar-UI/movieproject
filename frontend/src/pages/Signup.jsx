import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import api from '../services/api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) navigate('/');
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/signup', { name, email, password });
      dispatch(setCredentials({ ...res.data }));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
      {/* Background Image Setup */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/f85718e8-fc6d-4954-bca0-f5faaf788fd9/db645733-4f10-48e0-ae30-9bb6da0d85ab/US-en-20231016-popsignuptwoweeks-perspective_alpha_website_large.jpg')" }}
      ></div>
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 max-w-[450px] w-full space-y-8 bg-black/75 p-16 rounded-md">
        <div>
          <h2 className="text-3xl font-bold text-white mb-8">
            Sign Up
          </h2>
        </div>
        <form className="mt-8 space-y-4" onSubmit={submitHandler}>
          {error && <div className="bg-[#e87c03] text-white p-3 rounded text-sm mb-4">{error}</div>}
          <div className="rounded-md space-y-4">
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded relative block w-full px-5 py-4 border-0 placeholder-gray-400 text-white bg-[#333] focus:outline-none focus:bg-[#454545] focus:ring-2 focus:ring-white transition"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded relative block w-full px-5 py-4 border-0 placeholder-gray-400 text-white bg-[#333] focus:outline-none focus:bg-[#454545] focus:ring-2 focus:ring-white transition"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded relative block w-full px-5 py-4 border-0 placeholder-gray-400 text-white bg-[#333] focus:outline-none focus:bg-[#454545] focus:ring-2 focus:ring-white transition"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded relative block w-full px-5 py-4 border-0 placeholder-gray-400 text-white bg-[#333] focus:outline-none focus:bg-[#454545] focus:ring-2 focus:ring-white transition"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent text-md font-bold rounded text-white bg-[#E50914] hover:bg-[#c11119] transition mt-6 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <div className="mt-16 text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-white hover:underline transition font-medium">
            Sign In now.
          </Link>
          <p className="text-xs text-[#8c8c8c] mt-4">
            This page is protected by Google reCAPTCHA to ensure you're not a bot. 
            <span className="text-blue-600 hover:underline cursor-pointer ml-1">Learn more.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
