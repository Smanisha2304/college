export default function RouteCard({ route }) {
  return (
    <div className="route-card">
      <h4>{route.name || route.id}</h4>
      <p>Distance: {route.distance} km</p>
      <p>Duration: {route.duration} min</p>
      <p>Avg Speed: {route.avgSpeed} km/h</p>
      <p>Traffic: {route.level}</p>
      {!!route.roads?.length && (
        <p className="muted">Roads: {route.roads.slice(0, 4).join(" -> ")}</p>
      )}
      <div className="incident-grid">
        <span className="pill">Congestion: {route.incidents?.congestion || "Unknown"}</span>
        <span className="pill">Accident: {route.incidents?.accident || "Unknown"}</span>
        <span className="pill">Construction: {route.incidents?.construction || "Unknown"}</span>
      </div>
      {!!route.alerts?.length && (
        <ul className="alerts">
          {route.alerts.map((alert) => (
            <li key={alert}>{alert}</li>
          ))}
        </ul>
      )}
    </div>
  );
}