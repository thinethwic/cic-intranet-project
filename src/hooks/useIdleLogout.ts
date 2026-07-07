import { useEffect, useRef } from "react";
import { getAdminSession, logout } from "@/lib/api/authSession";

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const;

// Logs the user out after 10 minutes with no mouse/keyboard/scroll activity.
// Only arms the timer while an admin session actually exists, so anonymous
// visitors never pay for the listeners doing anything.
export function useIdleLogout(): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleLogout = () => {
      clearTimer();
      if (!getAdminSession()) return;

      timerRef.current = setTimeout(() => {
        if (getAdminSession()) {
          logout();
        }
      }, IDLE_TIMEOUT_MS);
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, scheduleLogout, { passive: true }),
    );

    scheduleLogout();

    return () => {
      clearTimer();
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, scheduleLogout),
      );
    };
  }, []);
}
