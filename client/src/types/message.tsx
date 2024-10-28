import { UserId } from "./user";
import { ChannelId } from "./channel";

export type MessageId = number;

export type Message = {
	id: MessageId;
	channel_id: ChannelId;
	user_id: UserId;
	text: string;
	replies_to: UserId;
	timestamp: Date;
};
