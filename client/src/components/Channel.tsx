import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useMessageStore from '../stores/messageStore';
import useChannelStore from '../stores/channelStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Box from '@mui/material/Box';
const Channel = () => {
	const { messages, fetchMessages } = useMessageStore((state) => ({
		messages: state.messages,
		fetchMessages: state.fetchMessages
	}))


	const { currentChannel, channels, setCurrentChannel } = useChannelStore((state) => ({
		currentChannel: state.currentChannel,
		setCurrentChannel: state.setCurrentChannel,
		resetCurrentChannel: state.resetCurrentChannel,
		channels: state.channels
	}))

	const params = useParams()

	useEffect(() => {
		if (!params.channelId) return
		setCurrentChannel(parseInt(params.channelId))

	}, [params, params.channelId, channels])




	useEffect(() => {
		if (currentChannel && currentChannel.id) {

			console.log("fetching messages")
			const intervalId = setInterval(async () => {

				fetchMessages(currentChannel.id);
			}, 1000); // Checks every second

			return () => clearInterval(intervalId);

		}
	}, [fetchMessages, currentChannel])


	if (!messages) {
		return "Loading"

	}

	return (
		<>

			<Box className="h-screen flex flex-col pt-8">
				<MessageList messages={messages} isThread={false} />
				<MessageInput isThread={false} />
			</Box>
		</>
	)
}




export default Channel
