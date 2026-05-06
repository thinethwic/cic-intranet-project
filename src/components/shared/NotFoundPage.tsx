import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
        <AlertCircle className="h-10 w-10 text-blue-900" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
        404 Error
      </p>
      <h1 className="mt-3 text-4xl font-bold text-slate-900 md:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="rounded-2xl border-slate-200 px-6"
        >
          Go Back
        </Button>
        <Button
          onClick={() => navigate("/")}
          className="rounded-2xl bg-blue-900 px-6 text-white hover:bg-blue-800"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
