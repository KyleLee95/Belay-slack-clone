import { FC, useEffect } from 'react'
import useSWR from 'swr'
import useChannelStore from './stores/channelStore';
import useMessageStore from './stores/messageStore';
import useAuthStore from './stores/authStore';
import Router from "./Router"
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
function CircularIndeterminate() {
	return (
		<Box sx={{ display: 'flex' }}>
			<CircularProgress />
		</Box>
	);
}


const App: FC = () => {
	return (
		<Router />
	);
};

export default App;
