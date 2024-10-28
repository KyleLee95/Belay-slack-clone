import { useState } from 'react';
import { Avatar, Button, Typography, Box, Popover, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import useMessageStore from '../stores/messageStore';
import { useNavigate } from 'react-router-dom';

const emojiList = ['👍', '❤️', '😂', '😮', '😢', '👏'];

// Regex to detect image URLs
const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;

const Message = ({ message }) => {
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState(null);
	const replyCount = message?.replies?.length || 0;
	const { addReaction } = useMessageStore((state) => ({
		addReaction: state.addReaction,
	}));

	const handleAddReaction = (emoji) => {
		addReaction(message.id, emoji);
		setAnchorEl(null); // Close the popover after selecting an emoji
	};

	const handleReactButtonClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const handleReply = (event, message) => {
		event.preventDefault();
		navigate(`/client/${message.channel_id}/message/${message.id}`);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'emoji-popover' : undefined;

	// Check if the message text contains an image URL
	const imageUrlMatch = message.text.match(imageRegex);
	const imageUrl = imageUrlMatch ? imageUrlMatch[0] : null;

	return (
		<div className="mb-4 p-4 border border-gray-200 rounded-lg flex flex-col">
			<div className="flex items-center mb-2">
				<Avatar className="mr-4">
					<PersonIcon />
				</Avatar>
				<div className="flex-grow">
					<Typography variant="body1" className="font-bold">
						{message.user_name}
					</Typography>
					<Typography variant="body2">{message.text}</Typography>
					{/* Render image preview if image URL is found */}
					{imageUrl && (
						<Box mt={2}>
							<img src={imageUrl} alt="Message Attachment" className="max-w-full h-auto" />
						</Box>
					)}
				</div>
			</div>
			<div className="flex justify-between items-center mt-2 text-gray-600">
				<Typography variant="caption">
					{new Date(message.timestamp).toLocaleString()}
				</Typography>
				<div>
					{replyCount > 0 && (
						<Typography variant="caption" className="mr-4">
							{replyCount} {replyCount === 1 ? 'reply' : 'replies'}
						</Typography>
					)}
					<Button size="small" className="text-blue-500" onClick={(e) => handleReply(e, message)}>
						Reply
					</Button>
					<Button
						size="small"
						className="text-blue-500"
						onClick={handleReactButtonClick}
					>
						React
					</Button>
					<Popover
						id={id}
						open={open}
						anchorEl={anchorEl}
						onClose={handlePopoverClose}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'center',
						}}
						transformOrigin={{
							vertical: 'top',
							horizontal: 'center',
						}}
					>
						<Box className="p-2 flex flex-wrap">
							{emojiList.map((emoji) => (
								<Button
									key={emoji}
									size="small"
									onClick={() => handleAddReaction(emoji)}
								>
									{emoji}
								</Button>
							))}
						</Box>
					</Popover>
				</div>
			</div>
			<div className="flex items-center mt-2">
				<div className="flex-grow flex space-x-2">
					{message?.reactions?.map((reaction, index) => (
						<Tooltip disableFocusListener key={`$r-${index}`} title={reaction.users.join(', ')}>
							<Button
								size="small"
								className="text-gray-500"
								onClick={() => handleAddReaction(reaction.emoji)}
							>
								{reaction.emoji} {reaction.count}
							</Button>
						</Tooltip>
					))}
				</div>
			</div>
		</div>
	);
};

export default Message;

