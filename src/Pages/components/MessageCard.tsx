import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CEOMessageProps {
  name?: string;
  message: string;
}

export function CEOMessageCard({ name = "CEO", message }: CEOMessageProps) {
  return (
    <Card className="flex flex-col items-center text-center p-6">
      <Avatar className="w-20 h-20 mb-4">
        <AvatarFallback>{name}</AvatarFallback>
      </Avatar>

      <h3 className="text-blue-900 font-semibold mb-2">CEO Message</h3>

      <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
    </Card>
  );
}
