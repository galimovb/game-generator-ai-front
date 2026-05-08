export type ModelType =
  | "qwen/qwen3.6-27b"
  | "qwen/qwen3.5-27b"
  | "qwen/qwen3.6-plus";

export type GameLocationType = "indoor" | "outdoor" | "both";

export type GameActivityLevel = "low" | "medium" | "high";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_for_user"
  | "resolved"
  | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketMessageType = "user" | "support" | "system";
