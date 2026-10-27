import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/common/BrandLogo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.success) {
        const userRole = res.data.user.role;
        if (redirectPath) {
          navigate(redirectPath, { replace: true });
        } else if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'staff') {
          navigate('/staff');
        } else {
          navigate('/my-bookings');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="container py-5 my-md-4">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="mb-2">
                <BrandLogo size={48} textColor="text-dark" />
              </div>
              <p className="text-muted small mt-2">Sign in to manage reservations, express check-in, or front desk</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small rounded-3" role="alert">
                <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-secondary border-end-0">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light text-secondary border-end-0">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    placeholder="Enter password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Quick-fill demo credentials */}
            <div className="mt-4 pt-3 border-top">
              <div className="small fw-bold text-uppercase text-secondary mb-2 text-center" style={{ fontSize: '11px' }}>
                🚀 Quick Demo Credentials
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm w-100 text-truncate"
                    onClick={() => handleQuickFill('admin@hotelpro.com', 'Admin@123')}
                  >
                    👑 Admin
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm w-100 text-truncate"
                    onClick={() => handleQuickFill('receptionist@hotelpro.com', 'Staff@123')}
                  >
                    🛎️ Receptionist
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-outline-warning btn-sm w-100 text-truncate"
                    onClick={() => handleQuickFill('housekeeping@hotelpro.com', 'Staff@123')}
                  >
                    🧹 Housekeeping
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm w-100 text-truncate"
                    onClick={() => handleQuickFill('guest@example.com', 'Guest@123')}
                  >
                    🧳 Guest User
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center mt-4 text-muted small">
              Don't have an account?{' '}
              <Link to="/register" className="fw-bold text-primary text-decoration-none">
                Register as a Guest
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
