import React from 'react';
import ReactDOM from 'react-dom';
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

async function bootstrap() {
  await preloadHighchartsModules();

  ReactDOM.render(
    <DocsErrorBoundary>
      <App reactLine="17.0.2" />
    </DocsErrorBoundary>,
    document.getElementById('root')
  );
}

bootstrap();
