import React from 'react';
import { createRoot } from 'react-dom/client';
import { App, preloadHighchartsModules } from './App';
import './app.css';

type BoundaryState = {
  error: Error | null;
};

class DocsErrorBoundary extends React.Component<{ children: React.ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="shell">
          <section className="panel module-error">
            <pre>{this.state.error.stack || this.state.error.message}</pre>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found.');
}

const rootContainer = rootElement;

async function bootstrap() {
  await preloadHighchartsModules();

  createRoot(rootContainer).render(
    <React.StrictMode>
      <DocsErrorBoundary>
        <App reactLine="19.2.7" />
      </DocsErrorBoundary>
    </React.StrictMode>
  );
}

bootstrap();
