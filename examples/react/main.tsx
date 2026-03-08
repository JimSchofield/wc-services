import { createRoot } from "react-dom/client";
import { ServiceProvider } from "../../lib/index";
import { App } from "./App";

ServiceProvider.setup();

createRoot(document.getElementById("app")!).render(<App />);
