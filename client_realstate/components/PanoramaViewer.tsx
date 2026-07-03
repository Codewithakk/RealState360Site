"use client";

import { useEffect, useRef, useState } from "react";
import "pannellum/build/pannellum.css";

declare const pannellum: any;

interface PanoramaViewerProps {
  panorama: string;
  title?: string;
  features?: string[];
  description?: string;
  dimensions?: string;
}

export default function PanoramaViewer({ 
  panorama, 
  title, 
  features = [], 
  description, 
  dimensions 
}: PanoramaViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!viewerRef.current) return;

    setIsLoading(true);

    // Create hotspots from features
    const hotspots = features.map((feature, idx) => ({
      pitch: -10 + (idx * 12),
      yaw: -60 + (idx * 30),
      type: "info",
      text: feature,
    }));

    const panoViewer = pannellum.viewer(viewerRef.current, {
      type: "equirectangular",
      panorama: panorama,
      autoLoad: true,
      showZoomCtrl: true,
      showFullscreenCtrl: true,
      mouseZoom: true,
      autoRotate: 0,
      compass: false,
      hfov: 110,
      minHfov: 60,
      maxHfov: 140,
      title: title,
      hotSpots: hotspots,
    });

    setViewer(panoViewer);

    panoViewer.on("load", () => {
      setIsLoading(false);
    });

    return () => {
      if (panoViewer) {
        panoViewer.destroy();
      }
    };
  }, [panorama, title, features]);

  const toggleAutoRotate = () => {
    if (viewer) {
      const isRotating = viewer.getAutoRotate();
      viewer.setAutoRotate(isRotating ? 0 : -1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute bottom-5 right-5 z-10 flex gap-3">
        <button
          onClick={toggleAutoRotate}
          className="w-11 h-11 rounded-full bg-black/70 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-black/90 transition-colors"
        >
          🔄
        </button>
        <button
          onClick={toggleFullscreen}
          className="w-11 h-11 rounded-full bg-black/70 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-black/90 transition-colors"
        >
          ⛶
        </button>
      </div>

      {/* Info Panel */}
      {(description || dimensions) && (
        <div className="absolute bottom-5 left-5 z-10 max-w-[300px] bg-black/70 backdrop-blur rounded-xl p-4 border border-white/10">
          {description && <p className="text-sm text-gray-300 mb-2">{description}</p>}
          {dimensions && <p className="text-xs text-gray-500">📏 {dimensions}</p>}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-20 rounded-2xl">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading 360° experience...</p>
          </div>
        </div>
      )}

      {/* Viewer */}
      <div
        ref={viewerRef}
        className="w-full h-[60vh] min-h-[500px] rounded-2xl overflow-hidden"
      />
    </div>
  );
}