import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	Outlet,
	useLocation,
	useNavigate,
} from "react-router-dom";
import CreateChannelForm from './components/CreateChannelForm';
import useAuthStore from './stores/authStore';
import Channel from "./components/Channel";
import ClientComponent from "./components/Client";
import { LoginForm, SignUpForm } from "./components/index";
import LandingPage from "./components/LandingPage"
import { useEffect } from 'react'


const ProtectedRoute = ({ redirectPath = '/login' }) => {
	const { isAuthenticated, checkAuth } = useAuthStore((state) => ({
		isAuthenticated: state.isAuthenticated,
		checkAuth: state.checkAuth
	}));

	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (!isAuthenticated) {
		return (
			<Navigate
				to={`${redirectPath}?redirectTo=${location.pathname}${location.search}`}
				replace
			/>
		);
	}

	return <Outlet />;
};


const Router = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route index path="/" element={<LandingPage />} />
				<Route path="/login" element={<LoginForm />} />
				<Route path="/signup" element={<SignUpForm />} />
				<Route element={<ProtectedRoute />}>
					<Route path="/client/" element={<ClientComponent />}>
						<Route path="new" element={<CreateChannelForm />} />
						<Route path=":channelId" element={<Channel />} />
						<Route path="/client/:channelId/message/:messageId" element={<Channel />} />
					</Route>
				</Route>
			</Routes>
		</BrowserRouter >
	);
};
export default Router
