import { AlertCircle, Clock, MessageSquare, CheckCircle2 } from "lucide-vue-next";

export const ticketStatusConfig: Record<TicketStatus, {
  label: string;
  icon: any;
  variant: "default" | "secondary" | "outline" | "success";
  color: string;
}> = {
  open: {
    label: "Открыт",
    icon: AlertCircle,
    variant: "default",
    color: "text-blue-500",
  },
  in_progress: {
    label: "В работе",
    icon: Clock,
    variant: "secondary",
    color: "text-yellow-500",
  },
  waiting_for_user: {
    label: "Ожидает ответа",
    icon: MessageSquare,
    variant: "outline",
    color: "text-orange-500",
  },
  resolved: {
    label: "Решён",
    icon: CheckCircle2,
    variant: "success",
    color: "text-green-500",
  },
  closed: {
    label: "Закрыт",
    icon: CheckCircle2,
    variant: "secondary",
    color: "text-muted-foreground",
  },
};

export const ticketPriorityConfig: Record<string, Record<any, any>> = {
  low: { label: "Низкий", color: "text-muted-foreground" },
  medium: { label: "Средний", color: "text-blue-500" },
  high: { label: "Высокий", color: "text-orange-500" },
  urgent: { label: "Срочный", color: "text-red-500" },
};
