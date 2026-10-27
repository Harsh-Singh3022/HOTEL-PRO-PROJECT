import React from 'react';

const StatusBadge = ({ status, type = 'room' }) => {
  if (type === 'room') {
    switch (status) {
      case 'Available':
        return <span className="badge badge-available px-2.5 py-1.5"><i className="bi bi-check-circle-fill me-1"></i> Available</span>;
      case 'Occupied':
        return <span className="badge badge-occupied px-2.5 py-1.5"><i className="bi bi-person-fill me-1"></i> Occupied</span>;
      case 'Cleaning':
        return <span className="badge badge-cleaning px-2.5 py-1.5"><i className="bi bi-stars me-1"></i> Cleaning</span>;
      case 'Maintenance':
        return <span className="badge badge-maintenance px-2.5 py-1.5"><i className="bi bi-tools me-1"></i> Maintenance</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  }

  // Booking or payment status
  switch (status) {
    case 'Confirmed':
      return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1"><i className="bi bi-calendar-check me-1"></i> Confirmed</span>;
    case 'CheckedIn':
      return <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1"><i className="bi bi-box-arrow-in-right me-1"></i> Checked In</span>;
    case 'CheckedOut':
      return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2.5 py-1"><i className="bi bi-box-arrow-right me-1"></i> Checked Out</span>;
    case 'Cancelled':
      return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1"><i className="bi bi-x-circle me-1"></i> Cancelled</span>;
    case 'Paid':
      return <span className="badge bg-success px-2 py-1"><i className="bi bi-check-circle me-1"></i> Paid</span>;
    case 'PartiallyPaid':
      return <span className="badge bg-warning text-dark px-2 py-1"><i className="bi bi-pie-chart me-1"></i> Partial</span>;
    case 'Pending':
      return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1"><i className="bi bi-clock me-1"></i> Pending</span>;
    case 'Refunded':
      return <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1"><i className="bi bi-arrow-counterclockwise me-1"></i> Refunded</span>;
    default:
      return <span className="badge bg-secondary">{status}</span>;
  }
};

export default StatusBadge;
