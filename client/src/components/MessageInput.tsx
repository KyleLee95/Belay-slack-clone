import { useState } from "react";
import { useParams } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import useMessageStore from "../stores/messageStore";


const MessageInput = ({ isThread }) => {
	const [message, setMessage] = useState("");
	const { currentMessage, addMessage, addReply } = useMessageStore((state) => ({
		currentMessage: state.currentMessage,
		addMessage: state.addMessage,
		addReply: state.addReply,
	}))

	const params = useParams()

	const handleSubmit = (e) => {
		e.preventDefault();
		const { channelId } = params
		addMessage(channelId, message)
		// Implement sending message
		setMessage("");
	};

	const handleReply = (e) => {
		e.preventDefault();
		const { channelId } = params
		addReply(channelId, message, currentMessage, true)
		// Implement sending message
		setMessage("");
	};

	return (
		<form onSubmit={isThread ? handleReply : handleSubmit} className="flex w-full position-sticky space-x-2 p-2">
			<TextField
				variant="outlined"
				placeholder="Type a message..."
				autoComplete="off"
				fullWidth
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				className="flex-grow"
			/>
			<Button
				type="submit"
				variant="contained"
				color="primary"
				className="flex-shrink-0"
			>
				<SendIcon />
			</Button>
		</form>
	)
};

export default MessageInput;
