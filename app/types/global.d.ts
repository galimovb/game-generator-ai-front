import type { Game as GameImport, Stage as StageImport } from "./game";
import type { GameComment as GameCommentImport } from "./comment";
import type {
  User as UserImport,
  UserProfile as UserProfileImport,
  UserSettings as UserSettingsImport,
  UserLogin as UserLoginImport,
  UserRegister as UserLoginRegister,
} from "./user";
import type {
  Ticket as TicketImport,
  TicketMessage as TicketMessageImport,
} from "./ticket";
import type {
  ModelType as ModelTypeImport,
  GameLocationType as GameLocationTypeImport,
  GameActivityLevel as GameActivityLevelImport,
  TicketStatus as TicketStatusImport,
  TicketPriority as TicketPriorityImport,
  TicketMessageType as TicketMessageTypeImport,
} from "./enums";
import type {
  SingleResponse as SingleResponseImport,
  ListResponse as ListResponseImport,
} from "./api";

declare global {
  type Game = GameImport;
  type Stage = StageImport;
  type GameComment = GameCommentImport;
  type User = UserImport;
  type UserProfile = UserProfileImport;
  type UserSettings = UserSettingsImport;
  type Ticket = TicketImport;
  type TicketMessage = TicketMessageImport;
  type ModelType = ModelTypeImport;
  type GameLocationType = GameLocationTypeImport;
  type GameActivityLevel = GameActivityLevelImport;
  type TicketStatus = TicketStatusImport;
  type TicketPriority = TicketPriorityImport;
  type TicketMessageType = TicketMessageTypeImport;
  type UserLogin = UserLoginImport;
  type UserRegister = UserLoginRegister;
  type SingleResponse<T> = SingleResponseImport<T>;
  type ListResponse<T> = ListResponseImport<T>;
}
