import { Button, Container, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const LandingPage = () => {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center">
			<Container maxWidth="md">
				<Box className="text-center">
					<Typography variant="h2" component="h1" className="font-bold mb-4">
						Welcome to Belay
					</Typography>
					<Typography variant="h6" component="p" className="mb-6">
						A Slack-like chat application designed to keep your team connected and productive.
					</Typography>
					<div className="flex justify-center space-x-4">
						<Link to="/client">
							<Button variant="contained" color="primary">
								Get Started
							</Button>
						</Link>
						<Button variant="outlined" color="primary" onClick={() => alert('Learn more clicked')}>
							Sign Up
						</Button>
					</div>
				</Box>
			</Container>
		</div>
	);
};

export default LandingPage;


