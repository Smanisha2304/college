export default function RouteHistoryPanel({ items, loading, error, hasLoaded, onRefresh, onPick }) {
  return (
    <aside className="route-history-panel" aria-label="Recent searches">
      <div className="route-history-header">
        <h3 className="route-history-title">Recent routes</h3>
        {loading ? (
          <span className="route-history-status muted">Loading...</span>
        ) : (
          <button type="button" className="route-history-load-btn" onClick={onRefresh}>
            Get History
          </button>
        )}
      </div>
      {error && <p className="error route-history-error">{error}</p>}
      <ul className="route-history-list">
        {!loading && !hasLoaded && (
          <li className="muted route-history-empty">Click "Get History" to load your recent routes.</li>
        )}
        {!loading && hasLoaded && items.length === 0 && (
          <li className="muted route-history-empty">No history yet. Plan a route to see it here.</li>
        )}
        {items.map((row) => (
          <li key={row.id}>
            <div className="route-history-item">
              <button
                type="button"
                className="route-history-pick-btn"
                onClick={() => onPick(row.destination)}
              >
                <span className="route-history-dest">{row.destination}</span>
                {row.sourceLabel && (
                  <span className="route-history-meta muted">From {row.sourceLabel}</span>
                )}
                <span className="route-history-time muted">
                  {new Date(row.createdAt).toLocaleString()}
                </span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
