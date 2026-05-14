import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

async function startMocks() {
  if (!import.meta.env.DEV) return;
  if (import.meta.env.VITE_USE_MOCKS === "false") return;

  console.log("[MSW] Importing worker...");
  const { worker } = await import("./mocks/browser");
  console.log("[MSW] Starting worker...");
  await worker.start({
    onUnhandledRequest: "warn",
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
  console.log("[MSW] Ready ✓");
}

startMocks().catch((e) => console.error("[MSW] Failed:", e));

createRoot(document.getElementById("root")!).render(<App />);
