import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import {
  ShieldAlert,
  AlertTriangle,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";
import type { Alert, AlertSeverity } from "@/types";

export type { Alert, AlertSeverity };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveImageUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path; // ✅ GCS URL — used as-is
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`; // local path
}

function getSeverity(alert: Alert): AlertSeverity {
  const raw: string =
    (alert as any).severity ?? (alert as any).alertSeverity ?? "info";
  const lower = raw.toLowerCase();
  if (lower === "critical" || lower === "warning" || lower === "info") {
    return lower as AlertSeverity;
  }
  return "info";
}

// ---------------------------------------------------------------------------
// Severity config
// ---------------------------------------------------------------------------
const SEVERITY_CONFIG: Record<
  AlertSeverity,
  {
    label: string;
    icon: React.ReactNode;
    badgeBg: string;
    badgeText: string;
    accentBar: string;
    topBar: string;
    iconBg: string;
    iconColor: string;
    flyerBorder: string;
    scrollThumb: string;
  }
> = {
  critical: {
    label: "CRITICAL",
    icon: <ShieldAlert size={16} />,
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
    accentBar: "bg-red-600",
    topBar: "bg-red-600",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    flyerBorder: "border-red-200",
    scrollThumb: "#dc2626",
  },
  warning: {
    label: "WARNING",
    icon: <AlertTriangle size={16} />,
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    accentBar: "bg-amber-500",
    topBar: "bg-amber-500",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    flyerBorder: "border-amber-200",
    scrollThumb: "#f59e0b",
  },
  info: {
    label: "ADVISORY",
    icon: <Shield size={16} />,
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-900",
    accentBar: "bg-blue-900",
    topBar: "bg-blue-900",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-900",
    flyerBorder: "border-blue-200",
    scrollThumb: "#1e3a8a",
  },
};

// ---------------------------------------------------------------------------
// FlyerLightbox
// ---------------------------------------------------------------------------
function FlyerLightbox({
  alerts,
  startIndex,
  onClose,
}: {
  alerts: Alert[];
  startIndex: number;
  onClose: () => void;
}) {
  const flyerAlerts = alerts.filter((a) => a.flyerImage);
  const startFlyerIndex = Math.max(
    0,
    flyerAlerts.findIndex((a) => a.id === alerts[startIndex]?.id),
  );
  const [current, setCurrent] = useState(startFlyerIndex);
  const [zoom, setZoom] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const isDragging = useRef(false);
  const dragStartClient = useRef({ x: 0, y: 0 });
  const txAtDrag = useRef(0);
  const tyAtDrag = useRef(0);
  const lastPinchDist = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  const txRef = useRef(tx);
  useEffect(() => {
    txRef.current = tx;
  }, [tx]);
  const tyRef = useRef(ty);
  useEffect(() => {
    tyRef.current = ty;
  }, [ty]);

  const resetView = useCallback(() => {
    setZoom(1);
    setTx(0);
    setTy(0);
  }, []);

  const clamp = (z: number) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
    return Math.abs(clamped - MIN_ZOOM) < 0.001 ? MIN_ZOOM : clamped;
  };

  const zoomAround = useCallback((newZoom: number) => {
    const z1 = clamp(newZoom);
    if (zoomRef.current === z1) return;
    setZoom(z1);
    if (z1 === MIN_ZOOM) {
      setTx(0);
      setTy(0);
    }
  }, []);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      resetView();
      setCurrent((p) => (p + dir + flyerAlerts.length) % flyerAlerts.length);
    },
    [flyerAlerts.length, resetView],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (zoomRef.current === 1) {
        if (e.key === "ArrowRight") navigate(1);
        if (e.key === "ArrowLeft") navigate(-1);
      }
      if (e.key === "+" || e.key === "=")
        zoomAround(zoomRef.current + ZOOM_STEP);
      if (e.key === "-") zoomAround(zoomRef.current - ZOOM_STEP);
      if (e.key === "0") resetView();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, navigate, zoomAround, resetView]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      zoomAround(zoomRef.current + -e.deltaY * 0.001 * 3);
    },
    [zoomAround],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomRef.current <= 1) return;
    e.preventDefault();
    isDragging.current = true;
    dragStartClient.current = { x: e.clientX, y: e.clientY };
    txAtDrag.current = txRef.current;
    tyAtDrag.current = tyRef.current;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setTy(tyAtDrag.current + (e.clientY - dragStartClient.current.y));
  };
  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      dragStartClient.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      txAtDrag.current = txRef.current;
      tyAtDrag.current = tyRef.current;
    }
    if (e.touches.length === 2) {
      isDragging.current = false;
      lastPinchDist.current = null;
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastPinchDist.current !== null)
        zoomAround(zoomRef.current + (dist - lastPinchDist.current) * 0.015);
      lastPinchDist.current = dist;
    } else if (
      e.touches.length === 1 &&
      isDragging.current &&
      zoomRef.current > 1
    ) {
      setTy(
        tyAtDrag.current + (e.touches[0].clientY - dragStartClient.current.y),
      );
    }
  };
  const handleTouchEnd = () => {
    isDragging.current = false;
    lastPinchDist.current = null;
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    zoomRef.current > 1 ? resetView() : zoomAround(2.5);
  };

  const active = flyerAlerts[current];
  if (!active) return null;
  const isZoomed = zoom > 1;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition"
      >
        <X className="w-4 h-4 stroke-[1.5]" />
      </button>

      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <button
          onClick={() => zoomAround(zoom - ZOOM_STEP)}
          className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4 stroke-[1.5]" />
        </button>
        <span className="text-white/70 text-xs font-mono min-w-[40px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => zoomAround(zoom + ZOOM_STEP)}
          className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4 stroke-[1.5]" />
        </button>
        {isZoomed && (
          <button
            onClick={resetView}
            className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        style={{
          cursor: isZoomed
            ? isDragging.current
              ? "grabbing"
              : "grab"
            : "default",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        onClick={!isZoomed ? onClose : undefined}
      >
        <img
          src={resolveImageUrl(active.flyerImage!)}
          alt={active.title}
          draggable={false}
          className="rounded-xl object-contain select-none"
          style={{
            maxHeight: "80vh",
            maxWidth: "85vw",
            transformOrigin: "50% 50%",
            transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
            transition: isDragging.current ? "none" : "transform 0.12s ease",
            willChange: "transform",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {active.title && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/70 text-sm text-center max-w-lg px-4 pointer-events-none">
          {active.title}
        </div>
      )}
      {flyerAlerts.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm pointer-events-none">
          {current + 1} / {flyerAlerts.length}
        </div>
      )}
      {flyerAlerts.length > 1 && !isZoomed && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(-1);
            }}
            className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(1);
            }}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition"
          >
            <ArrowRight className="w-4 h-4 stroke-[1.5]" />
          </button>
        </>
      )}
      {!isZoomed && (
        <p className="absolute bottom-6 right-6 text-white/30 text-xs pointer-events-none hidden md:block">
          Scroll or +/− to zoom · Double-click to zoom in · Drag to pan
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AlertCard
// ---------------------------------------------------------------------------
interface AlertCardProps {
  alerts?: Alert[];
  autoPlayInterval?: number;
  page?: number;
  pageSize?: number;
}

export function AlertCard({
  alerts: alertsProp,
  autoPlayInterval = 5000,
  page = 0,
  pageSize = 100,
}: AlertCardProps) {
  const { alerts: fetchedAlerts, loading, error } = useAlerts(page, pageSize);
  const alerts = alertsProp ?? fetchedAlerts;

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [paused, setPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [alerts.length]);

  const goTo = useCallback(
    (next: number) => {
      if (lightboxOpen) return;
      setFade(false);
      setTimeout(() => {
        setIndex((next + alerts.length) % alerts.length);
        setFade(true);
      }, 150);
    },
    [alerts.length, lightboxOpen],
  );

  const isEffectivelyPaused = paused || lightboxOpen;

  useEffect(() => {
    if (isEffectivelyPaused || alerts.length <= 1) return;
    const id = setInterval(() => goTo(index + 1), autoPlayInterval);
    return () => clearInterval(id);
  }, [index, isEffectivelyPaused, alerts.length, autoPlayInterval, goTo]);

  const openLightbox = () => {
    setLightboxOpen(true);
    setPaused(true);
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    setPaused(false);
  };

  if (!alertsProp && loading) {
    return (
      <Card className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-10 md:px-10 flex flex-col items-center justify-center gap-3 text-gray-400">
          <p className="text-sm">Loading alerts…</p>
        </div>
      </Card>
    );
  }

  if (!alertsProp && error) {
    return (
      <Card className="w-full bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden flex flex-col p-4">
        <div className="flex-1 w-full min-h-52 flex flex-col items-center justify-center gap-3 border border-dashed border-red-200 rounded-xl bg-red-50">
          <p className="text-sm font-medium text-red-400">
            Failed to load alerts. Please try again later.
          </p>
        </div>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-10 md:px-10 flex items-center justify-center text-gray-400">
          <p className="text-sm">No alerts at this time.</p>
        </div>
      </Card>
    );
  }

  const alert = alerts[index];
  const severity = getSeverity(alert);
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG["info"];
  const hasFlyer = Boolean(alert.flyerImage);

  return (
    <>
      {lightboxOpen && (
        <FlyerLightbox
          alerts={alerts}
          startIndex={index}
          onClose={closeLightbox}
        />
      )}

      {/* ── wider card: removed md:col-span-1 constraint lives in parent,
              but the card itself is now w-full with no max-width cap ── */}
      <Card
        className="w-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden p-0"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => !lightboxOpen && setPaused(false)}
      >
        {hasFlyer ? (
          <>
            {/* ── Severity banner — flush to top ── */}
            <div
              className={`${cfg.topBar} px-4 py-4 flex items-center justify-between`}
            >
              {/* Left: icon + labels */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                  {cfg.icon}
                </div>
                <div>
                  <p className="text-white/75 text-[18px] font-semibold uppercase tracking-widest leading-none mb-0.5">
                    Security Alert
                  </p>
                  <p className="text-white text-sm font-bold uppercase tracking-wide leading-none">
                    {cfg.label}
                  </p>
                </div>
              </div>

              {/* Right: date + nav arrows */}
              <div className="flex items-center gap-2">
                {alert.date && (
                  <span className="text-white/60 text-[11px]">
                    {alert.date}
                  </span>
                )}
                {alerts.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goTo(index - 1)}
                      className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      aria-label="Previous alert"
                    >
                      <ChevronLeft size={13} className="text-white" />
                    </button>
                    <button
                      onClick={() => goTo(index + 1)}
                      className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      aria-label="Next alert"
                    >
                      <ChevronRight size={13} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Flyer — flush, full-width ── */}
            <div
              className={`transition-opacity duration-[150ms] -mt-[1px] ${fade ? "opacity-100" : "opacity-0"}`}
            >
              <div
                className="relative group cursor-zoom-in overflow-hidden"
                onClick={openLightbox}
              >
                <img
                  src={resolveImageUrl(alert.flyerImage!)}
                  alt={alert.title}
                  className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300" />
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ZoomIn size={11} />
                  <span>View full</span>
                </div>
              </div>
            </div>

            {/* ── Footer: title + dots + link ── */}
            <div className="px-4 pt-1 pb-1">
              {alert.title && (
                <p className="text-gray-800 text-xs font-medium truncate mb-2">
                  {alert.title}
                </p>
              )}
              <div className="flex items-center justify-between">
                {alerts.length > 1 ? (
                  <div className="flex gap-1.5 items-center">
                    {alerts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`rounded-full transition-all duration-200 ${
                          i === index
                            ? `w-4 h-2 ${cfg.accentBar}`
                            : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                        }`}
                        aria-label={`Go to alert ${i + 1}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div />
                )}
                {alert.href && (
                  <a
                    href={alert.href}
                    className="text-xs font-semibold text-blue-700 hover:underline"
                  >
                    Read full advisory →
                  </a>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ── Non-flyer: standard header ── */}
            <div className="px-6 pt-4 md:px-10 md:pt-10">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex-shrink-0 flex items-center justify-center ${cfg.iconBg} ${cfg.iconColor}`}
                >
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Security Alert
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${cfg.badgeBg} ${cfg.badgeText} uppercase tracking-widest`}
                    >
                      {cfg.label}
                    </span>
                    {alert.date && (
                      <span className="text-[11px] text-gray-400">
                        {alert.date}
                      </span>
                    )}
                  </div>
                </div>
                {alerts.length > 1 && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => goTo(index - 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      aria-label="Previous alert"
                    >
                      <ChevronLeft size={14} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => goTo(index + 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      aria-label="Next alert"
                    >
                      <ChevronRight size={14} className="text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
              <div className="h-px bg-gray-200 mb-5" />
            </div>

            {/* ── Text body ── */}
            <div
              className={`transition-opacity duration-[150ms] ${fade ? "opacity-100" : "opacity-0"}`}
            >
              <div className="px-6 md:px-10">
                <p className="text-gray-900 text-sm md:text-[15px] font-semibold mb-2 leading-snug">
                  {alert.title}
                </p>
                <p className="text-gray-600 text-sm md:text-[14px] leading-relaxed">
                  {alert.body}
                </p>
                {alert.href && (
                  <a
                    href={alert.href}
                    className="inline-block mt-3 text-xs font-semibold text-blue-700 hover:underline"
                  >
                    Read full advisory →
                  </a>
                )}
              </div>
            </div>

            {/* ── Footer dots ── */}
            <div className="px-6 pb-6 md:px-10 md:pb-10 mt-5 flex items-center gap-3">
              <div className={`h-[2px] w-12 ${cfg.accentBar}`} />
              {alerts.length > 1 && (
                <div className="flex gap-1.5">
                  {alerts.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`rounded-full transition-all duration-200 ${
                        i === index
                          ? `w-4 h-2 ${cfg.accentBar}`
                          : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to alert ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </>
  );
}
