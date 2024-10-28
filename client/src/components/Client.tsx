import useChannelStore from "../stores/channelStore";
import { CssBaseline, Box } from "@mui/material";
import Sidebar from "./Sidebar";
import ThreadsDrawer from "./ThreadsDrawer";
import TopAppBar from "./TopAppBar";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { useParams } from "react-router-dom";
import useMessageStore from "../stores/messageStore";
import useAuthStore from "../stores/authStore";

const drawerWidth = 240


const MenuBars = ({ currentChannel, channels }) => {

	const [mobileOpen, setMobileOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	const handleDrawerClose = () => {
		setIsClosing(true);
		setMobileOpen(false);
	};

	const handleDrawerTransitionEnd = () => {
		setIsClosing(false);
	};

	const handleDrawerToggle = () => {
		if (!isClosing) {
			setMobileOpen(!mobileOpen);
		}
	};

	return (<>
		<TopAppBar handleDrawerToggle={handleDrawerToggle} currentChannel={currentChannel} drawerWidth={drawerWidth} />
		<Sidebar currentChannel={currentChannel} channels={channels} mobileOpen={mobileOpen} handleDrawerTransitionEnd={handleDrawerTransitionEnd} handleDrawerClose={handleDrawerClose} />

	</>)
}


const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
	open?: boolean;
}>(({ theme, open }) => ({
	flexGrow: 1,
	overscrollBehaviorY: "none",
	transition: theme.transitions.create('margin', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	marginRight: -drawerWidth,
	...(open && {
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
		marginRight: 0,
	}),
	/**
	 * This is necessary to enable the selection of content. In the DOM, the stacking order is determined
	 * by the order of appearance. Following this rule, elements appearing later in the markup will overlay
	 * those that appear earlier. Since the Drawer comes after the Main content, this adjustment ensures
	 * proper interaction with the underlying content.
	 */
	position: 'relative',
}));



const ClientComponent = () => {
	const { fetchChannels, channels, currentChannel, fetchUnreadCounts } = useChannelStore((state) => ({
		fetchChannels: state.fetchChannels,
		channels: state.channels,
		currentChannel: state.currentChannel,
		setCurrentChannel: state.setCurrentChannel,
		fetchUnreadCounts: state.fetchUnreadCounts
	}))

	const { user } = useAuthStore((state) => ({
		isAuthenticated: state.isAuthenticated,
		user: state.user
	}))

	//const params = useParams()


	useEffect(() => {
		if (!user.id) {
			return
		}
		const intervalId = setInterval(async () => {
			fetchUnreadCounts(user.id);
		}, 1000); // Checks every second

		return () => clearInterval(intervalId);
	}, [fetchUnreadCounts, user.id])





	useEffect(() => {
		fetchChannels()
	}, [fetchChannels])




	return (
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />
			<MenuBars currentChannel={currentChannel} channels={channels} />
			<Main open={true}>
				<Outlet />
			</Main>
			<ThreadsDrawer />
		</Box >
	);


}



export default ClientComponent
