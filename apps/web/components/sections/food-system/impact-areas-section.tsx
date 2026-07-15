"use client";

import { useEffect, useRef, useState } from "react";
import Container from "@/components/layout/container";
import { motion } from "framer-motion";
import { TranslatableText } from "@/components/translate/TranslatableText";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const DATA_POINTS = [
  {
    id: "proj-1",
    lat: -1.9441,
    lng: 30.0619,
    country: "Rwanda",
    city: "Kigali",
    short: "rw",
    percentage: 70,
    name: "Kigali Urban Farming Initiative",
    community: "Nyarugenge",
    contactPerson: "Jean Bosco",
    description:
      "Empowering youth through vertical farming and hydroponics in the heart of Kigali.",
    current: { value: "1,240", percent: "18.4", isGrown: true },
    previous: { value: "320", percent: "12.1", isGrown: true },
  },
  {
    id: "proj-4",
    lat: -1.4994,
    lng: 29.634,
    country: "Rwanda",
    city: "Musanze",
    short: "rw",
    percentage: 55,
    name: "Musanze Potato Cooperative",
    community: "Musanze District",
    contactPerson: "Pierre Nkurunziza",
    description:
      "Supporting local farmers in sustainable potato cultivation and market access in Northern Rwanda.",
    current: { value: "890", percent: "14.2", isGrown: true },
    previous: { value: "210", percent: "9.8", isGrown: true },
  },
  {
    id: "proj-5",
    lat: -1.8933,
    lng: 30.1065,
    country: "Rwanda",
    city: "Gasabo",
    short: "rw",
    percentage: 60,
    name: "Gasabo Youth Agricultural Hub",
    community: "Gasabo District",
    contactPerson: "Marie Claire Mukamana",
    description:
      "Training center for young agripreneurs in modern farming techniques and business skills.",
    current: { value: "740", percent: "22.0", isGrown: true },
    previous: { value: "185", percent: "15.3", isGrown: true },
  },
  {
    id: "proj-10",
    lat: -1.2975,
    lng: 30.3259,
    country: "Rwanda",
    city: "Nyagatare",
    short: "rw",
    percentage: 50,
    name: "Nyagatare Livestock Development",
    community: "Nyagatare District",
    contactPerson: "Jean Baptiste Nsengiyumva",
    description:
      "Improving cattle rearing practices and veterinary services for pastoral communities.",
    current: { value: "620", percent: "10.5", isGrown: false },
    previous: { value: "280", percent: "11.2", isGrown: false },
  },
  {
    id: "proj-17",
    lat: -2.0833,
    lng: 29.75,
    country: "Rwanda",
    city: "Muhanga",
    short: "rw",
    percentage: 45,
    name: "Muhanga Honey Production",
    community: "Muhanga District",
    contactPerson: "Fabrice Nsengimana",
    description:
      "Training beekeepers and establishing honey collection centers for improved income generation.",
    current: { value: "480", percent: "16.7", isGrown: true },
    previous: { value: "140", percent: "11.4", isGrown: true },
  },
  {
    id: "proj-18",
    lat: -2.4699,
    lng: 29.4801,
    country: "Rwanda",
    city: "Nyamagabe",
    short: "rw",
    percentage: 40,
    name: "Nyamagabe Forest Conservation",
    community: "Nyamagabe District",
    contactPerson: "Eugene Nzabonimana",
    description: "Community-based forest conservation and agroforestry program in Southern Rwanda.",
    current: { value: "390", percent: "8.9", isGrown: true },
    previous: { value: "95", percent: "7.2", isGrown: false },
  },
  {
    id: "proj-11",
    lat: 11.1771,
    lng: -4.2979,
    country: "Burkina Faso",
    city: "Bobo-Dioulasso",
    short: "bf",
    percentage: 55,
    name: "Bobo-Dioulasso Cotton Initiative",
    community: "Hauts-Bassins Region",
    contactPerson: "Amadou Traoré",
    description:
      "Supporting cotton farmers with improved seeds and access to international markets.",
    current: { value: "1,050", percent: "13.6", isGrown: true },
    previous: { value: "270", percent: "10.1", isGrown: true },
  },
  {
    id: "proj-16",
    lat: 12.4604,
    lng: -3.4605,
    country: "Burkina Faso",
    city: "Dédougou",
    short: "bf",
    percentage: 45,
    name: "Dédougou Sorghum Research Station",
    community: "Boucle du Mouhoun Region",
    contactPerson: "Dr. Oumarou Zongo",
    description:
      "Research and development center for drought-resistant sorghum varieties adapted to Sahel conditions.",
    current: { value: "560", percent: "9.3", isGrown: true },
    previous: { value: "190", percent: "9.8", isGrown: true },
  },
];

