import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import logo from "@/assets/Logo.jpg";
import { loginAuthorized } from "@/lib/api/authApi";
import {
  getAdminSession,
  setAdminSession,
  type UserRole,
} from "@/lib/api/authSession";
import {
  closeLoginDialog,
  getLoginDialogReturnTo,
  getLoginDialogSnapshot,
  isLoginDialogOpen,
  openLoginDialog,
  subscribeLoginDialog,
} from "@/lib/loginDialogStore";

export default function LoginDialog() {
  const location = useLocation();
  const navigate = useNavigate();
  // Re-subscribes on every store change; the snapshot itself is just a version
  // counter, so re-read the actual open/returnTo state after each notify.
  useSyncExternalStore(subscribeLoginDialog, getLoginDialogSnapshot);
  const open = isLoginDialogOpen();
  const returnTo = getLoginDialogReturnTo();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Auto-open once on app load if there's no active session ──────────────
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    if (!getAdminSession()) openLoginDialog();
    // Only ever check on the initial mount (app load), not on every navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Lock background scroll while the dialog is open ───────────────────────
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // ── Close on Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLoginDialog();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleClose = () => {
    closeLoginDialog();
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    try {
      const data = await loginAuthorized(email, password);
      setAdminSession({
        token: data.token,
        userId: data.userId,
        name: data.name,
        email: data.email,
        username: data.username,
        role: data.role as UserRole,
        segment: data.segment,
        department: data.department,
      });

      // Only navigate when the dialog was opened because a specific page
      // (e.g. /admin, /helpdesk) required a session — signing in from a
      // plain popup (e.g. on the Home page) should keep the user right
      // where they were.
      const target = returnTo;

      closeLoginDialog();
      setEmail("");
      setPassword("");

      if (target && target !== location.pathname) {
        navigate(target, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:w-90 shadow-2xl border border-slate-100 overflow-hidden">
        <button
          onClick={handleClose}
          aria-label="Close"
          disabled
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="flex flex-col items-center px-6 pt-8 pb-5 border-b border-slate-100">
          <img
            src={logo}
            alt="CIC Livestock Solutions"
            className="h-11 w-auto object-contain mb-4"
          />
          <p className="font-semibold text-cic-900">Welcome to CIC Intranet</p>
          <p className="text-xs text-slate-400 mt-0.5">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">
              Email
            </label>
            <input
              placeholder="your@email.com"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cic-500/30 focus:border-cic-400 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cic-500/30 focus:border-cic-400 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-center">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1 pb-3 sm:pb-0">
            <button
              type="button"
              onClick={handleClose}
              disabled
              className="flex-1 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors"
            >
              Not now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-cic-900 hover:bg-cic-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
