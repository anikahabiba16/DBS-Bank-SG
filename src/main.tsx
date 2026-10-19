import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import "./index.css";

// Lazy initialize Sentry only when DSN is explicitly present in environment
const sentryDsn = import.meta.env['VITE_SENTRY_DSN'] as string | undefined;
if (sentryDsn) {
  import("@sentry/react").then((Sentry) => {
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE,
    });
  }).catch(() => {});
}

class SafeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (sentryDsn) {
      import("@sentry/react").then((Sentry) => {
        Sentry.captureException(error, { extra: errorInfo as any });
      }).catch(() => {});
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 text-2xl font-bold shadow-sm">
            !
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
            An unexpected error occurred. Please refresh the page or try again in a few moments.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-md hover:opacity-90 transition-all cursor-pointer"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <SafeErrorBoundary>
    <AppWrapper>
      <App />
    </AppWrapper>
  </SafeErrorBoundary>
);