const TrendUp = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#10b981"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const TrendDown = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ef4444"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

const GlobeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default function ImpactAreaSection() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const circlesRef = useRef([]);
  const layersRef = useRef({ light: null, dark: null });
  const animFramesRef = useRef([]);
  const [isDark, setIsDark] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("Rwanda");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const COUNTRY_VIEWS = {
    Rwanda: { center: [-1.94, 29.87], zoom: 9 },
    "Burkina Faso": { center: [12.36, -1.53], zoom: 7 },
    Other: { center: [3, 22], zoom: 4 },
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
    if (mapRef.current) {
      const { center, zoom } = COUNTRY_VIEWS[country];
      mapRef.current.flyTo(center, zoom, { animate: true, duration: 1.2 });
    }
  };

  // Load Leaflet from CDN
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
    const scriptTag = document.head.appendChild(script);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(scriptTag)) document.head.removeChild(scriptTag);
    };
  }, []);

  // Init map once Leaflet loaded
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapRef.current) return;
    const L = window.L;

    const map = L.map(mapContainerRef.current, {
      center: [-1.94, 29.87],
      zoom: 9,
      zoomControl: false,
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      maxBoundsViscosity: 1.0,
    });
    mapRef.current = map;

    const lightLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        minZoom: 2,
        attribution: "© CARTO",
      },
    );
    const darkLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      minZoom: 2,
      attribution: "© CARTO",
    });
    layersRef.current = { light: lightLayer, dark: darkLayer };
    lightLayer.addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    const baseMaxRadius = 240000;

    DATA_POINTS.forEach((point, index) => {
      const scaleFactor = 1 / Math.pow(2, map.getZoom() - 3);
      const initialRadius = (point.percentage / 100) * baseMaxRadius * scaleFactor;
      const animDuration = 6000;
      const delay = index * 800;
      let startTime = null;

      // Mutable box so the animation loop always reads the latest zoom-adjusted radius
      const radiusRef = { current: initialRadius };

      const circle = L.circle([point.lat, point.lng], {
        fillColor: "#38bdf8",
        fillOpacity: 0.55,
        radius: initialRadius,
        color: "#38bdf8",
        weight: 0.5,
        opacity: 0.2,
      }).addTo(map);

      const animatePulse = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime + delay) % animDuration;
        const progress = elapsed / animDuration;
        const easing = Math.sin(progress * Math.PI) * Math.sin(progress * Math.PI * 0.5);
        const base = radiusRef.current;
        const currentRadius = base + (base * 1.2 - base) * easing;
        circle.setRadius(currentRadius);
        const raf = requestAnimationFrame(animatePulse);
        animFramesRef.current[index] = raf;
      };
      requestAnimationFrame(animatePulse);

      circle.on("mouseover", () => {
        setSelectedPoint(point);
        circle.setStyle({ fillOpacity: 0.8, weight: 1.5 });
      });
      circle.on("mouseout", () => {
        circle.setStyle({ fillOpacity: 0.55, weight: 0.5 });
      });

      circlesRef.current.push({ circle, data: point, radiusRef });
    });

    map.on("zoomend", () => {
      const zoom = map.getZoom();
      const scaleFactor = 1 / Math.pow(1.5, zoom - 3);
      circlesRef.current.forEach(({ data, radiusRef }) => {
        radiusRef.current = (data.percentage / 100) * baseMaxRadius * scaleFactor;
      });
    });

    return () => {
      animFramesRef.current.forEach(cancelAnimationFrame);
      map.remove();
      mapRef.current = null;
    };
  }, [leafletLoaded]);

  // Theme switching
  useEffect(() => {
    if (!mapRef.current || !layersRef.current.light) return;
    const map = mapRef.current;
    const { light, dark } = layersRef.current;
    const fillColor = isDark ? "#38bdf8" : "#6366f1";
    if (isDark) {
      map.removeLayer(light);
      if (!map.hasLayer(dark)) dark.addTo(map);
    } else {
      map.removeLayer(dark);
      if (!map.hasLayer(light)) light.addTo(map);
    }
    circlesRef.current.forEach(({ circle }) => {
      circle.setStyle({ fillColor, color: fillColor });
    });
  }, [isDark]);

  const topCities = [...DATA_POINTS].sort(
    (a, b) =>
      parseInt(b.current.value.replace(/,/g, "")) - parseInt(a.current.value.replace(/,/g, "")),
  );

  return (
    <section className="py-16 bg-white">
      <Container>
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
            <span>
              <TranslatableText>Where We </TranslatableText>
            </span>
            <span className="text-primary-green">
              <TranslatableText>Work</TranslatableText>
            </span>
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
            <TranslatableText>
              GanzAfrica operates across Africa, equipping young professionals with the skills and
              opportunities to drive meaningful change in Africa's agri-food systems. We currently
              have projects in 2 countries.
            </TranslatableText>
          </p>
          <div className="flex justify-center gap-12 sm:gap-20 mb-4">
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold text-green-700">8</p>
              <p className="text-sm text-gray-600">
                <TranslatableText>Projects</TranslatableText>
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold text-green-700">2</p>
              <p className="text-sm text-gray-600">
                <TranslatableText>Countries</TranslatableText>
              </p>
            </div>
          </div>
        </motion.div>
        <div
          style={{
            fontFamily: "'DM Mono', 'Fira Code', monospace",
            color: isDark ? "#e2e8f0" : "#1e293b",
          }}
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
            .leaflet-popup-content-wrapper { background: ${isDark ? "rgba(10,18,30,0.95)" : "rgba(255,255,255,0.96)"} !important; border: 1px solid ${isDark ? "rgba(56,189,248,0.25)" : "rgba(99,102,241,0.2)"} !important; border-radius: 10px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important; color: ${isDark ? "#e2e8f0" : "#1e293b"} !important; }
            .leaflet-popup-tip { background: ${isDark ? "rgba(10,18,30,0.95)" : "rgba(255,255,255,0.96)"} !important; }
            .leaflet-popup-close-button { color: ${isDark ? "#64748b" : "#94a3b8"} !important; }
            .leaflet-container { background: ${isDark ? "#0f172a" : "#e8f0f7"} !important; border-radius: 12px; }
            .city-row:hover { background: ${isDark ? "rgba(56,189,248,0.07)" : "rgba(22,101,52,0.05)"} !important; }
            .theme-btn:hover { opacity: 0.8; }
            ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${isDark ? "#1e3a5f" : "#bbf7d0"}; border-radius: 4px; }
          `}</style>

          {/* Controls row above the map */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {/* Country Dropdown */}
            <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 40,
                  cursor: "pointer",
                  background: isDark ? "#1e293b" : "#ffffff",
                  border: `1.5px solid ${isDark ? "#334155" : "#d1d5db"}`,
                  borderRadius: dropdownOpen ? "10px 10px 0 0" : 10,
                  padding: "10px 16px",
                  minWidth: 200,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  userSelect: "none",
                }}
              >
                <span
                  style={{ fontSize: 14, fontWeight: 500, color: isDark ? "#e2e8f0" : "#111827" }}
                >
                  {selectedCountry}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isDark ? "#94a3b8" : "#6b7280"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    background: isDark ? "#1e293b" : "#ffffff",
                    border: `1.5px solid ${isDark ? "#334155" : "#d1d5db"}`,
                    borderTop: "none",
                    borderRadius: "0 0 5px 5px",
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                >
                  {["Rwanda", "Burkina Faso", "Other"].map((country) => (
                    <div
                      key={country}
                      onClick={() => handleCountrySelect(country)}
                      style={{
                        padding: "10px 16px",
                        fontSize: 14,
                        cursor: "pointer",
                        color:
                          selectedCountry === country
                            ? isDark
                              ? "#38bdf8"
                              : "#166534"
                            : isDark
                              ? "#e2e8f0"
                              : "#111827",
                        background:
                          selectedCountry === country
                            ? isDark
                              ? "rgba(56,189,248,0.1)"
                              : "#dcfce7"
                            : "transparent",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCountry !== country)
                          e.currentTarget.style.background = isDark
                            ? "rgba(255,255,255,0.05)"
                            : "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCountry !== country)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {country}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Highlights button */}
            <button
              style={{
                background: isDark ? "#166534" : "#166534",
                color: "#ffffff",
                border: "none",
                borderRadius: 5,
                padding: "10px 22px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                // fontFamily: "inherit",
                letterSpacing: "0.01em",
                boxShadow: "0 2px 8px rgba(22,101,52,0.3)",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#15803d")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#166534")}
            >
              Highlights of our work
            </button>

            {/* Theme toggle */}
            <button
              className="theme-btn"
              onClick={() => setIsDark(!isDark)}
              style={{
                background: isDark ? "#1e293b" : "#ffffff",
                border: `1.5px solid ${isDark ? "#334155" : "#d1d5db"}`,
                borderRadius: 5,
                padding: "10px 16px",
                fontSize: 13,
                color: isDark ? "#94a3b8" : "#6b7280",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {isDark ? "☀" : "☾"}
            </button>
          </div>

          {/* Map Card */}
          <div
            style={{
              position: "relative",
              borderRadius: 5,
              overflow: "hidden",
              border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
              boxShadow: isDark ? "0 4px 32px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.08)",
              height: 384, // h-96 in Tailwind is 24rem = 384px
            }}
            onClick={() => setDropdownOpen(false)}
          >
            <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

            {!leafletLoaded && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDark ? "#0f172a" : "#f8fafc",
                  fontSize: 12,
                  color: isDark ? "#38bdf8" : "#166534",
                  letterSpacing: "0.15em",
                }}
              >
                LOADING MAP...
              </div>
            )}

            {/* Selected point overlay */}
            {selectedPoint && (
              <div
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: 20,
                  zIndex: 1000,
                  background: isDark ? "rgba(15,23,42,0.97)" : "rgba(255,255,255,0.97)",
                  border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                  borderRadius: 5,
                  padding: "14px 16px",
                  minWidth: 220,
                  maxWidth: 280,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ flex: 1, paddingRight: 8 }}>
                    <div
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 700,
                        fontSize: 12,
                        lineHeight: 1.3,
                      }}
                    >
                      {selectedPoint.name}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: isDark ? "#64748b" : "#94a3b8",
                        letterSpacing: "0.1em",
                        marginTop: 3,
                      }}
                    >
                      {selectedPoint.community} · {selectedPoint.country}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPoint(null)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: isDark ? "#475569" : "#94a3b8",
                      fontSize: 14,
                      padding: 0,
                      flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: isDark ? "#64748b" : "#64748b",
                    lineHeight: 1.5,
                    marginBottom: 10,
                  }}
                >
                  {selectedPoint.description}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "#166534",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  CONTACT: {selectedPoint.contactPerson}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { label: "FARMERS", ...selectedPoint.current },
                    { label: "BENEFICIARIES", ...selectedPoint.previous },
                  ].map(({ label, value, percent, isGrown }) => (
                    <div
                      key={label}
                      style={{
                        flex: 1,
                        background: isDark ? "rgba(22,101,52,0.08)" : "#f0fdf4",
                        borderRadius: 6,
                        padding: "8px 10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          color: isDark ? "#475569" : "#94a3b8",
                          letterSpacing: "0.08em",
                          marginBottom: 4,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: isGrown ? "#16a34a" : "#ef4444",
                        }}
                      >
                        {value}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 3 }}>
                        {isGrown ? <TrendUp /> : <TrendDown />}
                        <span style={{ fontSize: 10, color: isGrown ? "#16a34a" : "#ef4444" }}>
                          {percent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Hint text below map */}
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: isDark ? "#475569" : "#64748b",
          marginTop: 14,
          lineHeight: 1.6,
        }}
      >
        Hover over a project marker to view details. Click a marker to focus the map on that
        location. Use the + and − buttons to adjust zoom level.
      </p>
    </section>
  );
}
