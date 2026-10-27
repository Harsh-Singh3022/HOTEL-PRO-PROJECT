import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './routes/ProtectedRoute';

// Public pages
import Home from './pages/public/Home';
import Rooms from './pages/public/Rooms';
import RoomDetails from './pages/public/RoomDetails';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Guest pages
import BookRoom from './pages/guest/BookRoom';
import MyBookings from './pages/guest/MyBookings';
import Profile from './pages/guest/Profile';

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard';
import RoomStatusBoard from './pages/staff/RoomStatusBoard';
import WalkInBooking from './pages/staff/WalkInBooking';
import GuestDirectory from './pages/staff/GuestDirectory';
import HousekeepingTasks from './pages/staff/HousekeepingTasks';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRooms from './pages/admin/ManageRooms';
import ManageBookings from './pages/admin/ManageBookings';
import ManageStaff from './pages/admin/ManageStaff';
import Reports from './pages/admin/Reports';

const App = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Guest Protected Routes */}
          <Route
            path="/book/:roomId"
            element={
              <ProtectedRoute>
                <BookRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Staff & Admin Protected Routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/room-board"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <RoomStatusBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/walk-in"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <WalkInBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/guests"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <GuestDirectory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/tasks"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <HousekeepingTasks />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rooms"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageRooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="container py-5 text-center my-5">
                <div className="display-1 text-primary fw-bold">404</div>
                <h3 className="fw-bold">Page Not Found</h3>
                <p className="text-muted">The requested page does not exist or has been moved.</p>
                <a href="/" className="btn btn-primary fw-semibold">
                  Return to Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
