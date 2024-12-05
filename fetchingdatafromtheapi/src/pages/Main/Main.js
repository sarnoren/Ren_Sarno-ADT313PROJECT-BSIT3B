import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Main.css';

function Main() {
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem('accessToken');
      navigate('/');
    }
  };

  useEffect(() => {
    if (!accessToken) {
      handleLogout();
    }
  }, [accessToken, navigate]);

  return (
    <div className='Main'>
      <div className='container'>
        <div className='navigation'>
          <ul>
            <li>
              <a
                href="/main/dashboard"
                style={{
                  color: location.pathname === '/main/dashboard' ? 'gray' : 'blue',
                  pointerEvents: 'none',
                  opacity: 0.6,
                  textDecoration: 'none',
                }}
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                href='/main/movies'
                style={{
                  color: location.pathname === '/main/movies' ? 'green' : 'inherit',
                }}
              >
                Movies
              </a>
            </li>
            <li className='logout'>
              <a onClick={handleLogout}>Logout</a>
            </li>
          </ul>
        </div>
        <div className='outlet'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Main;
