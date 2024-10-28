import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from './App'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});



ReactDOM.createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<App />
		</ThemeProvider>
	</StrictMode>,
);
