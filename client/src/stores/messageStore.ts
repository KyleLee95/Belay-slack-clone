import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useMessageStore = create(devtools((set, get) => ({
	messages: [],
	currentMessage: {},
	setCurrentMessage: async (parentMessageId) => {
		const response = await fetch(`/api/messages/${parentMessageId}/`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
		}
		)
		const data = await response.json();
		set({ currentMessage: data.message });
	},

	fetchMessages: async (channelId) => {

		console.log("fetching messages")
		try {
			const response = await fetch(`/api/channels/${channelId}/messages`);
			const data = await response.json();
			const { messages } = data
			set({ messages });
		} catch (error) {
			console.error("Failed to fetch messages:", error);
		}

	},
	addReply: async (channelId, message, currentMessage) => {
		//Should add error hanlding and set an error if the request fails
		const params = { message: message, replyTo: currentMessage.id }
		try {
			const response = await fetch(`/api/channels/${channelId}/reply`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(params)
			});

			if (!response.ok) {
				throw new Error('Failed to add reply');
			}

			const data = await response.json();
			const { newMessage } = data
			set((state) => ({
				currentMessage: { ...state.currentMessage, replies: [...state.currentMessage.replies, ...newMessage] }
			}))

			set((state) => ({
				messages: state.messages.map((msg) =>
					msg.id === currentMessage.id ?
						state.currentMessage : msg
				)
			}));


		} catch (error) {
			console.error("Failed to add message:", error);
		}
	},
	addMessage: async (channelId, message) => {
		try {
			const response = await fetch(`/api/channels/${channelId}/message`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ message })
			});

			const data = await response.json();
			const { newMessage } = data
			set((state) => ({ messages: [...state.messages, ...newMessage] }));

		} catch (error) {
			console.error("Failed to add message:", error);
		}
	},
	addReaction: async (messageId, reaction) => {
		try {
			const response = await fetch(`/api/messages/${messageId}/reaction`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ reaction: reaction })
			});

			const updatedMessage = await response.json();
			set((state) => ({
				messages: state.messages.map((msg) =>
					msg.id === messageId ? updatedMessage.message : msg
				)
			}));
		} catch (error) {
			console.error("Failed to add reaction:", error);
		}
	}
})));

export default useMessageStore;
