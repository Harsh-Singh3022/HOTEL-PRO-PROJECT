import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/common/BrandLogo';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    // Password regex check (FR-AUTH-2)
    const hasUpper = /[A-Z]/.test(formData.password);
    const hasLower = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    if (!hasUpper || !hasLower || !hasNumber) {
      return setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    setLoading(true);

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: {
          city: formData.city,
          country: formData.country,
        },
      });

      if (res.success) {
        navigate('/my-bookings');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-md-3">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="mb-2">
                <BrandLogo size={48} textColor="text-dark" />
              </div>
              <p className="text-muted small mt-2">Create your guest account for faster bookings and reward rates</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small rounded-3" role="alert">
                <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Aarav Sharma"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="aarav@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="+1 555-0199"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    placeholder="e.g. Miami"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Country</label>
                  <input
                    type="text"
                    name="country"
                    className="form-control"
                    placeholder="e.g. USA"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Min. 8 characters"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="form-text" style={{ fontSize: '11px' }}>
                    Requires uppercase, lowercase, & number
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Re-type password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 fw-bold shadow-sm mt-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Registering...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="text-center mt-4 text-muted small">
              Already registered?{' '}
              <Link to="/login" className="fw-bold text-primary text-decoration-none">
                Sign In here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
