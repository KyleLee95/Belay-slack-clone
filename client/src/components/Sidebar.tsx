import { useEffect } from "react";
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { Link } from "react-router-dom"
import CreateIcon from '@mui/icons-material/Create';
import useChannelStore from "../stores/channelStore";
import { useNavigate } from "react-router-dom";


const drawerWidth = 240;
const DrawerList = ({ channels, currentChannel }) => {
	const navigate = useNavigate()

	const { setCurrentChannel, markMessagesAsRead, unreadCounts } = useChannelStore((state) => ({
		fetchUnreadCounts: state.fetchUnreadCounts,
		unreadCounts: state.unreadCounts,
		currentChannel: state.currentChannel,
		markMessagesAsRead: state.markMessagesAsRead,
		setCurrentChannel: state.setCurrentChannel,

	}));
	const handleChannelSelect = (channelId) => {
		setCurrentChannel(channelId);
		markMessagesAsRead(channelId);
		navigate(`/client/${channelId}`);
	}


	if (!unreadCounts.unreadCounts) {
		return <div>Loading</div>
	}
	return (
		<div>
			<Toolbar />
			<Divider />
			<List>
				<Link to="/client/new">
					<ListItem disablePadding>
						<ListItemButton>
							<ListItemIcon>
								<CreateIcon />
							</ListItemIcon>
							<ListItemText primary="New Channel" />
						</ListItemButton>
					</ListItem>
				</Link>
				<Divider />
				{channels.map((channel) => (
					<ListItem key={channel.id} disablePadding>
						<ListItemButton selected={currentChannel?.id === channel.id} onClick={() => { handleChannelSelect(channel.id) }}>
							<ListItemIcon>
								<ChatBubbleIcon />
							</ListItemIcon>
							<ListItemText primary={`${channel.name} ${unreadCounts.unreadCounts[channel.id] ? `(${unreadCounts.unreadCounts[channel.id].unread_count})` : ''}`} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</div>)
}


const Sidebar = ({ channels, currentChannel, mobileOpen, handleDrawerTransitionEnd, handleDrawerClose }) => {


	return (<Box
		component="nav"
		sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
		aria-label="mailbox folders"
	>
		{/* The implementation can be swapped with js to avoid SEO duplication of links. */}
		<Drawer
			variant="temporary"
			open={mobileOpen}
			onTransitionEnd={handleDrawerTransitionEnd}
			onClose={handleDrawerClose}
			ModalProps={{
				keepMounted: true, // Better open performance on mobile.
			}}
			sx={{
				display: { xs: 'block', sm: 'none' },
				'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
			}}
		>
			<DrawerList channels={channels} currentChannel={currentChannel} />
		</Drawer>
		<Drawer
			variant="permanent"
			sx={{
				display: { xs: 'none', sm: 'block' },
				'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
			}}
			open
		>
			<DrawerList currentChannel={currentChannel} channels={channels} />
		</Drawer>
	</Box>)

}

export default Sidebar
