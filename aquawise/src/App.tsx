import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Landing } from './pages/Landing';
import { FieldSetup } from './pages/FieldSetup';
import { Dashboard } from './pages/Dashboard';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/setup" element={<FieldSetup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/history" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center p-8"><h2 className="text-xl font-semibold text-gray-900 mb-2">History & Analytics</h2><p className="text-gray-500">Coming soon...</p></div></div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;