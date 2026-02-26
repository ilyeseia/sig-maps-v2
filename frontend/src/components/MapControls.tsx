import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapControlsProps {
  onResetView?: () => void;
}

export default function MapControls({ onResetView }: MapControlsProps) {
  const map = useMap();
  const position = 'bottomright';

  // Zoom controls
  const zoomIn = () => {
    map.zoomIn();
  };

  const zoomOut = () => {
    map.zoomOut();
  };

  // Reset view
  const handleResetView = () => {
    const ALGIERS_CENTER: [number, number] = [36.7538, 3.0588];
    const DEFAULT_ZOOM = 12;
    map.setView(ALGIERS_CENTER, DEFAULT_ZOOM);
    onResetView?.();
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Zoom In (+, =)
      if (e.key === '+' || e.key === '=') {
        zoomIn();
        e.preventDefault();
      }
      // Zoom Out (-, _)
      else if (e.key === '-' || e.key === '_') {
        zoomOut();
        e.preventDefault();
      }
      // Reset View (r, R, Esc in some contexts)
      else if (e.key === 'r' || e.key === 'R') {
        handleResetView();
        e.preventDefault();
      }
      // Escape - clear selection
      else if (e.key === 'Escape') {
        // Deselect any selected features (if implemented)
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [map, zoomIn, zoomOut, handleResetView]);

  return (
    <div className={position === 'bottomright' ? 'leaflet-bottomright' : 'leaflet-bottomleft'}>
      {/* Zoom Controls */}
      <div className="leaflet-control-zoom leaflet-bar leaflet-touch">
        <a
          className="leaflet-control-zoom-in"
          title="تكبير"
          href="#"
          role="button"
          onClick={(e) => {
            e.preventDefault();
            zoomIn();
          }}
          aria-label="Zoom in"
        >
          <span>+</span>
        </a>
        <a
          className="leaflet-control-zoom-out"
          title="تصغير"
          href="#"
          role="button"
          onClick={(e) => {
            e.preventDefault();
            zoomOut();
          }}
          aria-label="Zoom out"
        >
          <span>-</span>
        </a>
      </div>

      {/* Scale Bar */}
      <L.Control.Scale position={position} imperial={false} />

      {/* Fullscreen Toggle */}
      <a
        className="leaflet-control-fullscreen leaflet-bar leaflet-touch"
        title={document.fullscreenElement ? 'الخروج من الشاشة الكاملة' : 'دخول الشاشة الكاملة'}
        href="#"
        role="button"
        onClick={(e) => {
          e.preventDefault();
          toggleFullscreen();
        }}
        aria-label="Toggle fullscreen"
      >
        <svg
          className="leaflet-control-fullscreen-icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
          stroke="none"
        >
          {document.fullscreenElement ? (
            <path d="M20 3H4a1 1 0 01-1 1v14a1 1 0 0020 0H4a1 1 0 01-1-1V4a1 1 0 011-1zm-1 9H6a1 1 0 00-1 1v14a1 1 0 001 1h14zM4 12H6v2a1 1 0 001 1h12a1 1 0 001-1V12H4zM6 12a1 1 0 001 1 2v2a1 1 0 001 1H4a1 1 1 001-1 0v-4a1 1 1 001-1zm1-7a1 1 0 01 1-1h12a1 1 0 011 1v4a1 1 0 01-1 1H6a1 1 1 001-1 0V5a1 1 1 001-1zm1 9H6a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
          ) : (
            <path d="M20 3H4a1 1 0 00-1 1v14a1 1 0 002 0H4a1 1 0 00-1 0V4a1 1 0 011-1zm-1 0H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2 4V4a2 2 0 00-2-2H6a2 2 0 00-2-2V2a2 2 0 010 2h12a2 2 0 010-6V4a2 2 0 00-2-2zM6 4h12a2 2 0 002 2v6a2 2 0 00-2 2H6a2 2 0 00-2-2V4a2 2 0 002-2zm12 0V4H6v6h12V4zm4 0V4a1 1 0 01-1 1H7a1 1 0 01-1-1V4h14zM7 6a1 1 0 011 1v6a1 1 0 001 1h10a1 1 0 001 1V7a1 1 0 111-1 0V6a1 1 0 011-1 0z" />
          )}
        </svg>
      </a>

      {/* Reset View Button */}
      <a
        className="leaflet-control-reset"
        title="إعادة ضبط العرض"
        href="#"
        role="button"
        onClick={(e) => {
          e.preventDefault();
          handleResetView();
        }}
        aria-label="Reset view"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.18 3.182m0-4.991V16.023m0-4.992l-3.18 3.183a8.25 8.25 0 01-13.803 3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.18-3.182"
          />
        </svg>
      </a>

      {/* Keyboard Shortcuts Hint */}
      <div
        className="leaflet-control-shortcuts-hint"
        style={{
          position: 'absolute',
          right: '38px',
          bottom: '80px',
          background: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          opacity: '0.8',
          pointerEvents: 'none',
        }}
      >
        <div className="text-xs text-gray-600">
          <span className="mr-2">⌨️</span>
          <span className="ml-2">Zoom +/-, Reset: R, Esc</span>
        </div>
      </div>

      <style jsx>{`
        .leaflet-bottomright {
          bottom: 20px;
          right: 20px;
        }
        .leaflet-bottomleft {
          bottom: 20px;
          left: 20px;
        }
        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out {
          background-color: white;
          color: #555;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: 30px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          display: inline-block;
          margin-bottom: 4px;
        }
        .leaflet-control-zoom-in:hover,
        .leaflet-control-zoom-out:hover {
          background-color: #f4f4f4;
        }
        .leaflet-bar {
          border-radius: 4px;
          border: 1px solid #ccc;
          background-color: white;
          display: inline-block;
        }
        .leaflet-bar a {
          display: block;
          text-decoration: none;
          color: #1978c8;
          font-size: 16px;
          line-height: 26px;
          text-align: center;
        }
        .leaflet-bar a:hover {
          background-color: #f4f4f4;
        }
        .leaflet-control-fullscreen {
          background-color: white;
          color: #555;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: 30px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          display: inline-block;
          margin-bottom: 4px;
        }
        .leaflet-control-fullscreen:hover {
          background-color: #f4f4f4;
          color: #1978c8;
        }
        .leaflet-control-reset {
          background-color: white;
          color: #555;
          border: 1 width: 30px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          display: inline-block;
          border-radius: 4px;
          margin-bottom: 4px;
        }
        .leaflet-control-reset:hover {
          background-color: #f4f4f4;
          color: #333;
        }
      `}</style>
    </div>
  );
}
