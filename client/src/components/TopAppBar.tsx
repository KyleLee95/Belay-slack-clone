import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import PersonIcon from '@mui/icons-material/Person';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useLocation } from 'react-router-dom';
import useAuthStore from "../stores/authStore";
import { useState } from "react";



function UserDropdownMenu({ user, logout }) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		logout();
		setAnchorEl(null);
	};

	return (
		<div>
			<IconButton color="inherit" onClick={handleClick}>
				<Typography variant="h6" noWrap component="div">
					{user?.username ? user.username : null}
				</Typography>
				<PersonIcon />
			</IconButton>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
				}}
			>
				<MenuItem onClick={handleClose}>Logout</MenuItem>
			</Menu>
		</div>
	);
}


const TopAppBar = ({ handleDrawerToggle, currentChannel, drawerWidth }) => {
	const location = useLocation()
	const { user, logout } = useAuthStore((state) => ({
		user: state.user,
		logout: state.logout
	}))
	const [dropdownOpen, setDropdownOpen] = useState(false);
	return (<AppBar
		position="fixed"
		sx={{
			width: { sm: `calc(100% - ${drawerWidth}px)` },
			ml: { sm: `${drawerWidth}px` },
		}}
	>
		<Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
			<IconButton
				color="inherit"
				aria-label="open drawer"
				edge="start"
				onClick={handleDrawerToggle}
				sx={{ mr: 2, display: { sm: 'none' } }}
			>
				<MenuIcon />
			</IconButton>
			<Typography variant="h6" noWrap component="div">
				{location.pathname === "/client/new" ? "New Channel" : ""}
				{currentChannel?.name ? currentChannel.name : null}
			</Typography>
			<UserDropdownMenu user={user} logout={logout} />

		</Toolbar>
	</AppBar>)
}
export default TopAppBar
