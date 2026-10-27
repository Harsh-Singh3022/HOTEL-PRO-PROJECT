import React, { useRef } from 'react';
import BrandLogo from './BrandLogo';

const InvoiceModal = ({ show, onClose, invoice }) => {
  if (!show || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const booking = invoice.booking;
  const guest = booking?.guest;
  const room = booking?.room;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow border-0 rounded-4">
          <div className="modal-header bg-dark text-white rounded-top-4 no-print">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-receipt me-2 text-warning"></i>
              Invoice #{invoice.invoiceNumber}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 printable-invoice">
            {/* Header branding */}
            <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
              <div>
                <BrandLogo size={32} textColor="text-dark" />
                <p className="text-muted small mb-0 mt-2">Luxury Living & Grand Worldwide Hospitality</p>
                <p className="text-muted small mb-0">100 Ocean Boulevard, Miami FL 33101</p>
                <p className="text-muted small mb-0">concierge@hotelpro.com | +1 (800) 555-ROOM</p>
              </div>
              <div className="text-end">
                <span className="badge bg-primary fs-6 px-3 py-2 mb-2">INVOICE</span>
                <div className="fw-bold">Invoice: {invoice.invoiceNumber}</div>
                <div className="text-muted small">Date: {new Date(invoice.issuedAt || invoice.createdAt).toLocaleDateString()}</div>
                <div className="fw-semibold text-secondary small">Booking Ref: {booking?.bookingRef}</div>
              </div>
            </div>

            {/* Billed To & Stay details */}
            <div className="row mb-4">
              <div className="col-sm-6">
                <h6 className="fw-bold text-uppercase text-secondary small">Billed To:</h6>
                <div className="fw-bold">{guest?.fullName || 'Valued Guest'}</div>
                <div className="text-muted small">Phone: {guest?.phone || 'N/A'}</div>
                <div className="text-muted small">Email: {guest?.email || 'N/A'}</div>
                {guest?.address?.city && (
                  <div className="text-muted small">{guest.address.city}, {guest.address.country}</div>
                )}
              </div>
              <div className="col-sm-6 text-sm-end mt-3 mt-sm-0">
                <h6 className="fw-bold text-uppercase text-secondary small">Stay Information:</h6>
                <div><strong>Room:</strong> {room?.roomNumber} ({room?.roomType?.name || 'Standard'})</div>
                <div className="text-muted small">
                  <strong>Check-in:</strong> {booking?.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-muted small">
                  <strong>Check-out:</strong> {booking?.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-muted small">
                  <strong>Guests:</strong> {booking?.numGuests} Person(s)
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="table-responsive mb-4">
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th className="text-center">Qty / Nights</th>
                    <th className="text-end">Rate ($)</th>
                    <th className="text-end">Amount ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items && invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td className="fw-medium">{item.description}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">${Number(item.unitPrice).toFixed(2)}</td>
                      <td className="text-end fw-semibold">${Number(item.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="row justify-content-end">
              <div className="col-md-5">
                <div className="bg-light p-3 rounded-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal:</span>
                    <span className="fw-semibold">${Number(invoice.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Taxes & Fees ({invoice.taxPercent}%):</span>
                    <span className="fw-semibold">${Number(invoice.taxAmount).toFixed(2)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Discount:</span>
                      <span>-${Number(invoice.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between mb-2 fs-5 fw-bold text-dark">
                    <span>Total Amount:</span>
                    <span>${Number(invoice.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-success fw-medium">
                    <span>Amount Paid:</span>
                    <span>${Number(invoice.paidAmount).toFixed(2)}</span>
                  </div>
                  <div className={`d-flex justify-content-between pt-2 border-top fw-bold ${invoice.balanceDue > 0 ? 'text-danger' : 'text-muted'}`}>
                    <span>Balance Due:</span>
                    <span>${Number(invoice.balanceDue).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer notes */}
            <div className="mt-4 pt-3 border-top text-center text-muted small">
              <p className="mb-1">Thank you for staying with HotelPro! We hope you enjoyed your time with us.</p>
              <p className="mb-0">For queries or electronic receipt reissuance, please contact billing@hotelpro.com</p>
            </div>
          </div>

          <div className="modal-footer no-print bg-light">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary" onClick={handlePrint}>
              <i className="bi bi-printer-fill me-1"></i> Print / Save as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
