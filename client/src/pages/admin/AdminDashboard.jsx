import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, revRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getRevenueReport(),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (revRes.success) setRevenueData(revRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load executive dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Prepare Doughnut Chart Data (Room Status Breakdown)
  const roomStatusData = {
    labels: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
    datasets: [
      {
        data: [
          summary?.roomStatusBreakdown?.Available || 0,
          summary?.roomStatusBreakdown?.Occupied || 0,
          summary?.roomStatusBreakdown?.Cleaning || 0,
          summary?.roomStatusBreakdown?.Maintenance || 0,
        ],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#64748b'],
        borderWidth: 2,
      },
    ],
  };

  // Prepare Bar Chart Data (Revenue Trends over past 14 days)
  const barChartData = {
    labels: revenueData?.dailyData?.map((d) => d.date.slice(5)) || [],
    datasets: [
      {
        label: 'Daily Revenue ($)',
        data: revenueData?.dailyData?.map((d) => d.revenue) || [],
        backgroundColor: '#1e3a8a',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <span className="badge bg-dark px-3 py-1.5 rounded-pill text-uppercase mb-2">
            Executive Analytics
          </span>
          <h2 className="fw-extrabold text-dark mb-0">General Manager Dashboard</h2>
          <p className="text-muted small mb-0">Real-time occupancy metrics, daily revenue performance, and room status overview.</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <Link to="/admin/reports" className="btn btn-outline-dark fw-semibold">
            <i className="bi bi-file-earmark-bar-graph me-1"></i> Full Reports & CSV
          </Link>
          <Link to="/admin/rooms" className="btn btn-primary fw-bold">
            <i className="bi bi-door-closed me-1"></i> Manage Rooms
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger rounded-3">{error}</div>}

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 stat-card bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Current Occupancy</span>
              <div className="p-2 bg-primary-subtle text-primary rounded-3"><i className="bi bi-pie-chart-fill"></i></div>
            </div>
            <h2 className="fw-extrabold text-primary mb-1">{summary?.kpi?.occupancyRate ?? 0}%</h2>
            <div className="text-muted small">
              {summary?.kpi?.occupiedRooms ?? 0} of {summary?.kpi?.totalRooms ?? 0} active rooms occupied
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 stat-card bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Today's Revenue</span>
              <div className="p-2 bg-success-subtle text-success rounded-3"><i className="bi bi-cash-stack"></i></div>
            </div>
            <h2 className="fw-extrabold text-success mb-1">${Number(summary?.kpi?.todayRevenue ?? 0).toLocaleString()}</h2>
            <div className="text-muted small">
              This week: ${Number(summary?.kpi?.weekRevenue ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 stat-card bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Average Daily Rate</span>
              <div className="p-2 bg-warning-subtle text-warning-emphasis rounded-3"><i className="bi bi-graph-up-arrow"></i></div>
            </div>
            <h2 className="fw-extrabold text-dark mb-1">${revenueData?.summary?.averageDailyRate ?? 0}</h2>
            <div className="text-muted small">
              RevPAR: ${revenueData?.summary?.revenuePerAvailableRoom ?? 0}
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 stat-card bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small fw-semibold text-uppercase">Today's Movements</span>
              <div className="p-2 bg-info-subtle text-info rounded-3"><i className="bi bi-arrow-left-right"></i></div>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <div>
                <span className="fs-4 fw-bold text-success">{summary?.kpi?.todayCheckIns ?? 0}</span>
                <span className="small text-muted ms-1">Arrivals</span>
              </div>
              <div className="vr"></div>
              <div>
                <span className="fs-4 fw-bold text-danger">{summary?.kpi?.todayCheckOuts ?? 0}</span>
                <span className="small text-muted ms-1">Departures</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Revenue Velocity (Past 14 Days)</h5>
              <span className="badge bg-light text-secondary border">Total: ${revenueData?.summary?.totalRevenue?.toLocaleString()}</span>
            </div>
            <div style={{ maxHeight: '280px' }}>
              {revenueData?.dailyData?.length > 0 ? (
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              ) : (
                <div className="text-center py-5 text-muted">No revenue data available</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold mb-3">Room Inventory Status</h5>
            <div style={{ maxHeight: '250px' }} className="d-flex justify-content-center">
              <Doughnut
                data={roomStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Latest Reservations</h5>
          <Link to="/admin/bookings" className="btn btn-sm btn-outline-primary fw-semibold">
            View All ({summary?.recentBookings?.length || 0})
          </Link>
        </div>

        {summary?.recentBookings?.length === 0 ? (
          <div className="text-center py-4 text-muted">No bookings recorded yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Ref #</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Stay Dates</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary?.recentBookings?.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold text-primary small">{b.bookingRef}</td>
                    <td className="fw-semibold text-dark">{b.guest?.fullName || 'Walk-in'}</td>
                    <td>Room {b.room?.roomNumber} ({b.room?.roomType?.name})</td>
                    <td className="small text-muted">
                      {new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}
                    </td>
                    <td><StatusBadge status={b.status} type="booking" /></td>
                    <td><StatusBadge status={b.paymentStatus} type="payment" /></td>
                    <td className="fw-bold text-dark">${Number(b.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
