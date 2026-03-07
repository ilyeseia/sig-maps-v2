'use client';

import dynamic from 'next/dynamic';

// Dynamically import MapWithViewport to avoid SSR issues
const MapWithViewport = dynamic(
  () => import('../../components/MapWithViewport'),
  {
    loading: () => (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الخريطة...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function MapPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <MapWithViewport />
    </div>
  );
}
