import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/api';

const Reports = () => {
  const [occupancyReport, setOccupancyReport] = useState([]);
  const [revenueReport, setRevenueReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportingCsv, setExportingCsv] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [occRes, revRes] = await Promise.all([
        dashboardService.getOccupancyReport(),
        dashboardService.getRevenueReport(),
      ]);

      if (occRes.success) setOccupancyReport(occRes.data?.report || []);
      if (revRes.success) setRevenueReport(revRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load report analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExportingCsv(true);
    try {
      const token = localStorage.getItem('hotelpro_token');
      const response = await fetch('http://localhost:5000/api/v1/reports/bookings?format=csv', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to download CSV');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hotelpro-bookings-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('CSV Export failed: ' + err.message);
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <span className="badge bg-dark px-3 py-1.5 rounded-pill text-uppercase mb-2">
            Audit & Intelligence
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Occupancy & Revenue Reports</h2>
          <p className="text-muted small mb-0">Deep hospitality KPIs, ADR, RevPAR, category yield, and data export.</p>
        </div>
        <button
          className="btn btn-success fw-bold mt-3 mt-md-0"
          onClick={handleExportCSV}
          disabled={exportingCsv}
        >
          {exportingCsv ? (
            'Generating CSV...'
          ) : (
            <>
              <i className="bi bi-file-earmark-spreadsheet-fill me-1"></i> Export Bookings CSV
            </>
          )}
        </button>
      </div>

      {error && <div className="alert alert-danger rounded-3">{error}</div>}

      {/* KPI Overview Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <span className="text-secondary small fw-semibold text-uppercase">14-Day Revenue</span>
            <h3 className="fw-extrabold text-primary mt-2 mb-0">
              ${revenueReport?.summary?.totalRevenue?.toLocaleString() ?? 0}
            </h3>
            <span className="text-muted small">Confirmed paid volume</span>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <span className="text-secondary small fw-semibold text-uppercase">Total Room Nights Sold</span>
            <h3 className="fw-extrabold text-success mt-2 mb-0">
              {revenueReport?.summary?.roomsSold ?? 0}
            </h3>
            <span className="text-muted small">Stay units across past 14 days</span>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <span className="text-secondary small fw-semibold text-uppercase">Average Daily Rate (ADR)</span>
            <h3 className="fw-extrabold text-warning-emphasis mt-2 mb-0">
              ${revenueReport?.summary?.averageDailyRate ?? 0}
            </h3>
            <span className="text-muted small">Revenue ÷ rooms sold</span>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <span className="text-secondary small fw-semibold text-uppercase">RevPAR (Yield)</span>
            <h3 className="fw-extrabold text-dark mt-2 mb-0">
              ${revenueReport?.summary?.revenuePerAvailableRoom ?? 0}
            </h3>
            <span className="text-muted small">Revenue per available inventory room</span>
          </div>
        </div>
      </div>

      {/* Occupancy by Room Category */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <h5 className="fw-bold mb-3"><i className="bi bi-door-open-fill text-primary me-2"></i>Occupancy by Room Category</h5>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Category Name</th>
                  <th>Base Rate</th>
                  <th>Total Rooms</th>
                  <th>Occupied Now</th>
                  <th>Available Now</th>
                  <th>Occupancy Rate</th>
                </tr>
              </thead>
              <tbody>
                {occupancyReport.map((item) => (
                  <tr key={item.roomTypeId}>
                    <td className="fw-bold text-dark">{item.roomTypeName}</td>
                    <td className="text-muted">${item.basePrice} / nt</td>
                    <td>{item.totalRooms} rooms</td>
                    <td className="fw-semibold text-danger">{item.occupied}</td>
                    <td className="fw-semibold text-success">{item.available}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: '8px' }}>
                          <div
                            className={`progress-bar ${item.occupancyPercentage > 75 ? 'bg-danger' : item.occupancyPercentage > 40 ? 'bg-primary' : 'bg-success'}`}
                            role="progressbar"
                            style={{ width: `${item.occupancyPercentage}%` }}
                          ></div>
                        </div>
                        <span className="fw-bold small">{item.occupancyPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Revenue Velocity Breakdown */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <h5 className="fw-bold mb-3"><i className="bi bi-calendar3 text-success me-2"></i>Daily Revenue Ledger</h5>
        <div className="table-responsive">
          <table className="table table-sm table-striped align-middle">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Transactions Count</th>
                <th className="text-end">Revenue Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              {revenueReport?.dailyData?.map((d, i) => (
                <tr key={i}>
                  <td className="fw-medium">{d.date}</td>
                  <td>{d.count} booking transactions</td>
                  <td className="text-end fw-bold text-dark">${d.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
