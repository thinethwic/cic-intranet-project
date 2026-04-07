import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
interface Props {
  name: string;
  description: string;
}
export default function WelcomeCard({ name, description }: Props) {
  return (
    <Card className="text-center hover:shadow-lg transition">
      {" "}
      <CardContent className="p-4">
        {" "}
        <Avatar className="w-16 h-16 mx-auto mb-3">
          {" "}
          <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>{" "}
        </Avatar>{" "}
        <h3 className="text-sm font-semibold mb-1">{name}</h3>{" "}
        <p className="text-xs text-gray-500 mb-3">{description}</p>{" "}
        <Button size="sm" variant="secondary">
          {" "}
          See More{" "}
        </Button>{" "}
      </CardContent>{" "}
    </Card>
  );
}
