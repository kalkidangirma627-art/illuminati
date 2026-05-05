import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (newPath) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  };

  // Provide navigate function to child components via a simple context or prop if needed, 
  // but usually they can just use standard <a> tags with an onClick wrapper, or we can use a global event.
  // Actually, let's just make it simple: we can intercept all <a> clicks globally to make it an SPA.
  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.href && link.href.startsWith(window.location.origin) && !link.hash) {
        e.preventDefault();
        navigate(new URL(link.href).pathname);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (path === '/login') return <Login />;
  if (path === '/register') return <Register />;
  if (path === '/dashboard') return <Dashboard />;
  
  return <Landing />;
}
