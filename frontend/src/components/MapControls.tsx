'use client';

import { useState } from 'react';

export default function MapControls() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const zoomIn = () => {
    const map = (window as any).map;
    if (map) {
      map.zoomIn();
    }
  };

  const zoomOut = () => {
    const map = (window as any).map;
    if (map) {
      map.zoomOut();
    }
  };

  const resetView = () => {
    const map = (window as any).map;
    if (map) {
      map.setView([36.7538, 3.0588], 12);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
      {/* Zoom In */}
      <button
        onClick={zoomIn}
        className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
        title=" تكبير"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* Zoom Out */}
      <button
        onClick={zoomOut}
        className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
        title="تصغير"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
        </svg>
      </button>

      {/* Fullscreen */}
      <button
        onClick={toggleFullscreen}
        className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
        title={isFullscreen ? 'الخروج من الشاشة الكاملة' : 'دخول الشاشة الكاملة'}
      >
        {isFullscreen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25h13.5M5.25 12h13.5m-13.5 6.75h13.5M3.75 3.75L20.25 20.25M20.25 3.75L3.75 20.25" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 6.5h16.5" />
          </svg>
        )}
      </button>

      {/* Reset View */}
      <button
        onClick={resetView}
        className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
        title="إعادة ضبط العرض"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991V16.023m0-4.992l-3.18 3.183a8.25 8.25 0 01-13.803 3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.18-3.182" />
        </svg>
      </button>
    </div>
  );
}
