import { ceoMessage } from "@/Mock-data";
import { useAlerts } from "@/hooks/useAlerts";
import { CEOMessageCard } from "./MessageCard";
import { AlertCard } from "@/components/shared/AlertCard";

export function AlertOrCEOCard() {
  const { alerts, loading: alertsLoading } = useAlerts(0, 100);

  // Still loading — show the CEO card as the placeholder so layout doesn't jump
  if (alertsLoading) {
    return (
      <CEOMessageCard
        name={ceoMessage.name}
        image={ceoMessage.image}
        messages={ceoMessage.messages}
      />
    );
  }

  // Alerts available → show AlertCard; otherwise fall back to CEO message
  return alerts.length > 0 ? (
    <AlertCard />
  ) : (
    <CEOMessageCard
      name={ceoMessage.name}
      image={ceoMessage.image}
      messages={ceoMessage.messages}
    />
  );
}
