import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  if (online) return null;

  return (
    <div className="offline-banner" role="status">
      You are offline. Cached pages may load; live routes need a connection.
    </div>
  );
}
