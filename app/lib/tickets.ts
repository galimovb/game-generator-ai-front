import { AlertCircle, Clock, MessageSquare, CheckCircle2 } from "lucide-vue-next";

export const ticketStatusConfig = {
  open: {
    label: "Открыт",
    icon: AlertCircle,
    variant: "default" as const,
    color: "text-blue-500",
  },
  in_progress: {
    label: "В работе",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-yellow-500",
  },
  waiting_for_user: {
    label: "Ожидает ответа",
    icon: MessageSquare,
    variant: "outline" as const,
    color: "text-orange-500",
  },
  resolved: {
    label: "Решён",
    icon: CheckCircle2,
    variant: "success" as const,
    color: "text-green-500",
  },
  closed: {
    label: "Закрыт",
    icon: CheckCircle2,
    variant: "secondary" as const,
    color: "text-muted-foreground",
  },
};

export const ticketPriorityConfig = {
  low: { label: "Низкий", color: "text-muted-foreground" },
  medium: { label: "Средний", color: "text-blue-500" },
  high: { label: "Высокий", color: "text-orange-500" },
  urgent: { label: "Срочный", color: "text-red-500" },
};
