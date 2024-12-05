import { useState, useRef, useCallback, useEffect } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../utils/hooks/useDebounce';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFieldsDirty, setIsFieldsDirty] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const debouncedInputs = useDebounce({ email, password }, 2000);
  const [status, setStatus] = useState('idle');
  
  const navigate = useNavigate();

  const handleShowPassword = useCallback(() => {
    setIsShowPassword(prev => !prev);
  }, []);

  const handleOnChange = (event, type) => {
    setIsFieldsDirty(true);

    if (type === 'email') setEmail(event.target.value);
    else if (type === 'password') setPassword(event.target.value);
  };

  const handleLogin = async () => {
    try {
      setStatus('loading');
      const { data } = await axios.post('/user/login', { email, password });
      localStorage.setItem('accessToken', data.access_token);
      navigate('/home');
    } catch (error) {
      console.error(error);
    } finally {
      setStatus('idle');
    }
  };

  useEffect(() => {
    if (debouncedInputs.email && debouncedInputs.password) {
      setStatus('idle');
    }
  }, [debouncedInputs]);

  return (
    <div className="Login">
      <div className="main-container">
        <h3>Sign In</h3>
        <form>
          <div className="form-container">
            <div>
              <div className="form-group">
                <label htmlFor="email">E-mail:</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  ref={emailRef}
                  value={email}
                  onChange={(e) => handleOnChange(e, 'email')}
                  aria-describedby="email-error"
                />
                {isFieldsDirty && !email && (
                  <span id="email-error" className="errors">This field is required</span>
                )}
              </div>
            </div>
            <div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  id="password"
                  type={isShowPassword ? 'text' : 'password'}
                  name="password"
                  ref={passwordRef}
                  value={password}
                  onChange={(e) => handleOnChange(e, 'password')}
                  aria-describedby="password-error"
                />
                {isFieldsDirty && !password && (
                  <span id="password-error" className="errors">This field is required</span>
                )}
              </div>
            </div>
            <div className="show-password" onClick={handleShowPassword}>
              {isShowPassword ? 'Hide' : 'Show'} Password
            </div>

            <div className="submit-container">
              <button
                className="btn-primary"
                type="button"
                disabled={status === 'loading'}
                onClick={() => {
                  if (status === 'loading') return;

                  if (email && password) {
                    setStatus('loading');
                    setTimeout(handleLogin, 2000); // Delay before login
                  } else {
                    setIsFieldsDirty(true);
                    if (!email) emailRef.current.focus();
                    if (!password) passwordRef.current.focus();
                  }
                }}
              >
                {status === 'idle' ? 'Login' : 'Wait...'}
              </button>
            </div>
            <div className="register-container">
              <small>Don't have an account? </small>
              <a href="/register">
                <small>Register</small>
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
