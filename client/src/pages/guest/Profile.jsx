import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [country, setCountry] = useState(user?.address?.country || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');
    setProfileErr('');

    try {
      const res = await authService.updateProfile({
        name,
        phone,
        address: { city, country },
      });
      if (res.success && res.data?.user) {
        updateUserProfile(res.data.user);
        setProfileMsg('Profile updated successfully!');
      }
    } catch (err) {
      setProfileErr(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMsg('');
    setPassErr('');

    if (newPassword !== confirmPassword) {
      setPassErr('New passwords do not match');
      setPassLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setPassErr('New password must be at least 8 characters');
      setPassLoading(false);
      return;
    }

    try {
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
      });
      if (res.success) {
        setPassMsg('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPassErr(err.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-extrabold text-dark mb-1">Account & Profile Settings</h2>
        <p className="text-muted small">Manage personal details, contact preferences, and security.</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Profile Card */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 h-100">
            <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-3">
              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3"
                style={{ width: '64px', height: '64px' }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-dark">{user?.name}</h4>
                <div className="text-muted small">{user?.email}</div>
                <span className="badge bg-warning text-dark text-uppercase small mt-1">
                  {user?.designation || user?.role}
                </span>
              </div>
            </div>

            {profileMsg && <div className="alert alert-success py-2 small">{profileMsg}</div>}
            {profileErr && <div className="alert alert-danger py-2 small">{profileErr}</div>}

            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="row g-2 mb-4">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary fw-bold px-4"
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Password Change Card */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 h-100">
            <h5 className="fw-bold mb-3 border-bottom pb-3">
              <i className="bi bi-shield-lock me-2 text-primary"></i>Change Security Password
            </h5>

            {passMsg && <div className="alert alert-success py-2 small">{passMsg}</div>}
            {passErr && <div className="alert alert-danger py-2 small">{passErr}</div>}

            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-outline-dark fw-bold px-4"
                disabled={passLoading}
              >
                {passLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
