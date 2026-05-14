import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InlineErrorAlertProps {
  message: string;
  title?: string;
  className?: string;
}

export default function InlineErrorAlert({
  message,
  title = "Something went wrong",
  className,
}: InlineErrorAlertProps) {
  if (!message) return null;

  return (
    <Alert
      variant="destructive"
      className={`border-red-200 bg-red-50 ${className ?? ""}`.trim()}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
