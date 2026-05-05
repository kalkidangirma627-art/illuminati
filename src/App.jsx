import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './components/AdminDashboard';
import AgentDashboard from './components/AgentDashboard';
import MemberDashboard from './components/MemberDashboard';
import './dashboard.css';

function AppRoutes() {
  const [path, setPath] = useState(window.location.pathname);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.href && link.href.startsWith(window.location.origin) && !link.hash) {
        e.preventDefault();
        const newPath = new URL(link.href).pathname;
        window.history.pushState({}, '', newPath);
        setPath(newPath);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    window.history.pushState({}, '', '/login');
    setPath('/login');
  };

  // If user is logged in and tries to go to /dashboard, route by role
  if (path === '/dashboard') {
    if (!user) {
      window.history.replaceState({}, '', '/login');
      return <Login />;
    }
    if (user.role === 'admin') return <AdminDashboard onLogout={handleLogout} />;
    if (user.role === 'agent') return <AgentDashboard onLogout={handleLogout} />;
    if (user.role === 'member') return <MemberDashboard onLogout={handleLogout} />;
  }

  if (path === '/login') return <Login />;
  if (path === '/register') return <Register />;

  return <Landing />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
