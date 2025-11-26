import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Auth from './components/Auth'


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PracticePage from './pages/PracticePage';
import ManagePage from './pages/ManagePage';
import SettingsPage from './pages/SettingsPage';
import MainPage from './pages/MainPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {

    }
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    );
  }
  if (!user) {
    return <Auth />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/practice/:list" element={<PracticePage />} />
        <Route path="/manage" element={<ManagePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showInstallPrompt && deferredPrompt && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          zIndex: 1000,
          maxWidth: '90%',
          animation: 'slideUp 0.3s ease'
        }}>
          <span style={{ fontSize: '1rem', fontWeight: '600' }}>
            Installera Glossify på din enhet!
          </span>
          <button
            onClick={handleInstallClick}
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Installera
          </button>
          <button
            onClick={() => setShowInstallPrompt(false)}
            style={{
              background: 'transparent',
              color: 'white',
              border: '1px solid white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Senare
          </button>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
