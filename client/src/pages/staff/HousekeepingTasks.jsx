import React, { useState, useEffect } from 'react';
import { taskService, roomService, userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const HousekeepingTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // New task modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roomId, setRoomId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'ALL') params.status = filterStatus;

      const [taskRes, roomRes, userRes] = await Promise.all([
        taskService.getTasks(params),
        roomService.getRooms({ limit: 100 }),
        userService.getUsers({ role: 'staff' }).catch(() => ({ data: { users: [] } })),
      ]);

      if (taskRes.success) setTasks(taskRes.data.tasks || []);
      if (roomRes.success) setRooms(roomRes.data.rooms || []);
      if (userRes.success) {
        setStaffUsers(userRes.data?.users || []);
        if (userRes.data?.users?.length > 0 && !assignedTo) {
          setAssignedTo(userRes.data.users[0]._id);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load task queue');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await taskService.updateStatus(taskId, newStatus);
      if (res.success) {
        fetchTasks();
      }
    } catch (err) {
      alert('Failed to update task: ' + err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title || !assignedTo) return;

    setCreating(true);
    try {
      const res = await taskService.createTask({
        title,
        description,
        room: roomId || null,
        assignedTo,
        priority,
        dueDate: dueDate || null,
      });

      if (res.success) {
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setRoomId('');
        fetchTasks();
      }
    } catch (err) {
      alert('Could not create task: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <span className="badge bg-warning text-dark px-3 py-1.5 rounded-pill text-uppercase mb-2">
            Operations & Housekeeping
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Housekeeping & Task Dispatch</h2>
          <p className="text-muted small mb-0">Track room cleaning, sanitation, and facility maintenance workflows.</p>
        </div>
        <button
          className="btn btn-primary fw-bold mt-3 mt-md-0"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg me-1"></i> Assign New Task
        </button>
      </div>

      {error && <div className="alert alert-danger rounded-3">{error}</div>}

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-1">
        {['ALL', 'Pending', 'InProgress', 'Done'].map((st) => (
          <button
            key={st}
            className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold ${filterStatus === st ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setFilterStatus(st)}
          >
            {st === 'ALL' ? 'All Tasks' : st}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="fs-1 text-muted mb-2"><i className="bi bi-check-all"></i></div>
          <h5 className="fw-bold">No Tasks In Queue</h5>
          <p className="text-muted small">All rooms and housekeeping assignments are up to date.</p>
        </div>
      ) : (
        <div className="row g-3">
          {tasks.map((task) => {
            let priorityBadge = 'bg-secondary';
            if (task.priority === 'High') priorityBadge = 'bg-danger';
            if (task.priority === 'Medium') priorityBadge = 'bg-warning text-dark';

            return (
              <div key={task._id} className="col-lg-6">
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 card-hover">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`badge ${priorityBadge} px-2.5 py-1 text-uppercase`} style={{ fontSize: '10px' }}>
                      {task.priority} Priority
                    </span>
                    <span className={`badge ${task.status === 'Done' ? 'bg-success' : task.status === 'InProgress' ? 'bg-primary' : 'bg-warning-subtle text-warning-emphasis border'}`}>
                      {task.status}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">{task.title}</h5>
                  <p className="text-secondary small mb-3">{task.description || 'No additional instructions.'}</p>

                  <div className="bg-light p-3 rounded-3 mb-3 small text-secondary">
                    <div className="d-flex justify-content-between mb-1">
                      <span><strong>Target Room:</strong></span>
                      <span>{task.room ? `Room ${task.room.roomNumber}` : 'General Property'}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span><strong>Assigned To:</strong></span>
                      <span className="fw-semibold text-dark">{task.assignedTo?.name} ({task.assignedTo?.designation || 'Staff'})</span>
                    </div>
                    {task.dueDate && (
                      <div className="d-flex justify-content-between">
                        <span><strong>Target Completion:</strong></span>
                        <span>{new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Toggle Actions */}
                  <div className="d-flex gap-2 mt-auto pt-2 border-top">
                    {task.status !== 'InProgress' && task.status !== 'Done' && (
                      <button
                        className="btn btn-outline-primary btn-sm fw-semibold w-100"
                        onClick={() => handleUpdateStatus(task._id, 'InProgress')}
                      >
                        <i className="bi bi-play-circle me-1"></i> Start Task
                      </button>
                    )}
                    {task.status !== 'Done' && (
                      <button
                        className="btn btn-success btn-sm fw-semibold w-100"
                        onClick={() => handleUpdateStatus(task._id, 'Done')}
                      >
                        <i className="bi bi-check2-circle me-1"></i> Mark Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Dispatch New Workflow Task</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Task Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Sanitize Room 102 & Restock Linens"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description / Notes</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Specific cleaning instructions, minibar restock, or maintenance note"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Associated Room</label>
                      <select
                        className="form-select"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                      >
                        <option value="">No Room (General)</option>
                        {rooms.map((r) => (
                          <option key={r._id} value={r._id}>Room #{r.roomNumber}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Priority</label>
                      <select
                        className="form-select"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Assign Staff Member</label>
                    <select
                      className="form-select"
                      required
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                    >
                      {staffUsers.length > 0 ? (
                        staffUsers.map((s) => (
                          <option key={s._id} value={s._id}>{s.name} ({s.designation || 'Staff'})</option>
                        ))
                      ) : (
                        <option value={user?._id}>{user?.name} (Current User)</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold" disabled={creating}>
                    {creating ? 'Assigning...' : 'Dispatch Task'}
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

export default HousekeepingTasks;
