import { Card, CardContent } from "@/components/ui/card";
import { BriefcaseBusiness, ShipWheelIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ButtonsSectionProps {
  segment?: string;
}

export default function ButtonsSection({ segment }: ButtonsSectionProps) {
  const categories = [
    {
      label: "Help Desk",
      icon: ShipWheelIcon,
      link: segment ? `/helpdesk?segment=${segment}` : "/helpdesk",
    },
    {
      label: "Asset Management",
      icon: BriefcaseBusiness,
      link: "https://cicinventory.netlify.app/",
    },
  ];

  return (
    <div className="flex justify-center w-full mt-4 mb-6">
      <div className="z-20 grid grid-cols-2 sm:grid-cols-2 gap-4 px-4">
        {categories.map(({ label, icon: Icon, link }, i) => (
          <Link to={link} key={i} className="flex h-full">
            <Card className="bg-blue-900/90 backdrop-blur-sm border border-white/60 hover:bg-blue-900 transition-all cursor-pointer group shadow-md w-36 sm:w-44 min-h-40 h-full">
              <CardContent className="flex h-full flex-col items-center justify-center py-6 px-3">
                <div className="mb-3 p-3 rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-all group-hover:scale-110">
                  <Icon className="w-7 h-7 md:w-8 md:h-8 stroke-[1.5] text-[oklch(37.9%_0.146_265.522)]" />
                </div>
                <p className="text-sm sm:text-base font-semibold tracking-wide text-center leading-tight text-white">
                  {label}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
