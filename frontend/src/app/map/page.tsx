'use client';

import { useEffect, useState } from 'react';

export default function MapPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            SIG Maps V2
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              مرحباً، {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="h-[calc(100vh-64px)] bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            الخريطة قريباً!
          </h2>
          <p className="text-gray-600 mb-4">
            سيتم تنفيذها في Story 2-1 (Map Initialization)
          </p>
          <p className="text-sm text-gray-500">
            التقدم الحالي: Story 1-1 (Project Setup) ✅ مكتمل
          </p>
        </div>
      </div>
    </div>
  );
}
