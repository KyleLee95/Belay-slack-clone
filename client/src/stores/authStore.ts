import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware'

interface LoginData {
	username: string;
	password: string;
}

interface SignupData extends LoginData {
	email: string;
}

interface AuthResponse {
	success: boolean;
	message?: string;
	user?: any
}

export const initialAuthState = {
	isAuthenticated: false,
	user: null,
	loading: true,
	error: null,
	login: async (data: LoginData): Promise<void> => { },
	restoreSessionFromCookie: async (): Promise<void> => { },
	logout: async (): Promise<void> => { },
	checkBrowserForCookie: (): void => { }
};


const useAuthStore = create(persist(devtools((set) => ({
	isAuthenticated: false,
	loading: true,
	user: null,
	error: null,

	signup: async (data: SignupData) => {
		try {
			const response = await fetch('/api/auth/signup', {
				headers: {
					"Content-Type": "application/json",
					"Credentials": 'include'
				},
				method: "POST",
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to signup');
			}

			const user = await response.json();
			set({ isAuthenticated: true, loading: false, user, error: null });
			return true


		} catch (error) {
			set({ isAuthenticated: false, user: null, loading: false, error: error.message });
		}
	},
	login: async (data: LoginData) => {
		set({ error: null });
		try {
			const response = await fetch(`/api/auth/login`, {
				headers: {
					"Content-Type": "application/json",
					"Credentials": 'include'
				},
				method: "POST",
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to login');
			}

			const user = await response.json();
			set({ isAuthenticated: true, loading: false, user, error: null });

			return response

		} catch (error) {
			set({ isAuthenticated: false, user: null, loading: false, error: error.message });
		}
	},

	logout: async () => {
		try {
			const response = await fetch('/api/auth/logout', { method: 'POST' });
			if (!response.ok) {
				throw new Error('Failed to logout');
			} else {
				set({ isAuthenticated: false, user: null, error: null });
				localStorage.removeItem("kchow1_belay_cookie");
			}
		} catch (error) {
			set({ error: error.message });
		}
	},

	clearError: () => set({ error: null }),

	checkAuth: async () => {
		try {
			const response = await fetch('/api/auth/validateCookie', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				}
			});
			if (!response.ok) {
				throw new Error('Token validation failed');
			}
			const data = await response.json();
			const { user } = data
			set({ isAuthenticated: true, loading: false, user });
		} catch (error) {
			set({ isAuthenticated: false, loading: false, user: null });
		}
	}
})), {
	name: 'kchow1_belay_token', // name of the item in the storage (must be unique)
	storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
}));

export default useAuthStore;
