import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box'
import FormLabel from '@mui/material/FormLabel'
import useChannelStore from '../stores/channelStore';
import { useNavigate } from 'react-router-dom';
const CreateChannelForm = () => {
	const [channelName, setChannelName] = useState('');
	const [localError, setLocalError] = useState(null);
	const navigate = useNavigate()

	const { resetCurrentChannel, createNewChannel, error } = useChannelStore((state) => ({
		resetCurrentChannel: state.resetCurrentChannel,
		createNewChannel: state.createNewChannel,
		error: state.error
	}))

	useEffect(() => {
		resetCurrentChannel({})
	}, [])


	const handleSubmit = async (event) => {
		event.preventDefault();
		if (channelName.trim()) {
			try {
				const newChannel = await createNewChannel(channelName);
				setChannelName('');  // Reset the input field after successful submission
				setLocalError(null);  // Clear any local error
				console.log("newChannel", newChannel)
				navigate(`/client/${newChannel.id}`);  // Navigate to the new channel
			} catch (error) {
				setLocalError(error.message);  // Set the local error to be displayed
			}
		}
	};


	return (
		<Box sx={{ pt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<form onSubmit={handleSubmit} className="pt-16 px-4">
				<FormLabel>Channel Name</FormLabel>
				<TextField
					sx={{ pt: 2 }}
					variant="outlined"
					placeholder="Type a channel name..."
					autoComplete="off"
					fullWidth
					value={channelName}
					onChange={(e) => setChannelName(e.target.value)}
				/>
				<Button sx={{ mt: 5 }} type="submit" variant="contained" color="primary">Create Channel</Button>
			</form>
			<div className="text-center">
				{error && <div className="text-red-500">{error}</div>}
			</div>
		</Box>
	);
};

export default CreateChannelForm;

