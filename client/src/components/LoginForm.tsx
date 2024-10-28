import { useEffect } from "react"
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import useAuthStore from '../stores/authStore'
const LoginForm = () => {

	const navigate = useNavigate()
	const [searchParams] = useSearchParams();
	const { login, isAuthenticated, loading, error, clearError } = useAuthStore(state => ({
		isAuthenticated: state.isAuthenticated,
		login: state.login,
		error: state.error,
		clearError: state.clearError,
	}));

	const handleSubmit = async (e: React.SyntheticEvent) => {
		e.preventDefault();
		const target = e.target as typeof e.target & {
			username: { value: string };
			password: { value: string };
		};
		const username: string = target.username.value;
		const password: string = target.password.value;

		const authData = { username, password };

		const res = await login(authData);
		if (res.ok) {
			const redirectTo = searchParams.get('redirectTo') || "/client";
			navigate(redirectTo);
		}
	};

	useEffect(() => {
		if (isAuthenticated) {
			const redirectTo = searchParams.get('redirectTo') || "/client";
			navigate(redirectTo);
		}
	}, [isAuthenticated]);





	return (
		<div className="max-w-md mx-auto mt-10">
			<form
				onSubmit={handleSubmit}
				className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
			>
				<div className="mb-4">
					<label
						className="block text-gray-700 text-sm font-bold mb-2"
						htmlFor="username"
					>
						Username
					</label>
					<input
						type="text"
						id="username"
						className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
						required
					/>
				</div>
				<div className="mb-6">
					<label
						className="block text-gray-700 text-sm font-bold mb-2"
						htmlFor="password"
					>
						Password
					</label>
					<input
						type="password"
						id="password"
						className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
						required
					/>
				</div>
				<div className="flex items-center justify-between">
					<button
						type="submit"
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
					>
						Sign In
					</button>

					<Link to="/signup" className="text-blue-500 hover:text-blue-700">
						Don't have an account? Sign Up
					</Link>
				</div>
			</form>

		</div>
	);
};

export default LoginForm;
