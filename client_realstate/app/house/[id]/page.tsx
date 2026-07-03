"use client";

import { useEffect, useRef, useState } from "react";
import "pannellum";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

declare const pannellum: any;

interface House {
  _id: string;
  title: string;
  subtitle: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  year: string;
  description: string;
  longDescription?: string;
  features: string[];
  image: string;
  images: string[];
  gallery: string[];
  videoUrl?: string;
  panorama?: string;
  rooms: any[];
  isActive: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

const BASE_URL = 'http://localhost:5000';

const getImageUrl = (path?: string) => {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
};

export default function HouseDetailPage() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const [viewer, setViewer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHouse, setCurrentHouse] = useState<House | null>(null);
  const [activePanorama, setActivePanorama] = useState<string | null>(null);
  const [activePanoramaIndex, setActivePanoramaIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const houseId = params.id as string;

  // Fetch house data from API
  useEffect(() => {
    const fetchHouse = async () => {
      try {
        setIsFetching(true);
        const response = await fetch(`${BASE_URL}/api/houses/${houseId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setCurrentHouse(result.data);
          // Set first panorama image as active if available
          if (result.data.images && result.data.images.length > 0) {
            setActivePanorama(result.data.images[0]);
            setActivePanoramaIndex(0);
          }
        } else {
          console.error('Failed to fetch house:', result);
        }
      } catch (error) {
        console.error('Error fetching house:', error);
      } finally {
        setIsFetching(false);
      }
    };

    if (houseId) {
      fetchHouse();
    }
  }, [houseId]);

  // Initialize panorama viewer
  useEffect(() => {
    if (!viewerRef.current || !activePanorama) return;

    setIsLoading(true);

    if (viewer) {
      viewer.destroy();
    }

    const panoramaUrl = getImageUrl(activePanorama);

    const panoViewer = pannellum.viewer(viewerRef.current, {
      type: "equirectangular",
      panorama: panoramaUrl,
      autoLoad: true,
      showZoomCtrl: true,
      showFullscreenCtrl: true,
      mouseZoom: true,
      autoRotate: 0,
      compass: false,
      hfov: 110,
      minHfov: 60,
      maxHfov: 140,
      pitch: 0,
      yaw: 0,
      title: `${currentHouse?.title} - 360° View ${activePanoramaIndex + 1}`,
    });

    setViewer(panoViewer);

    panoViewer.on("load", () => {
      setIsLoading(false);
    });

    return () => {
      if (panoViewer) {
        try {
          panoViewer.destroy();
        } catch (e) {
          console.log("Viewer destroyed");
        }
      }
    };
  }, [activePanorama, currentHouse]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleAutoRotate = () => {
    if (viewer) {
      const isRotating = viewer.getAutoRotate();
      viewer.setAutoRotate(isRotating ? 0 : -1);
    }
  };

  const changePanorama = (index: number) => {
    if (currentHouse?.images && currentHouse.images[index]) {
      setActivePanorama(currentHouse.images[index]);
      setActivePanoramaIndex(index);
    }
  };

  if (isFetching) {
    return (
      <div style={{ background: "#050505", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid rgba(255,255,255,0.2)",
              borderTop: "3px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: 20,
            }}
          />
          <p style={{ color: "#888" }}>Loading property...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!currentHouse) {
    return (
      <div style={{ background: "#050505", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "white", marginBottom: 20 }}>Property not found</p>
          <Link href="/">
            <button
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                padding: "10px 24px",
                borderRadius: "30px",
                color: "white",
                cursor: "pointer",
              }}
            >
              ← Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#050505", color: "white", minHeight: "100vh" }}>
      {/* Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          width: "92%",
          maxWidth: "1400px",
          zIndex: 100,
          padding: "12px 30px",
          borderRadius: "999px",
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/">
          <h2 style={{ fontSize: "22px", fontWeight: 800, cursor: "pointer" }}>VRTX</h2>
        </Link>
        <Link href="/#tours">
          <button
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              padding: "8px 20px",
              borderRadius: "30px",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← All Tours
          </button>
        </Link>
      </nav>

      {/* Hero Section with Property Info */}
      <section
        style={{
          paddingTop: "120px",
          paddingBottom: "60px",
          paddingLeft: "30px",
          paddingRight: "30px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "50px",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ color: "#888", letterSpacing: "3px", marginBottom: "15px", fontSize: "12px" }}>
              EXCLUSIVE LISTING
            </p>
            <h1 style={{ fontSize: "clamp(42px, 8vw, 80px)", marginBottom: "15px", lineHeight: 1.1 }}>
              {currentHouse.title}
            </h1>
            <p style={{ color: "#aaa", fontSize: "18px", marginBottom: "25px" }}>
              {currentHouse.subtitle}
            </p>
            <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", marginBottom: "30px" }}>
              <div>
                <span style={{ color: "#666", fontSize: "12px" }}>LOCATION</span>
                <p style={{ fontSize: "15px" }}>{currentHouse.location}</p>
              </div>
              <div>
                <span style={{ color: "#666", fontSize: "12px" }}>PRICE</span>
                <p style={{ fontSize: "24px", fontWeight: 700, color: "#fff" }}>{currentHouse.price}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "30px" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px 18px", borderRadius: "12px" }}>
                <span>🛏️ {currentHouse.bedrooms} Bedrooms</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px 18px", borderRadius: "12px" }}>
                <span>🛁 {currentHouse.bathrooms} Bathrooms</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px 18px", borderRadius: "12px" }}>
                <span>📐 {currentHouse.area}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px 18px", borderRadius: "12px" }}>
                <span>📅 Built {currentHouse.year}</span>
              </div>
            </div>
            <p style={{ color: "#ccc", lineHeight: 1.7, marginBottom: "20px" }}>
              {currentHouse.description}
            </p>
          </div>
          <div
            style={{
              background: "linear-gradient(135deg, #111, #0a0a0a)",
              borderRadius: "30px",
              padding: "30px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {/* Cover Image */}
            <div style={{ marginBottom: "20px" }}>
              <img
                src={getImageUrl(currentHouse.image)}
                alt={currentHouse.title}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "16px",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=No+Image";
                }}
              />
            </div>
            <h3 style={{ fontSize: "20px", marginBottom: "20px" }}>✨ Key Features</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {currentHouse.features?.slice(0, 8).map((feature: string, idx: number) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#bbb" }}>
                  <span style={{ color: "#fff" }}>✓</span> {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 360° Panorama Section - Main Attraction */}
      <section
        style={{
          padding: "60px 30px",
          background: "#0a0a0a",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ color: "#888", letterSpacing: "4px", fontSize: "12px", marginBottom: "10px" }}>
              IMMERSIVE EXPERIENCE
            </p>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 50px)" }}>
              360° Virtual Tour: <span style={{ color: "#aaa" }}>View {activePanoramaIndex + 1}</span>
            </h2>
            <p style={{ color: "#999", marginTop: "15px" }}>
              Drag to look around • Click hotspots for details
            </p>
          </div>

          {/* Panorama Selector */}
          {currentHouse.images && currentHouse.images.length > 0 ? (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "12px",
                  marginBottom: "30px",
                }}
              >
                {currentHouse.images.map((_, index: number) => (
                  <button
                    key={index}
                    onClick={() => changePanorama(index)}
                    style={{
                      background: activePanoramaIndex === index ? "white" : "rgba(255,255,255,0.08)",
                      color: activePanoramaIndex === index ? "#050505" : "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "40px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: activePanoramaIndex === index ? 600 : 400,
                      transition: "all 0.3s ease",
                    }}
                  >
                    360° View {index + 1}
                  </button>
                ))}
              </div>

              {/* Panorama Viewer */}
              <div
                style={{
                  position: "relative",
                  borderRadius: "24px",
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                }}
              >
                {/* Controls Overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 20,
                    right: 20,
                    zIndex: 50,
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={toggleAutoRotate}
                    style={{
                      background: "rgba(0,0,0,0.7)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white",
                      padding: "12px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      width: "44px",
                      height: "44px",
                      fontSize: "18px",
                    }}
                  >
                    🔄
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    style={{
                      background: "rgba(0,0,0,0.7)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white",
                      padding: "12px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      width: "44px",
                      height: "44px",
                      fontSize: "18px",
                    }}
                  >
                    ⛶
                  </button>
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 60,
                      background: "#0a0a0a",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        border: "3px solid rgba(255,255,255,0.2)",
                        borderTop: "3px solid white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        marginBottom: 20,
                      }}
                    />
                    <p style={{ color: "#888" }}>Loading 360° Panorama...</p>
                    <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                  </div>
                )}

                {/* Panorama Container */}
                <div
                  ref={viewerRef}
                  style={{
                    width: "100%",
                    height: "65vh",
                    minHeight: "500px",
                    position: "relative",
                  }}
                />
              </div>
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "24px",
              }}
            >
              <p style={{ color: "#888" }}>No 360° tours available for this property yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Full Description Section */}
      <section
        style={{
          padding: "80px 30px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "50px" }}>
          <div>
            <h2 style={{ fontSize: "32px", marginBottom: "20px" }}>About This Property</h2>
            <p style={{ color: "#bbb", lineHeight: 1.8, marginBottom: "30px" }}>
              {currentHouse.longDescription || currentHouse.description}
            </p>
            <div style={{ marginTop: "30px" }}>
              <h3 style={{ fontSize: "20px", marginBottom: "15px" }}>📋 Property Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <p style={{ color: "#666", fontSize: "12px" }}>Property Type</p>
                  <p>Luxury Villa</p>
                </div>
                <div>
                  <p style={{ color: "#666", fontSize: "12px" }}>Year Built</p>
                  <p>{currentHouse.year}</p>
                </div>
                <div>
                  <p style={{ color: "#666", fontSize: "12px" }}>Total Area</p>
                  <p>{currentHouse.area}</p>
                </div>
                <div>
                  <p style={{ color: "#666", fontSize: "12px" }}>Parking</p>
                  <p>2 Spaces Included</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: "32px", marginBottom: "20px" }}>Property Gallery</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "15px" }}>
              {/* Cover image as first gallery item */}
              <div
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: "pointer",
                  border: "2px solid rgba(255,255,255,0.1)",
                }}
                onClick={() => window.open(getImageUrl(currentHouse.image), '_blank')}
              >
                <img
                  src={getImageUrl(currentHouse.image)}
                  alt="Cover"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                  Cover
                </div>
              </div>
              
              {/* Gallery images */}
              {currentHouse.gallery?.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onClick={() => window.open(getImageUrl(img), '_blank')}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`Gallery ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/150x150?text=No+Image";
                    }}
                  />
                </div>
              ))}
            </div>
            {(!currentHouse.gallery || currentHouse.gallery.length === 0) && (
              <p style={{ color: "#888", textAlign: "center", padding: "40px" }}>
                No gallery images available.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      {currentHouse.features && currentHouse.features.length > 0 && (
        <section
          style={{
            padding: "80px 30px",
            background: "#0a0a0a",
          }}
        >
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "50px" }}>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>Premium Amenities</h2>
              <p style={{ color: "#888", marginTop: "15px" }}>Everything you need for luxurious living</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {currentHouse.features.map((feature: string, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px 20px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>✓</span>
                  <span style={{ color: "#ddd" }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section
        style={{
          padding: "100px 30px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", marginBottom: "20px" }}>
          Interested in this property?
        </h2>
        <p style={{ color: "#aaa", maxWidth: "600px", margin: "0 auto 40px", lineHeight: 1.7 }}>
          Schedule a private virtual tour or request more information about this exceptional property.
        </p>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            style={{
              padding: "14px 32px",
              background: "white",
              color: "#050505",
              border: "none",
              borderRadius: "40px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Schedule Tour
          </button>
          <button
            style={{
              padding: "14px 32px",
              background: "transparent",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "40px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Download Brochure
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "40px 30px",
          textAlign: "center",
          color: "#666",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          fontSize: "13px",
        }}
      >
        <p>© 2026 VRTX Virtual Experiences — Premium Virtual Tours</p>
      </footer>
    </div>
  );
}