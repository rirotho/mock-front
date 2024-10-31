import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const item = document.getElementById("root")
if (item){
	ReactDOM.createRoot(item).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
}
