'use client';

import { useEffect } from 'react';

/**
 * Global Error Boundary for the NinjaOne Report Dashboard.
 * Catches unhandled errors in server components and renders a friendly fallback UI.
 */
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[GlobalError] Unhandled application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#0f172a', color: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ textAlign: 'center', maxWidth: 480, padding: '2rem' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#f87171' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>
            An unexpected error occurred while loading the dashboard. Please try refreshing the page.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
          {process.env.NODE_ENV !== 'production' && (
            <pre style={{ marginTop: 24, background: '#1e293b', padding: 16, borderRadius: 8, textAlign: 'left', fontSize: 12, color: '#fbbf24', overflow: 'auto' }}>
              {error?.message}
            </pre>
          )}
        </div>
      </body>
    </html>
  );
}
