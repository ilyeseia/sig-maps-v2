'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/auth-store';
import { TokenRefresh } from '../../components/TokenRefresh';

export default function MapPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    window.location.href = '/login';
    return null;
  }

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      logout();
    }
  };

  return (
    <>
      {/* Token Refresh Component (no UI, just background refresh) */}
      <TokenRefresh />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            SIG Maps V2
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-sm"
              title="تسجيل الخروج"
            >
              <span className="hidden sm:inline">تسجيل الخروج</span>
              <span className="sm:hidden">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="h-[calc(100vh-64px)] bg-blue-50 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="text-8xl mb-6">🗺️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            الخريطة قريباً!
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            سيتم تنفيذ الخريطة التفاعلية في Story 2-1 (Map Initialization)
          </p>
          
          {/* Progress Card */}
          <div className="bg-white rounded-lg shadow-md p-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">تقدم التنفيذ:</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Epic 1: Foundation & Authentication</span>
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">33%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '33%' }}></div>
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Story 1-1: Project Setup ✅
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Story 1-2: User Registration ✅
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Story 1-3: User Login ✅
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            القادم: Story 1-4 (Password Reset)
          </p>
        </div>
      </div>
    </>
  );
}
