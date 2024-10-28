import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Message from "./Message";
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from "@mui/material/TextField";
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import useMessageStore from "../stores/messageStore";
import { useNavigate } from "react-router-dom";

const drawerWidth = 500
const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: 'flex-start',
}));

//<MessageList sx={{}} messages={currentMessage?.replies ? currentMessage.replies : []} isThread={true} />



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
		<form onSubmit={isThread ? handleReply : handleSubmit} className="flex w-full position-sticky space-x-2">
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





export default function ThreadsDrawer() {
	const theme = useTheme();
	const [open, setOpen] = useState(false);
	const params = useParams()
	const navigate = useNavigate()
	const { setCurrentMessage, currentMessage, messages } = useMessageStore((state) => ({
		fetchReplies: state.fetchReplies,
		setCurrentMessage: state.setCurrentMessage,
		currentMessage: state.currentMessage,
		messages: state.messages
	}))


	useEffect(() => {
		if (params && params.messageId) {
			setCurrentMessage(parseInt(params.messageId))
			//fetchReplies(parseInt(params.messageId))
			setOpen(true)
		} else {
			setOpen(false)
		}
	}, [params.messageId])


	const handleDrawerClose = () => {
		navigate(`/client/${currentMessage.channel_id}`)
		setOpen(false);
	};

	if (!currentMessage.id || !currentMessage.replies) {
		return "Loading"

	}
	return (
		<Drawer
			sx={{
				display: "flex",
				width: drawerWidth,
				flexShrink: 0,
				'& .MuiDrawer-paper': {
					width: drawerWidth,
				},
			}}
			variant="persistent"
			anchor="right"
			open={open}
		>
			<Box sx={{ p: 2, height: '100%' }}>
				<DrawerHeader sx={{ display: 'flex flex-col', alignItems: 'center', justifyContent: 'space-between' }}>
					<Typography variant="h5" noWrap component="div">
						Thread
					</Typography>
					<IconButton onClick={handleDrawerClose}>
						<CloseIcon />
					</IconButton>
				</DrawerHeader>
				<Message message={currentMessage} isThread={true} />
				<Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
					Replies:
				</Typography>
				<Box sx={{ height: '60%' }}>
					<div className="h-full overflow-y-scroll p-4">
						{currentMessage.replies.map((reply) => (
							<Message key={reply.id} message={reply} isThread={true} />
						))}
					</div>
				</Box>
				<Box sx={{ height: '10%', paddingBottom: 0 }}>
					<MessageInput isThread={true} />
				</Box>
			</Box>
		</Drawer >
	);
}

