'use client';

import { useAuthStore } from '../../store/auth-store';
import { useLayerStore } from '../../store/layer-store';
import Map from '../../components/Map';
import LayerPanel from '../../components/LayerPanel';
import { TokenRefresh } from '../../components/TokenRefresh';

export default function MapPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isVisible: isLayerPanelVisible, togglePanel: toggleLayerPanel } = useLayerStore();

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      logout();
    }
  };

  return (
    <>
      {/* Token Refresh Component */}
      <TokenRefresh />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            SIG Maps V2
          </h1>
          <div className="flex items-center gap-4">
            {/* Layer Panel Toggle Button */}
            <button
              onClick={toggleLayerPanel}
              className="btn btn-secondary text-sm"
              title={isLayerPanelVisible ? 'إخفاء الطبقات' : 'إظهار الطبقات'}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* User Info & Logout */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                {user?.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
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

      {/* Layer Panel Drawer */}
      {isLayerPanelVisible && <LayerPanel onClose={toggleLayerPanel} />}

      {/* Map Container */}
      <div className="h-[calc(100vh-64px)]">
        <Map />
      </div>
    </>
  );
}
