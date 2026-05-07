import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminCard } from "./admin-components";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/public/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "Invalid email or password");
        return;
      }

      const data = await res.json();
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem(
        "admin_user",
        JSON.stringify({
          userId: data.userId,
          name: data.name,
          email: data.email,
          username: data.username,
          role: data.role,
          segment: data.segment ?? null, // ← add
          department: data.department ?? null, // ← add
        }),
      );

      // ✅ Redirect to returnTo if present, else default based on role
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo");
      const role: string = data.role;

      if (returnTo) {
        navigate(decodeURIComponent(returnTo), { replace: true });
      } else {
        if (role === "SUPER_ADMIN" || role === "ADMIN") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/helpdesk", { replace: true });
        }
      }
    } catch {
      setError("Error Fail to Loggin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <AdminCard className="w-full max-w-md">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to manage the CIC intranet dashboard.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <Input
                type="email"
                placeholder="admin@cic.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  className="pl-9"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 rounded-2xl"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </AdminCard>
    </div>
  );
}
