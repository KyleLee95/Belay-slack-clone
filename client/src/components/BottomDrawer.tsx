import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';

type Anchor = 'top' | 'left' | 'bottom' | 'right';
export default function BottomDrawer() {
	const [state, setState] = React.useState({
		top: false,
		left: false,
		bottom: false,
		right: false,
	});

	const toggleDrawer =
		(anchor: Anchor, open: boolean) =>
			(event: React.KeyboardEvent | React.MouseEvent) => {
				if (
					event.type === 'keydown' &&
					((event as React.KeyboardEvent).key === 'Tab' ||
						(event as React.KeyboardEvent).key === 'Shift')
				) {
					return;
				}

				setState({ ...state, [anchor]: open });
			};

	const form = (anchor: Anchor) => (
		<Box
			sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250, height: "75vh" }}
			role="presentation"
		//onClick={toggleDrawer(anchor, false)}
		//onKeyDown={toggleDrawer(anchor, false)}
		>

			<form>
				<label> test</label>
				<input />
			</form>
		</Box>
	);

	return (
		<div>
			{(['left', 'right', 'top', 'bottom'] as const).map((anchor) => (
				<React.Fragment key={anchor}>
					<Button onClick={toggleDrawer(anchor, true)}>{anchor}</Button>
					<Drawer
						sx={{
							height: "75vh"
						}}
						anchor={anchor}
						open={state[anchor]}
						onClose={toggleDrawer(anchor, false)}
					>
						{form(anchor)}
					</Drawer>
				</React.Fragment>
			))}
		</div>
	);
}
