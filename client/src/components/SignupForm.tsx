import { useNavigate, useSearchParams, Link } from "react-router-dom";
import useAuth from "../stores/authStore"
import { useState } from "react";
const SignupForm = () => {
	const { signup } = useAuth((state) => ({

		signup: state.signup,
		isAuthenticated: state.isAuthenticated
	}))
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const handleSubmit = async (e: React.SyntheticEvent) => {
		e.preventDefault();
		const target = e.target as typeof e.target & {
			username: { value: string };
			password: { value: string };
			email: { value: string };
		};

		const username: string = target.username.value;
		const password: string = target.password.value;
		const email: string = target.email.value;

		const authData = { username, email, password };
		const res = await signup(authData);
		if (res) {
			setMessage("Successfully signed up! Click here to login");

		} else {
			setError("Failed to sign up");
		}
	};


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
				<div className="mb-4">
					<label
						className="block text-gray-700 text-sm font-bold mb-2"
						htmlFor="email"
					>
						Email
					</label>
					<input
						type="email"
						id="email"
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
						Sign Up
					</button>
				</div>
				<div className="text-center text-blue-500">
					<Link to="/login">
						{message}
					</Link>
				</div>
				<div className="text-center text-red-500">
					{error}
				</div>
			</form>
		</div>
	);
};

export default SignupForm;
