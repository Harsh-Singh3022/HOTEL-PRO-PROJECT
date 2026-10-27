import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';

const ManageStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add staff modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Staff@123');
  const [designation, setDesignation] = useState('Receptionist');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({ role: 'staff', limit: 50 });
      if (res.success) {
        setStaffList(res.data.users || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load staff accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const res = await userService.updateUser(user._id, {
        isActive: !user.isActive,
      });
      if (res.success) {
        fetchStaff();
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userService.createStaff({
        name,
        email,
        phone,
        password,
        designation,
        role: 'staff',
      });
      if (res.success) {
        setShowAddModal(false);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('Staff@123');
        fetchStaff();
      }
    } catch (err) {
      alert('Failed to create staff member: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (id, staffName) => {
    if (!window.confirm(`Delete staff account for ${staffName}?`)) return;
    try {
      await userService.deleteUser(id);
      fetchStaff();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <span className="badge bg-dark px-3 py-1.5 rounded-pill text-uppercase mb-2">
            Human Resources & Staff
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Staff Account Management</h2>
          <p className="text-muted small mb-0">Create and oversee staff accounts across Front Desk, Housekeeping, and Management.</p>
        </div>
        <button className="btn btn-primary fw-bold mt-3 mt-md-0" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-person-plus-fill me-1"></i> Add Staff Member
        </button>
      </div>

      {error && <div className="alert alert-danger rounded-3">{error}</div>}

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : staffList.length === 0 ? (
          <div className="text-center py-5 text-muted">No staff accounts registered.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Staff Name</th>
                  <th>Designation / Role</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Account Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="fw-bold text-dark">{s.name}</div>
                      <div className="text-muted small">Registered: {new Date(s.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1">
                        {s.designation || 'Staff'}
                      </span>
                    </td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td>
                      {s.isActive ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          Active
                        </span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className={`btn ${s.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          title={s.isActive ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleActive(s)}
                        >
                          {s.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title="Delete Account"
                          onClick={() => handleDeleteStaff(s._id, s.name)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Provision New Staff Member</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddStaff}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Liam Chen"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="staff@hotelpro.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+1 555-0101"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Designation</label>
                      <select
                        className="form-select"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                      >
                        <option value="Receptionist">Receptionist / Front Desk</option>
                        <option value="Housekeeping">Housekeeping Supervisor</option>
                        <option value="Manager">Duty Manager</option>
                        <option value="Maintenance">Maintenance Technician</option>
                        <option value="Concierge">Concierge</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Temporary Password</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold" disabled={saving}>
                    {saving ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;
