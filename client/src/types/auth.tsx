import { User } from "./user";

export type LoginData = {
	username: string;
	password: string;
};

export type AuthState = {
	isAuthenticated: boolean;
	user: User | null; // Replace `any` with your actual user type
	loading: boolean;
	error: string | null;
	login: (data: LoginData) => Promise<void>;
	logout: () => Promise<void>;
	checkBrowserForCookie: () => void;
};
