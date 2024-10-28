import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import Box from '@mui/material/Box';


const MessageFeed = ({ messages, isThread }) => {
	if (!messages) {
		return "Loading..."
	}
	return (
		<Box className="h-screen flex flex-col pt-8">
			<MessageList messages={messages} isThread={isThread} />
			<MessageInput isThread={isThread} />
		</Box>
	);
};

export default MessageFeed;
