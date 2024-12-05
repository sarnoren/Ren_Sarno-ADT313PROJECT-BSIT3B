import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './Main.css';

function Main() {
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      setTimeout(() => {
        localStorage.removeItem('accessToken');
        navigate('/login');
      }, 3000);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
    }
  }, [accessToken, navigate]);

  const disabledLinkStyle = {
    pointerEvents: 'none',
    cursor: 'not-allowed',
    textDecoration: 'none',
    opacity: 0.6,
  };

  return (
    <div className='Main'>
      <div className='container'>
        <div className='navigation'>
          <ul>
            <li>
              <a
                style={disabledLinkStyle}
                onClick={(e) => e.preventDefault()}
              >
                Movies
              </a>
            </li>
            <li>
              <a onClick={() => navigate('/home')}>Home</a>
            </li>
            {accessToken ? (
              <li className='logout'>
                <a onClick={handleLogout}>Logout</a>
              </li>
            ) : (
              <li className='login'>
                <a onClick={() => navigate('/login')}>Login</a>
              </li>
            )}
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
