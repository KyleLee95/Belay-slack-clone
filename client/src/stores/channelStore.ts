import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useChannelStore = create(devtools((set, get) => ({
	channels: [],
	currentChannel: null,
	unreadCounts: { last_msg_id: null, unread_counts: {} },
	error: null,
	createNewChannel: async (channelName) => {
		try {
			const response = await fetch(`/api/channels/new`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ channelName })
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Failed to create new channel:", errorData);
				throw new Error(errorData.error || 'Failed to create new channel');
			}
			const data = await response.json();
			const { channel } = data
			set((state) => ({ channels: [...state.channels, ...channel] }))
			return channel[0]
		} catch (error) {
			set({ error: String(error) });
		}
	},
	fetchChannels: async () => {
		try {
			const response = await fetch('/api/channels/',
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					}
				}
			);
			const data = await response.json();
			const { channels } = data
			set({ channels });

		} catch (error) {
			console.error("Failed to fetch channels:", error);
		}
	},
	resetCurrentChannel: () => {
		set({ currentChannel: null });
	},
	markMessagesAsRead: async (channelId) => {
		try {
			const lastMsgId = get().currentChannel.lastMessageId || 0
			const response = await fetch(`/api/channels/${channelId}/mark-read`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ lastMessageId: lastMsgId })
			});

			if (!response.ok) {
				throw new Error('Failed to mark messages as read');
			}
			set((state) => ({
				...state,
				unreadCounts: {
					...state.unreadCounts,
					[channelId]: {
						unread_count: 0
					}
				}
			}))
		} catch (error) {
			console.error('Error marking messages as read:', error);
		}

	},

	setCurrentChannel: async (channelId) => {
		// when a new channel is selected these things must happen in this order:
		// 1. set the current channel
		// 3. fetch the messages for the new channel
		// 4. mark the messages as read
		//set current channel

		try {
			// This is a hack to get around the fact that I didn't implement a
			// way to get the last message id for a channel.
			// Coincidentally, the last message id is the same as the last message id
			// for the channel's parent message.
			// So, I'm just going to get the last message id for the parent message
			// and use that as the last message id for the channel.
			// this alsoo makes changing the channel extremely slow
			// because the data has to go around the network again to mark the messages as read

			const parentMessageId = get().messages[0].replies[0].lastMessageId
			const response = await fetch(`/api/channels/${channelId}/messages?lastMessageId=${parentMessageId}`);
			const data = await response.json();

			const response = await fetch(`/api/channels/${channelId}/messages`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				}
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error('Failed to fetch channel');
			}
			const currentChannel = get().channels.find((channel) => {
				if (channel.id === channelId) {
					return channel
				}
			})

			const { messages } = data
			const channel = {
				id: currentChannel.id,
				name: currentChannel.name,
				messages: messages,
				lastMessageId: messages ? messages[messages.length - 1].id : null
			}
			set({ currentChannel: channel });
		} catch (error) {
			set({ error: String(error) });
		}
	},
	fetchUnreadCounts: async (userId) => {
		try {

			const response = await fetch(`/api/channels/unread-counts-for-user/${userId}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch unread counts');
			}
			const unreadCounts = await response.json();
			set((state) => ({ ...state, unreadCounts }))
		} catch (error) {
			console.error("Failed to fetch unread counts:", error);
		}
	}
})));;



export default useChannelStore;
