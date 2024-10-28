import { MessageId } from "./message";
import { UserId } from "./user";

export type ReactionId = number;
export type Reaction = {
  id: ReactionId;
  user_id: UserId;
  message_id: MessageId;
  emoji: string;
};
