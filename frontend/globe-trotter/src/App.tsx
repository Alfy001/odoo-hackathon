import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './pages/LoginScreen';
import RegistrationScreen from './pages/RegistrationScreen';
import LandingPage from './pages/LandingPage';
import TripPlannerPage from './pages/TripPlannerPage';
import MyTripsPage from './pages/MyTripsPage';
import ProfilePage from './pages/ProfilePage';
import TripDetailPage from './pages/TripDetailPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegistrationScreen />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/plan-trip" element={<TripPlannerPage />} />
        <Route path="/my-trips" element={<MyTripsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/trip/:tripId" element={<TripDetailPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
