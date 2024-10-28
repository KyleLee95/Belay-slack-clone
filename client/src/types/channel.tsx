import { Message } from "./message";

export type ChannelId = number;
export type ChannelName = string;

export type Channel = {
	id: ChannelId;
	name: ChannelName;
};
export type ChannelState = {
	channels: Channel[];
	currentChannel?: Channel;
	messages: Message[];
};
