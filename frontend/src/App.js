import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import VolunteerDashboard from './components/VolunteerDashboard';
import Home from './components/Home';
import CategoryPage from "./components/CategoryPage";
import AllManagers from './components/AllManagers';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Footer from './components/Footer'; 
import EditEvent from './components/EditEvent';
import EventDetails from "./components/EventDetails";
import Approval from "./components/Approval";     // Adjust path as needed
import UserDashboard from "./components/UserDashboard"
import AllRegisteredEvents from './components/AllRegisteredEvents';
import About from './components/About';
import AddEvent from './components/AddEvent';
import QRCodeScanner from './components/QRCodeScanner';
import TrackAttendees from "./components/TrackAttendees";


function App() {
  return (
    <BrowserRouter>
    <Header/>
      <Routes>
        
      <Route path="/" element={<Home />} />

        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/admin-dashboard" 
          element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />} 
        />
        <Route 
          path="/manager-dashboard" 
          element={<ProtectedRoute element={<ManagerDashboard />} allowedRoles={['manager']} />} 
        />
                <Route path="/all-managers" element={<AllManagers />} />

        <Route 
          path="/volunteer-dashboard" 
          element={<ProtectedRoute element={<VolunteerDashboard />} allowedRoles={['volunteer']} />} 
        />
        <Route 
          path="/user-dashboard" 
          element={<ProtectedRoute element={<UserDashboard />} allowedRoles={['user']} />} 
        />
        <Route path="/events/:categoryId" element={<CategoryPage />} />
        <Route path="/event/:id" element={<EventDetails />} />

        <Route path="/edit-event/:id" element={<EditEvent />} />

        <Route path="/approval/:eventId" element={<Approval />} />

        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/all-registered-events" element={<AllRegisteredEvents />} />
        <Route path="/about" element={<About />} />
        <Route path="/add-event" element={<AddEvent />} />

        <Route path="/verify" element={<QRCodeScanner />} />
        <Route path="/track-attendees/:eventId" element={<TrackAttendees />} />

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
      <Footer /> 
    </BrowserRouter>
  );
}

export default App;
