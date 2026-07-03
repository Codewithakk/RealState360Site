"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Types matching your API response
interface House {
  _id: string;
  title: string;
  subtitle?: string;
  location?: string;
  description?: string;
  longDescription?: string;
  image: string;
  images?: string[];
  gallery?: string[];
  price?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  features?: string[];
  year?: string;
  isActive?: boolean;
  views?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    slug?: string;
    canonicalUrl?: string;
  };
}

interface WebSetting {
  _id: string;
  companyName: string;
  companyLogo: string;
  favicon: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutImage: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  footerText: string;
  maintenanceMode: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

interface FormStatus {
  type: 'success' | 'error' | null;
  message: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    count: number;
    houses: House[];
  };
}

interface WebSettingResponse {
  success: boolean;
  data: WebSetting;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

// Helper function to get full image URL
const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads")) return `${BACKEND_URL}${path}`;
  return `${BACKEND_URL}/uploads/${path}`;
};

export default function Home() {
  // Refs
  const cursorRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [houses, setHouses] = useState<House[]>([]);
  const [webSetting, setWebSetting] = useState<WebSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    service: "virtual-tour",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<FormStatus>({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Horizontal scroll states
  const [isHoveringScroll, setIsHoveringScroll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch houses and web settings from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch houses
        const housesRes = await fetch(`${BACKEND_URL}/api/houses`);
        const housesData: ApiResponse = await housesRes.json();
        if (housesData.success && housesData.data.houses) {
          setHouses(housesData.data.houses);
        }

        // Fetch web settings
        const settingsRes = await fetch(`${BACKEND_URL}/api/websetting`);
        const settingsData: WebSettingResponse = await settingsRes.json();
        if (settingsData.success && settingsData.data) {
          setWebSetting(settingsData.data);
          
          // Update document title and meta tags from SEO settings
          if (settingsData.data.seoTitle) {
            document.title = settingsData.data.seoTitle;
          }
          if (settingsData.data.seoDescription) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute('content', settingsData.data.seoDescription);
            } else {
              const meta = document.createElement('meta');
              meta.name = 'description';
              meta.content = settingsData.data.seoDescription;
              document.head.appendChild(meta);
            }
          }
          if (settingsData.data.seoKeywords && settingsData.data.seoKeywords.length) {
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
              metaKeywords.setAttribute('content', settingsData.data.seoKeywords.join(', '));
            } else {
              const meta = document.createElement('meta');
              meta.name = 'keywords';
              meta.content = settingsData.data.seoKeywords.join(', ');
              document.head.appendChild(meta);
            }
          }
          // Update favicon
          if (settingsData.data.favicon) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = getImageUrl(settingsData.data.favicon);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [BACKEND_URL]);

  // Filter houses based on selected filter
  const filteredHouses = houses.filter(house => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "luxury") {
      const price = house.price?.toString() || "";
      const priceNum = parseInt(price.replace(/[^0-9]/g, ""));
      return priceNum > 30000000;
    }
    if (selectedFilter === "modern") {
      return house.title.toLowerCase().includes("modern") || 
             house.title.toLowerCase().includes("contemporary") ||
             house.subtitle?.toLowerCase().includes("modern") ||
             false;
    }
    if (selectedFilter === "waterfront") {
      return house.location?.toLowerCase().includes("golf") ||
             house.title.toLowerCase().includes("golf") ||
             false;
    }
    return true;
  });

  // Auto-scroll functionality (only on desktop)
  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    if (isMobile) return;
    
    autoScrollRef.current = setInterval(() => {
      if (!scrollContainerRef.current || isHoveringScroll || isDragging) return;
      
      const container = scrollContainerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      let newScrollLeft = container.scrollLeft + (isMobile ? 0.8 : 1.5);
      
      if (newScrollLeft >= maxScroll) {
        newScrollLeft = 0;
      }
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
      
      const cardWidth = container.children[0]?.clientWidth || (isMobile ? 300 : 380);
      const gap = isMobile ? 16 : 24;
      const itemWidth = cardWidth + gap;
      const newIndex = Math.round(container.scrollLeft / itemWidth);
      if (newIndex !== activeIndex && newIndex < filteredHouses.length) {
        setActiveIndex(newIndex);
      }
    }, isMobile ? 80 : 50);
  }, [isHoveringScroll, isDragging, activeIndex, filteredHouses.length, isMobile]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isMobile) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll, isMobile]);

  // Scroll to specific card
  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.children[0]?.clientWidth || (isMobile ? 300 : 380);
    const gap = isMobile ? 16 : 24;
    const itemWidth = cardWidth + gap;
    container.scrollTo({
      left: index * itemWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  // Drag to scroll handlers (desktop only)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = "grabbing";
    scrollContainerRef.current.style.userSelect = "none";
  };

  const handleMouseMoveDrag = (e: React.MouseEvent) => {
    if (isMobile) return;
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpDrag = () => {
    if (isMobile) return;
    if (!scrollContainerRef.current) return;
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = "grab";
    scrollContainerRef.current.style.userSelect = "auto";
  };

  const handleMouseLeaveScroll = () => {
    if (isMobile) return;
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
    }
  };

  // Parallax effect for hero section (disabled on mobile)
  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = winScroll / height;
      setScrollProgress(scrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // GSAP Animations (adjusted for mobile)
  useEffect(() => {
    const heroImage = document.querySelector(".hero-image");
    if (heroImage && !isMobile) {
      gsap.to(heroImage, {
        y: () => window.scrollY * 0.5,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }

    gsap.fromTo(
      ".hero-text",
      {
        opacity: 0,
        y: isMobile ? 50 : 100,
        filter: "blur(10px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: isMobile ? 1 : 1.6,
        ease: "power4.out",
        delay: 0.3,
      }
    );
    
    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((reveal) => {
      ScrollTrigger.create({
        trigger: reveal,
        start: isMobile ? "top 90%" : "top 85%",
        onEnter: () => reveal.classList.add("active"),
        once: true,
      });
    });
    
    const staggerChildren = document.querySelectorAll(".stagger-child");
    ScrollTrigger.create({
      trigger: ".features-grid",
      start: isMobile ? "top 90%" : "top 80%",
      onEnter: () => {
        staggerChildren.forEach(child => child.classList.add("active"));
      },
      once: true,
    });

    const navbar = document.querySelector("nav");
    if (navbar) {
      ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          if (self.progress > 0.05) {
            gsap.to(navbar, {
              backgroundColor: "rgba(5,5,5,0.95)",
              borderColor: "rgba(255,255,255,0.15)",
              padding: isMobile ? "10px 20px" : "12px 30px",
              duration: 0.3,
            });
          } else {
            gsap.to(navbar, {
              backgroundColor: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.08)",
              padding: isMobile ? "14px 20px" : "18px 30px",
              duration: 0.3,
            });
          }
        },
      });
    }

    // Custom cursor animation (desktop only)
    if (!isMobile) {
      const moveCursor = (e: MouseEvent) => {
        if (!cursorRef.current) return;
        const targetX = e.clientX - 15;
        const targetY = e.clientY - 15;
        gsap.to(cursorRef.current, {
          x: targetX,
          y: targetY,
          duration: 0.15,
          ease: "power2.out",
        });
      };
      window.addEventListener("mousemove", moveCursor);
      
      return () => {
        window.removeEventListener("mousemove", moveCursor);
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMobile]);

  // Handle hover on cards for cursor effect (desktop only)
  const handleCardHover = (isHovering: boolean) => {
    if (isMobile) return;
    setIsHoveringCard(isHovering);
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        scale: isHovering ? 2.5 : 1,
        backgroundColor: isHovering ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.8)",
        mixBlendMode: isHovering ? "normal" : "difference",
        duration: 0.3,
      });
    }
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ type: null, message: "" });
    
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({ type: "error", message: "Please fill in all required fields." });
      setIsSubmitting(false);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({ type: "error", message: "Please enter a valid email address." });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          service: formData.service,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormStatus({ 
          type: "success", 
          message: "Thank you! Our team will get back to you within 24 hours." 
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "virtual-tour",
          message: "",
        });
        
        if (contactRef.current) {
          contactRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        throw new Error(data.message || "Something went wrong");
      }
    } catch (error) {
      setFormStatus({ 
        type: "error", 
        message: error instanceof Error ? error.message : "Something went wrong. Please try again later." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If maintenance mode is enabled, show maintenance page
  if (webSetting?.maintenanceMode && !loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050505",
        color: "white",
        textAlign: "center",
        padding: "20px",
      }}>
        <div>
          <h1 style={{ fontSize: "clamp(48px, 10vw, 120px)", marginBottom: "20px" }}>🔧</h1>
          <h2 style={{ fontSize: "clamp(24px, 5vw, 48px)", marginBottom: "16px" }}>Under Maintenance</h2>
          <p style={{ color: "#aaa", fontSize: "clamp(14px, 4vw, 18px)" }}>
            We're currently upgrading our platform. Please check back soon!
          </p>
          {webSetting.email && (
            <p style={{ marginTop: "30px", color: "#666" }}>
              Contact us: <a href={`mailto:${webSetting.email}`} style={{ color: "#aaa" }}>{webSetting.email}</a>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Progress Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${scrollProgress * 100}%`,
          height: isMobile ? "2px" : "3px",
          background: "linear-gradient(90deg, #fff, #888)",
          zIndex: 10000,
          transition: "width 0.1s ease",
        }}
      />

      {/* Custom Cursor - Hidden on Mobile */}
      {!isMobile && (
        <div
          ref={cursorRef}
          style={{
            width: isHoveringCard ? "60px" : "30px",
            height: isHoveringCard ? "60px" : "30px",
            borderRadius: "50%",
            position: "fixed",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 9999,
            background: "rgba(255,255,255,0.9)",
            mixBlendMode: isHoveringCard ? "normal" : "difference",
            backdropFilter: "blur(8px)",
            boxShadow: isHoveringCard ? "0 0 30px rgba(255,255,255,0.5)" : "none",
            transition: "width 0.3s ease, height 0.3s ease, background 0.3s ease",
          }}
        />
      )}

      <main style={{ background: "#050505", color: "white", overflow: "hidden" }}>
        {/* Navbar - Responsive with dynamic company name */}
        <nav
          style={{
            position: "fixed",
            top: isMobile ? 12 : 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: isMobile ? "94%" : "92%",
            maxWidth: "1400px",
            zIndex: 100,
            padding: isMobile ? "12px 20px" : "18px 30px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "all 0.3s ease",
            backdropFilter: "blur(14px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {webSetting?.companyLogo && (
              <img
                src={getImageUrl(webSetting.companyLogo)}
                alt={webSetting.companyName || "Logo"}
                style={{
                  height: isMobile ? "30px" : "36px",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            )}
            <h2
              style={{
                fontSize: isMobile ? "20px" : "24px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                background: "linear-gradient(135deg, #fff, #aaa)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {webSetting?.companyName || "VRTX"}
            </h2>
          </div>
          <div style={{ display: "flex", gap: isMobile ? "20px" : "40px", fontSize: isMobile ? "12px" : "14px", fontWeight: 500 }}>
            <a href="#tours" style={{ transition: "opacity 0.3s", opacity: 0.7 }}>Tours</a>
            <a href="#about" style={{ transition: "opacity 0.3s", opacity: 0.7 }}>About</a>
            <a href="#contact" style={{ transition: "opacity 0.3s", opacity: 0.7 }}>Contact</a>
          </div>
        </nav>

        {/* Hero Section - Responsive */}
        <section
          ref={heroRef}
          style={{
            position: "relative",
            width: "100%",
            height: isMobile ? "90vh" : "100vh",
            overflow: "hidden",
          }}
        >
          <div
            className="hero-image"
            style={{
              position: "absolute",
              inset: 0,
              transform: !isMobile ? `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.3}px) scale(1.05)` : "scale(1.05)",
              transition: "transform 0.1s ease-out",
            }}
          >
            <Image
              src="/hero.jpg"
              alt="Hero"
              fill
              priority
              style={{
                objectFit: "cover",
                filter: "brightness(0.4)",
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)",
            }}
          />
          
          {/* Floating Particles - Fewer on mobile */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            {[...Array(isMobile ? 20 : 40)].map((_, i) => {
              const size = Math.random() * (isMobile ? 3 : 4) + 1;
              const duration = Math.random() * (isMobile ? 10 : 12) + (isMobile ? 6 : 8);
              const delay = Math.random() * 5;
              const startX = Math.random() * 100;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    background: `rgba(255,255,255,${Math.random() * 0.3 + 0.1})`,
                    top: `${Math.random() * 100}%`,
                    left: `${startX}%`,
                    animation: `float ${duration}s linear infinite`,
                    animationDelay: `${delay}s`,
                  }}
                />
              );
            })}
          </div>

          {/* Hero Content - Responsive */}
          <div
            className="hero-text"
            style={{
              position: "relative",
              zIndex: 5,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: isMobile ? "20px 16px" : "20px",
            }}
          >
            <p
              className="reveal"
              style={{
                letterSpacing: isMobile ? "4px" : "8px",
                color: "#aaa",
                marginBottom: isMobile ? "16px" : "20px",
                textTransform: "uppercase",
                fontSize: isMobile ? "10px" : "14px",
                fontWeight: 500,
              }}
            >
              Next Generation Virtual Experiences
            </p>
            <h1
              style={{
                fontSize: isMobile ? "clamp(32px, 10vw, 50px)" : "clamp(50px, 12vw, 160px)",
                lineHeight: 0.92,
                fontWeight: 900,
                maxWidth: "1300px",
                letterSpacing: "-0.03em",
              }}
            >
              Cinematic
              <br />
              <span style={{ background: "linear-gradient(135deg, #fff, #888)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>360° Spaces</span>
            </h1>
            <p
              className="reveal"
              style={{
                marginTop: isMobile ? "20px" : "30px",
                color: "#ccc",
                fontSize: isMobile ? "clamp(14px, 4vw, 16px)" : "clamp(16px, 2vw, 22px)",
                maxWidth: isMobile ? "90%" : "720px",
                lineHeight: 1.7,
                fontWeight: 400,
              }}
            >
              Explore immersive luxury interiors powered by cinematic virtual technology.
              Step into a world where reality meets imagination.
            </p>
            <Link href="#tours">
              <button
                style={{
                  marginTop: isMobile ? "30px" : "45px",
                  padding: isMobile ? "12px 28px" : "18px 42px",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "white",
                  color: "#050505",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(255,255,255,0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                Begin Your Journey →
              </button>
            </Link>
          </div>

          {/* Scroll Indicator - Hidden on mobile */}
          {!isMobile && (
            <div
              style={{
                position: "absolute",
                bottom: 30,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 40,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderRadius: 30,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 12,
                    background: "white",
                    borderRadius: 2,
                    position: "absolute",
                    top: 8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    animation: "scrollIndicator 2s ease infinite",
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Tours Section - Horizontal Auto-Scroll Responsive */}
        <section
          id="tours"
          className="reveal"
          style={{
            padding: isMobile ? "60px 0" : "120px 0",
            background: "#050505",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "100%",
              background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ maxWidth: "100%", margin: "0 auto", padding: isMobile ? "0 16px" : "0 30px" }}>
            {/* Section Header - Responsive */}
            <div
              style={{
                textAlign: "center",
                marginBottom: isMobile ? "40px" : "60px",
              }}
            >
              <p
                style={{
                  color: "#888",
                  letterSpacing: isMobile ? "4px" : "6px",
                  marginBottom: isMobile ? "10px" : "15px",
                  fontSize: isMobile ? "11px" : "13px",
                  textTransform: "uppercase",
                }}
              >
                Immersive Collection
              </p>
              <h2
                style={{
                  fontSize: isMobile ? "clamp(28px, 8vw, 42px)" : "clamp(42px, 8vw, 80px)",
                  fontWeight: 700,
                  marginBottom: isMobile ? "16px" : "20px",
                  background: "linear-gradient(135deg, #fff 0%, #aaa 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Featured Virtual Tours
              </h2>
              <div
                style={{
                  width: isMobile ? 50 : 80,
                  height: 2,
                  background: "linear-gradient(90deg, transparent, #fff, transparent)",
                  margin: isMobile ? "16px auto 20px" : "20px auto 30px",
                }}
              />
              <p
                style={{
                  color: "#888",
                  maxWidth: "600px",
                  margin: "0 auto",
                  fontSize: isMobile ? "14px" : "16px",
                  lineHeight: 1.7,
                  padding: isMobile ? "0 16px" : "0",
                }}
              >
                Explore our curated collection of luxury properties
              </p>

              {/* Filter Chips - Responsive */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: isMobile ? "8px" : "12px",
                  marginTop: isMobile ? "30px" : "40px",
                  flexWrap: "wrap",
                  padding: isMobile ? "0 8px" : "0",
                }}
              >
                {["all", "luxury", "modern", "waterfront"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    style={{
                      padding: isMobile ? "6px 16px" : "8px 24px",
                      borderRadius: "40px",
                      background: selectedFilter === filter ? "white" : "rgba(255,255,255,0.05)",
                      color: selectedFilter === filter ? "#050505" : "#aaa",
                      border: selectedFilter === filter ? "none" : "1px solid rgba(255,255,255,0.1)",
                      fontSize: isMobile ? "12px" : "14px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      textTransform: "capitalize",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {filter === "all" ? "All Properties" : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Scroll Controls Hint - Hidden on mobile */}
            {!isMobile && filteredHouses.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "20px",
                  paddingRight: "30px",
                }}
              >
                <span style={{ fontSize: "12px", color: "#555", letterSpacing: "1px" }}>
                  DRAG TO SCROLL →
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => scrollToCard(Math.max(0, activeIndex - 1))}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    ←
                  </button>
                  <button
                    onClick={() => scrollToCard(Math.min(filteredHouses.length - 1, activeIndex + 1))}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    →
                  </button>
                </div>
              </div>
            )}

            {/* Horizontal Scroll Container - Responsive */}
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: isMobile ? 40 : 48,
                    height: isMobile ? 40 : 48,
                    border: `2px solid rgba(255,255,255,0.1)`,
                    borderTop: `2px solid white`,
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 20px",
                  }} />
                  <p style={{ color: "#888", fontSize: isMobile ? "14px" : "16px" }}>Loading luxury properties...</p>
                </div>
              </div>
            ) : filteredHouses.length === 0 ? (
              <div style={{ textAlign: "center", padding: isMobile ? "60px 20px" : "80px 20px" }}>
                <p style={{ color: "#888", fontSize: isMobile ? "16px" : "18px" }}>No properties available at the moment.</p>
              </div>
            ) : (
              <div
                ref={scrollContainerRef}
                style={{
                  display: "flex",
                  gap: isMobile ? "16px" : "24px",
                  overflowX: "auto",
                  overflowY: "hidden",
                  scrollBehavior: "smooth",
                  padding: isMobile ? "12px 16px 30px" : "20px 30px 40px",
                  cursor: isMobile ? "auto" : "grab",
                  scrollbarWidth: "thin",
                  WebkitOverflowScrolling: "touch",
                }}
                onMouseEnter={() => !isMobile && setIsHoveringScroll(true)}
                onMouseLeave={() => {
                  if (!isMobile) {
                    setIsHoveringScroll(false);
                    handleMouseLeaveScroll();
                  }
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMoveDrag}
                onMouseUp={handleMouseUpDrag}
              >
                {filteredHouses.map((house, index) => (
                  <Link
                    key={house._id}
                    href={`/house/${house._id}`}
                    style={{ textDecoration: "none", flex: "0 0 auto", width: isMobile ? "300px" : "380px" }}
                  >
                    <div
                      style={{
                        background: "#111",
                        borderRadius: isMobile ? "20px" : "28px",
                        overflow: "hidden",
                        border: activeIndex === index && !isHoveringScroll && !isMobile ? "2px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.06)",
                        transition: "all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
                        transform: activeIndex === index && !isHoveringScroll && !isMobile ? "scale(1.02)" : "scale(1)",
                        boxShadow: activeIndex === index && !isHoveringScroll && !isMobile ? "0 20px 40px rgba(0,0,0,0.4)" : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = "translateY(-12px) scale(1.02)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                          e.currentTarget.style.boxShadow = "0 30px 50px -20px rgba(0,0,0,0.6)";
                          handleCardHover(true);
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = activeIndex === index && !isHoveringScroll ? "scale(1.02)" : "scale(1)";
                          e.currentTarget.style.borderColor = activeIndex === index && !isHoveringScroll ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.06)";
                          handleCardHover(false);
                        }
                      }}
                    >
                      {/* Image Container - Responsive */}
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: isMobile ? "220px" : "280px",
                          overflow: "hidden",
                          background: "#1a1a1a",
                        }}
                      >
                        {house.image ? (
                          <img
                            src={getImageUrl(house.image)}
                            alt={house.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.6s ease",
                            }}
                            onError={(e) => {
                              console.error("Image failed to load:", getImageUrl(house.image));
                              (e.target as HTMLImageElement).style.display = "none";
                              const fallback = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        
                        {/* Fallback for missing images */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: house.image ? "none" : "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
                            color: "#666",
                            fontSize: isMobile ? "12px" : "14px",
                          }}
                        >
                          🏠 No Image
                        </div>
                        
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "50%",
                            background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                          }}
                        />

                        <div
                          style={{
                            position: "absolute",
                            top: isMobile ? "12px" : "16px",
                            right: isMobile ? "12px" : "16px",
                            background: "rgba(0,0,0,0.6)",
                            backdropFilter: "blur(8px)",
                            padding: isMobile ? "4px 10px" : "6px 12px",
                            borderRadius: "30px",
                            fontSize: isMobile ? "10px" : "11px",
                            fontWeight: 600,
                            letterSpacing: "1px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span style={{ fontSize: isMobile ? "12px" : "14px" }}>🔄</span> LIVE 360°
                        </div>

                        {house.price && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: isMobile ? "12px" : "16px",
                              left: isMobile ? "12px" : "16px",
                              background: "rgba(0,0,0,0.7)",
                              backdropFilter: "blur(8px)",
                              padding: isMobile ? "4px 10px" : "6px 14px",
                              borderRadius: "30px",
                              fontSize: isMobile ? "12px" : "14px",
                              fontWeight: 700,
                            }}
                          >
                            {house.price}
                          </div>
                        )}
                      </div>

                      {/* Content - Responsive */}
                      <div style={{ padding: isMobile ? "16px" : "24px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: isMobile ? "8px" : "12px",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: isMobile ? "18px" : "20px",
                              fontWeight: 700,
                              margin: 0,
                              lineHeight: 1.3,
                            }}
                          >
                            {house.title.length > (isMobile ? 25 : 30) 
                              ? house.title.substring(0, isMobile ? 25 : 30) + "..." 
                              : house.title}
                          </h3>
                          {house.area && (
                            <div
                              style={{
                                background: "rgba(255,255,255,0.08)",
                                borderRadius: "20px",
                                padding: isMobile ? "3px 8px" : "4px 10px",
                                fontSize: isMobile ? "10px" : "11px",
                                color: "#aaa",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {house.area}
                            </div>
                          )}
                        </div>

                        <p
                          style={{
                            color: "#888",
                            fontSize: isMobile ? "11px" : "13px",
                            marginBottom: isMobile ? "12px" : "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>📍</span> 
                          {house.location && house.location.length > (isMobile ? 30 : 40)
                            ? house.location.substring(0, isMobile ? 30 : 40) + "..."
                            : house.location || house.subtitle || "Premium Location"}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            gap: isMobile ? "12px" : "16px",
                            marginBottom: isMobile ? "16px" : "20px",
                            paddingBottom: isMobile ? "12px" : "16px",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          {house.bedrooms && (
                            <span style={{ fontSize: isMobile ? "12px" : "13px", color: "#aaa", display: "flex", alignItems: "center", gap: "4px" }}>
                              🛏️ {house.bedrooms}
                            </span>
                          )}
                          {house.bathrooms && (
                            <span style={{ fontSize: isMobile ? "12px" : "13px", color: "#aaa", display: "flex", alignItems: "center", gap: "4px" }}>
                              🛁 {house.bathrooms}
                            </span>
                          )}
                        </div>

                        <p
                          style={{
                            color: "#aaa",
                            lineHeight: 1.6,
                            fontSize: isMobile ? "12px" : "14px",
                          }}
                        >
                          {house.description?.slice(0, isMobile ? 80 : 100)}
                          {house.description && house.description.length > (isMobile ? 80 : 100) ? "..." : ""}
                        </p>

                        <button
                          style={{
                            marginTop: isMobile ? "16px" : "20px",
                            padding: isMobile ? "8px 20px" : "10px 24px",
                            borderRadius: "40px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            background: "transparent",
                            color: "white",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            width: "100%",
                            fontSize: isMobile ? "13px" : "14px",
                          }}
                          onMouseEnter={(e) => {
                            if (!isMobile) {
                              e.currentTarget.style.background = "white";
                              e.currentTarget.style.color = "#050505";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isMobile) {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "white";
                            }
                          }}
                        >
                          Enter Virtual Tour →
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Progress Dots - Responsive */}
            {!loading && filteredHouses.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: isMobile ? "6px" : "10px",
                  marginTop: isMobile ? "20px" : "30px",
                  flexWrap: "wrap",
                }}
              >
                {filteredHouses.slice(0, isMobile ? 6 : filteredHouses.length).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToCard(index)}
                    style={{
                      width: activeIndex === index ? (isMobile ? "20px" : "30px") : (isMobile ? "6px" : "8px"),
                      height: isMobile ? "6px" : "8px",
                      borderRadius: "4px",
                      background: activeIndex === index ? "white" : "rgba(255,255,255,0.2)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
                {filteredHouses.length > 6 && isMobile && (
                  <span style={{ color: "#555", fontSize: "11px", marginLeft: "4px" }}>
                    +{filteredHouses.length - 6}
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* About Section - Dynamic from WebSetting */}
        <section
          id="about"
          className="reveal"
          style={{
            padding: isMobile ? "60px 16px" : "140px 30px",
            maxWidth: "1400px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(400px, 1fr))",
            gap: isMobile ? "40px" : "80px",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                color: "#888",
                letterSpacing: isMobile ? "3px" : "4px",
                marginBottom: isMobile ? "15px" : "20px",
                textTransform: "uppercase",
                fontSize: isMobile ? "11px" : "13px",
              }}
            >
              About {webSetting?.companyName || "Experience"}
            </p>
            <h2 style={{ fontSize: isMobile ? "clamp(28px, 8vw, 42px)" : "clamp(36px, 6vw, 70px)", lineHeight: 1.1, marginBottom: isMobile ? "20px" : "30px" }}>
              {webSetting?.aboutTitle || "Redefining Virtual Spaces"}
            </h2>
            <p style={{ color: "#aaa", lineHeight: 1.8, fontSize: isMobile ? "15px" : "18px" }}>
              {webSetting?.aboutDescription || "Our immersive platform combines cinematic storytelling, interactive 360° technology, and modern visual experiences to create next-generation digital environments. Explore luxury interiors, modern architecture, and premium spaces with fluid navigation and immersive visual detail, powered by cutting-edge rendering technology."}
            </p>
            <div style={{ marginTop: isMobile ? "30px" : "35px", display: "flex", gap: isMobile ? "16px" : "20px", flexWrap: "wrap" }}>
              <div>
                <h3 style={{ fontSize: isMobile ? "32px" : "42px", fontWeight: 700 }}>150+</h3>
                <p style={{ color: "#666", fontSize: isMobile ? "12px" : "14px" }}>Virtual Tours</p>
              </div>
              <div>
                <h3 style={{ fontSize: isMobile ? "32px" : "42px", fontWeight: 700 }}>12K+</h3>
                <p style={{ color: "#666", fontSize: isMobile ? "12px" : "14px" }}>Happy Clients</p>
              </div>
              <div>
                <h3 style={{ fontSize: isMobile ? "32px" : "42px", fontWeight: 700 }}>{houses.length}+</h3>
                <p style={{ color: "#666", fontSize: isMobile ? "12px" : "14px" }}>Properties</p>
              </div>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: isMobile ? "300px" : "550px",
              borderRadius: isMobile ? "20px" : "30px",
              overflow: "hidden",
              boxShadow: "0 30px 50px -20px rgba(0,0,0,0.5)",
              background: "#1a1a1a",
            }}
          >
            {webSetting?.aboutImage ? (
              <img
                src={getImageUrl(webSetting.aboutImage)}
                alt={webSetting.aboutTitle || "About"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.7s ease",
                }}
                className="hover-scale"
              />
            ) : (
              <Image
                src="/about.jpg"
                alt="About"
                fill
                style={{
                  objectFit: "cover",
                  transition: "transform 0.7s ease",
                }}
                className="hover-scale"
              />
            )}
          </div>
        </section>

        {/* Features Section - Responsive */}
        <section
          className="reveal"
          style={{
            padding: isMobile ? "60px 16px" : "120px 30px",
            background: "linear-gradient(180deg, #0a0a0a 0%, #050505 100%)",
          }}
        >
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: isMobile ? "40px" : "80px" }}>
              <p style={{ color: "#888", letterSpacing: isMobile ? "3px" : "4px", textTransform: "uppercase", marginBottom: isMobile ? "10px" : "15px", fontSize: isMobile ? "11px" : "13px" }}>
                Features
              </p>
              <h2 style={{ fontSize: isMobile ? "clamp(28px, 8vw, 42px)" : "clamp(36px, 6vw, 70px)" }}>
                Built For Immersion
              </h2>
            </div>

            <div className="features-grid" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: isMobile ? "20px" : "30px" }}>
              {[
                { title: "360° Navigation", desc: "Smooth panoramic movement with immersive room exploration and intuitive controls.", icon: "🌐" },
                { title: "Cinematic Motion", desc: "Luxury transitions and fluid animated experiences that feel like a film.", icon: "🎬" },
                { title: "Interactive Hotspots", desc: "Navigate spaces dynamically with smart interactions and hidden details.", icon: "✨" },
                { title: "Ultra HD Visuals", desc: "High-resolution environments optimized for modern devices with HDR support.", icon: "📸" },
                { title: "Real-time Rendering", desc: "Dynamic lighting and shadows that react to your movement.", icon: "⚡" },
                { title: "Cross-platform", desc: "Seamless experience across desktop, mobile, and VR headsets.", icon: "📱" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="stagger-child"
                  style={{
                    background: "linear-gradient(135deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.9) 100%)",
                    padding: isMobile ? "24px" : "40px",
                    borderRadius: isMobile ? "20px" : "28px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transition: "transform 0.3s ease, border-color 0.3s ease",
                  }}
                >
                  <div style={{ fontSize: isMobile ? "36px" : "48px", marginBottom: isMobile ? "16px" : "20px" }}>{item.icon}</div>
                  <h3 style={{ fontSize: isMobile ? "20px" : "26px", marginBottom: isMobile ? "12px" : "16px", fontWeight: 600 }}>{item.title}</h3>
                  <p style={{ color: "#888", lineHeight: 1.6, fontSize: isMobile ? "13px" : "16px" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section - Responsive with dynamic contact info */}
        <section
          id="contact"
          ref={contactRef}
          className="reveal"
          style={{
            padding: isMobile ? "60px 16px" : "120px 30px",
            background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)",
          }}
        >
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: isMobile ? "40px" : "70px" }}>
              <p style={{ color: "#888", letterSpacing: isMobile ? "3px" : "4px", textTransform: "uppercase", marginBottom: isMobile ? "10px" : "15px", fontSize: isMobile ? "11px" : "13px" }}>
                Get In Touch
              </p>
              <h2 style={{ fontSize: isMobile ? "clamp(28px, 8vw, 42px)" : "clamp(36px, 6vw, 70px)", marginBottom: isMobile ? "16px" : "20px" }}>
                Let's Create Your
                <br />
                <span style={{ background: "linear-gradient(135deg, #fff, #888)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Virtual Experience</span>
              </h2>
              <div style={{ width: isMobile ? 40 : 60, height: 2, background: "#333", margin: isMobile ? "16px auto 0" : "20px auto 0" }} />
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(380px, 1fr))",
              gap: isMobile ? "40px" : "60px",
            }}>
              {/* Left Side - Dynamic Contact Info */}
              <div>
                <p style={{ color: "#aaa", fontSize: isMobile ? "15px" : "18px", lineHeight: 1.7, marginBottom: isMobile ? "30px" : "40px" }}>
                  Ready to bring your vision to life? Whether you're looking for a virtual tour,
                  interactive 360° experience, or full-scale digital environment — we're here to help.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "20px" : "25px", marginBottom: isMobile ? "30px" : "40px" }}>
                  {webSetting?.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "14px" : "18px" }}>
                      <div style={{
                        width: isMobile ? "44px" : "52px",
                        height: isMobile ? "44px" : "52px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: isMobile ? "12px" : "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "20px" : "24px",
                      }}>
                        📧
                      </div>
                      <div>
                        <p style={{ color: "#666", fontSize: isMobile ? "10px" : "12px", marginBottom: "4px" }}>EMAIL US</p>
                        <a href={`mailto:${webSetting.email}`} style={{ color: "white", textDecoration: "none", fontSize: isMobile ? "14px" : "16px" }}>{webSetting.email}</a>
                      </div>
                    </div>
                  )}
                  {webSetting?.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "14px" : "18px" }}>
                      <div style={{
                        width: isMobile ? "44px" : "52px",
                        height: isMobile ? "44px" : "52px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: isMobile ? "12px" : "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "20px" : "24px",
                      }}>
                        📞
                      </div>
                      <div>
                        <p style={{ color: "#666", fontSize: isMobile ? "10px" : "12px", marginBottom: "4px" }}>CALL US</p>
                        <a href={`tel:${webSetting.phone}`} style={{ color: "white", textDecoration: "none", fontSize: isMobile ? "14px" : "16px" }}>{webSetting.phone}</a>
                      </div>
                    </div>
                  )}
                  {webSetting?.address && (
                    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "14px" : "18px" }}>
                      <div style={{
                        width: isMobile ? "44px" : "52px",
                        height: isMobile ? "44px" : "52px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: isMobile ? "12px" : "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "20px" : "24px",
                      }}>
                        🗺️
                      </div>
                      <div>
                        <p style={{ color: "#666", fontSize: isMobile ? "10px" : "12px", marginBottom: "4px" }}>VISIT US</p>
                        <p style={{ color: "white", fontSize: isMobile ? "14px" : "16px" }}>{webSetting.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: isMobile ? "16px" : "20px",
                  padding: isMobile ? "20px" : "24px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <h3 style={{ fontSize: isMobile ? "16px" : "18px", marginBottom: isMobile ? "12px" : "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>⏰</span> Business Hours
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#aaa", fontSize: isMobile ? "12px" : "14px" }}>
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 8:00 PM</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#aaa", fontSize: isMobile ? "12px" : "14px" }}>
                    <span>Saturday</span>
                    <span>10:00 AM - 6:00 PM</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: isMobile ? "12px" : "14px" }}>
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>

                {/* Dynamic Social Links */}
                <div style={{ display: "flex", gap: isMobile ? "12px" : "15px", marginTop: isMobile ? "24px" : "30px", flexWrap: "wrap" }}>
                  {webSetting?.twitter && (
                    <a
                      href={webSetting.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: isMobile ? "38px" : "44px",
                        height: isMobile ? "38px" : "44px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "18px" : "20px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                    >
                      𝕏
                    </a>
                  )}
                  {webSetting?.instagram && (
                    <a
                      href={webSetting.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: isMobile ? "38px" : "44px",
                        height: isMobile ? "38px" : "44px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "18px" : "20px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                    >
                      📷
                    </a>
                  )}
                  {webSetting?.linkedin && (
                    <a
                      href={webSetting.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: isMobile ? "38px" : "44px",
                        height: isMobile ? "38px" : "44px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "18px" : "20px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                    >
                      💼
                    </a>
                  )}
                  {webSetting?.youtube && (
                    <a
                      href={webSetting.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: isMobile ? "38px" : "44px",
                        height: isMobile ? "38px" : "44px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "18px" : "20px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                    >
                      🎥
                    </a>
                  )}
                  {webSetting?.facebook && (
                    <a
                      href={webSetting.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: isMobile ? "38px" : "44px",
                        height: isMobile ? "38px" : "44px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "18px" : "20px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                    >
                      📘
                    </a>
                  )}
                </div>
              </div>

              {/* Right Side - Contact Form - Responsive */}
              <div>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: isMobile ? "16px" : "20px" }}>
                  {formStatus.type && (
                    <div style={{
                      padding: isMobile ? "12px 16px" : "16px 20px",
                      borderRadius: isMobile ? "12px" : "16px",
                      background: formStatus.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      border: `1px solid ${formStatus.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                      marginBottom: "8px",
                    }}>
                      <p style={{ color: formStatus.type === "success" ? "#4ade80" : "#f87171", fontSize: isMobile ? "12px" : "14px" }}>
                        {formStatus.message}
                      </p>
                    </div>
                  )}

                  <div>
                    <label style={{ display: "block", marginBottom: isMobile ? "6px" : "8px", fontSize: isMobile ? "11px" : "13px", color: "#888", letterSpacing: "1px" }}>
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      style={{
                        width: "100%",
                        padding: isMobile ? "14px 16px" : "16px 20px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: isMobile ? "12px" : "16px",
                        color: "white",
                        fontSize: isMobile ? "14px" : "15px",
                        transition: "all 0.3s ease",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: isMobile ? "6px" : "8px", fontSize: isMobile ? "11px" : "13px", color: "#888", letterSpacing: "1px" }}>
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="hello@example.com"
                      style={{
                        width: "100%",
                        padding: isMobile ? "14px 16px" : "16px 20px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: isMobile ? "12px" : "16px",
                        color: "white",
                        fontSize: isMobile ? "14px" : "15px",
                        transition: "all 0.3s ease",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: isMobile ? "6px" : "8px", fontSize: isMobile ? "11px" : "13px", color: "#888", letterSpacing: "1px" }}>
                      PHONE NUMBER (OPTIONAL)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (234) 567-8900"
                      style={{
                        width: "100%",
                        padding: isMobile ? "14px 16px" : "16px 20px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: isMobile ? "12px" : "16px",
                        color: "white",
                        fontSize: isMobile ? "14px" : "15px",
                        transition: "all 0.3s ease",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: isMobile ? "6px" : "8px", fontSize: isMobile ? "11px" : "13px", color: "#888", letterSpacing: "1px" }}>
                      SERVICE INTERESTED IN
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: isMobile ? "14px 16px" : "16px 20px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: isMobile ? "12px" : "16px",
                        color: "white",
                        fontSize: isMobile ? "14px" : "15px",
                        transition: "all 0.3s ease",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="virtual-tour">Virtual Tour Creation</option>
                      <option value="360-photography">360° Photography</option>
                      <option value="interactive-experience">Interactive Experience</option>
                      <option value="consultation">Consultation</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: isMobile ? "6px" : "8px", fontSize: isMobile ? "11px" : "13px", color: "#888", letterSpacing: "1px" }}>
                      YOUR MESSAGE *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your project..."
                      rows={isMobile ? 4 : 5}
                      style={{
                        width: "100%",
                        padding: isMobile ? "14px 16px" : "16px 20px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: isMobile ? "12px" : "16px",
                        color: "white",
                        fontSize: isMobile ? "14px" : "15px",
                        transition: "all 0.3s ease",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      marginTop: isMobile ? "8px" : "10px",
                      padding: isMobile ? "14px 24px" : "18px 32px",
                      background: "white",
                      color: "#050505",
                      border: "none",
                      borderRadius: "40px",
                      fontSize: isMobile ? "14px" : "16px",
                      fontWeight: 600,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      transition: "all 0.3s ease",
                      opacity: isSubmitting ? 0.7 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span style={{
                          display: "inline-block",
                          width: "16px",
                          height: "16px",
                          border: "2px solid #050505",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }} />
                        Sending...
                      </>
                    ) : (
                      "Send Message →"
                    )}
                  </button>

                  <p style={{ fontSize: isMobile ? "10px" : "12px", color: "#666", textAlign: "center", marginTop: isMobile ? "16px" : "20px" }}>
                    By submitting, you agree to our Privacy Policy. We'll never share your information.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Responsive with dynamic footer text */}
        <footer
          style={{
            padding: isMobile ? "40px 16px" : "60px 30px",
            textAlign: "center",
            color: "#666",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: isMobile ? "12px" : "14px",
          }}
        >
          <p>{webSetting?.footerText || `© 2026 ${webSetting?.companyName || "VRTX"} Virtual Experiences — Crafting the future of digital spaces`}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? "20px" : "30px", marginTop: isMobile ? "16px" : "20px", flexWrap: "wrap" }}>
            {webSetting?.twitter && <a href={webSetting.twitter} target="_blank" rel="noopener noreferrer" style={{ color: "#666", transition: "color 0.3s" }}>Twitter</a>}
            {webSetting?.instagram && <a href={webSetting.instagram} target="_blank" rel="noopener noreferrer" style={{ color: "#666", transition: "color 0.3s" }}>Instagram</a>}
            {webSetting?.linkedin && <a href={webSetting.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#666", transition: "color 0.3s" }}>LinkedIn</a>}
            {webSetting?.facebook && <a href={webSetting.facebook} target="_blank" rel="noopener noreferrer" style={{ color: "#666", transition: "color 0.3s" }}>Facebook</a>}
          </div>
        </footer>
      </main>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        @keyframes scrollIndicator {
          0%, 100% { opacity: 1; transform: translateX(-50%) translateY(0); }
          50% { opacity: 0.3; transform: translateX(-50%) translateY(8px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
        .stagger-child {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .stagger-child.active {
          opacity: 1;
          transform: translateY(0);
        }
        .hover-scale:hover {
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
}