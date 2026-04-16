import { Lock, LogIn, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AdminCard } from "./admin-components";

export default function AdminLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <AdminCard className="w-full max-w-md">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Admin Login
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to manage the CIC intranet dashboard.
              </p>
            </div>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <Input type="email" placeholder="admin@cic.lk" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="password" className="pl-9" placeholder="Enter password" />
              </div>
            </div>
            <Button type="submit" className="w-full gap-2 rounded-2xl">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </form>
        </CardContent>
      </AdminCard>
    </div>
  );
}
