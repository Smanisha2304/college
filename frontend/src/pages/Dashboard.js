// import '../style/dashboard'
// import "../style/dashboard.css";
import { useState, useContext, useEffect } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import RouteCard from "../components/RouteCard";
import mapBanner from "../assets/map-banner.svg";

export default function Dashboard() {
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);
  const [routeData, setRouteData] = useState(null);
  const [showNavigationSteps, setShowNavigationSteps] = useState(false);
  const [visibleStepCount, setVisibleStepCount] = useState(5);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLabel, setSourceLabel] = useState("");
  const [sourceCoords, setSourceCoords] = useState("");
  const { token, user, logout } = useContext(AuthContext);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const source = `${pos.coords.latitude},${pos.coords.longitude}`;
        setSourceCoords(source);
        try {
          const res = await axios.post(
            "/traffic/location-name",
            { source },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setSourceLabel(res.data.squareName || source);
        } catch {
          setSourceLabel(source);
        }
      },
      () => setSourceLabel("Location permission needed")
    );
  }, [token]);

  useEffect(() => {
    if (!destination.trim()) {
      setSuggestions([]);
      setIsSuggestionOpen(false);
      setHighlightedSuggestionIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSuggestionsLoading(true);
        const res = await axios.get("/traffic/suggestions", {
          params: { query: destination.trim() },
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuggestions(res.data.suggestions || []);
        setIsSuggestionOpen(true);
        setHighlightedSuggestionIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [destination, token]);

  const handleDestinationSelect = (suggestion) => {
    setDestination(suggestion.placeName || suggestion.name);
    setSuggestions([]);
    setIsSuggestionOpen(false);
    setHighlightedSuggestionIndex(-1);
  };

  const toGoogleDirectionsUrl = (lngLatFromApi, lngLatToApi) => {
    if (!lngLatFromApi || !lngLatToApi) return "";
    const [fromLng, fromLat] = lngLatFromApi.split(",").map((item) => item.trim());
    const [toLng, toLat] = lngLatToApi.split(",").map((item) => item.trim());
    if (!fromLat || !fromLng || !toLat || !toLng) return "";
    return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&travelmode=driving`;
  };
// const toEmbedUrl = (from, to) => {
//   if (!from || !to) return "";

//   // Mapbox gives: lng,lat
//   const [fromLng, fromLat] = from.split(",");
//   const [toLng, toLat] = to.split(",");

//   if (!fromLat || !fromLng || !toLat || !toLng) return "";

//   // Google needs: lat,lng
//   return `https://www.google.com/maps/embed/v1/directions?key=YOUR_API_KEY&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&mode=driving`;
// };
  const handleStartNavigation = () => {
    const url = toGoogleDirectionsUrl(routeData?.source, routeData?.destination);
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDestinationKeyDown = (event) => {
    if (!isSuggestionOpen || !suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedSuggestionIndex((prev) => (
        prev < suggestions.length - 1 ? prev + 1 : 0
      ));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedSuggestionIndex((prev) => (
        prev > 0 ? prev - 1 : suggestions.length - 1
      ));
      return;
    }

    if (event.key === "Enter" && highlightedSuggestionIndex >= 0) {
      event.preventDefault();
      handleDestinationSelect(suggestions[highlightedSuggestionIndex]);
      return;
    }

    if (event.key === "Escape") {
      setIsSuggestionOpen(false);
    }
  };

  const getRoute = async () => {
    setError("");
    setIsLoading(true);
    setRouteData(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const source = `${pos.coords.latitude},${pos.coords.longitude}`;
          setSourceCoords(source);
          const res = await axios.post(
            "/traffic/analyze",
            { source, destination },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          setRouteData(res.data);
          setSourceLabel(res.data.sourceSquareName || source);
          setIsSuggestionOpen(false);
          setShowNavigationSteps(false);
          setVisibleStepCount(5);
        } catch (err) {
          setError(err.response?.data?.error || err.response?.data?.msg || "Failed to fetch route");
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setIsLoading(false);
        setError("Please allow location access to get routes.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="page">
      <div className="dashboard-header">
        <div>
          <h2>Smart Traffic Dashboard</h2>
          <p>Welcome, <strong>{user?.fullName || "User"}</strong></p>
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      <img className="map-banner" src={mapBanner} alt="Map routes visual" />

      <div className="location-box">
        <p><strong>Current Location:</strong> {sourceLabel || "Fetching current location..."}</p>
        {!!sourceCoords && <p className="muted">{sourceCoords}</p>}
      </div>

      <div className="route-form">
        <label className="field-label">Destination</label>
        <div className="suggestion-wrapper">
          <input
            placeholder="Enter destination/square name (example: Vijay Nagar, Satya Sai)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onFocus={() => setIsSuggestionOpen(true)}
            onKeyDown={handleDestinationKeyDown}
          />
          {isSuggestionOpen && (isSuggestionsLoading || suggestions.length > 0) && (
            <div className="suggestion-dropdown">
              {isSuggestionsLoading && <p className="muted">Searching places...</p>}
              {!isSuggestionsLoading && suggestions.map((item, index) => (
                <button
                  key={item.id}
                  className={`suggestion-item ${highlightedSuggestionIndex === index ? "active" : ""}`}
                  type="button"
                  onClick={() => handleDestinationSelect(item)}
                >
                  <strong>{item.name}</strong>
                  <span>{item.placeName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={getRoute} disabled={!destination || isLoading}>
          {isLoading ? "Loading..." : "Get Route"}
        </button>
      </div>

      {sourceLabel && <p>Current location: {sourceLabel}</p>}
      {error && <p className="error">{error}</p>}

      {routeData && (
        <div>
          <h3 className="section-title">
            Recommended Route: {routeData.recommendation?.name || routeData.recommendation?.id}
          </h3>
          <p className="muted">
            From: {routeData.sourceSquareName} | To: {routeData.destinationSquareName}
          </p>
          <RouteCard route={routeData.recommendation} />
           {/* <iframe
        width="100%"
        height="400"
        style={{ border: 0, borderRadius: "10px" }}
        loading="lazy"
        allowFullScreen
        src={toEmbedUrl(routeData?.source, routeData?.destination)}
      /> */}
          <div className="action-buttons">
            <button type="button" onClick={handleStartNavigation}>
              Start Navigation
            </button>
            {!!routeData.recommendation?.navigationSteps?.length && (
              <button
                type="button"
                onClick={() => setShowNavigationSteps((prev) => !prev)}
              >
                {showNavigationSteps ? "Hide Steps" : "Show Step-by-Step Navigation"}
              </button>
            )}
          </div>
          {!!routeData.recommendation?.staticMapImageUrl && (
            <img
              className="navigation-map"
              src={routeData.recommendation.staticMapImageUrl}
              alt="Recommended route map"
            />
          )}
          {!!routeData.recommendation?.navigationSquares?.length && (
            <p className="muted">
              Squares/Junctions on route: {routeData.recommendation.navigationSquares.join(" -> ")}
            </p>
          )}
          {!!routeData.recommendation?.navigationSteps?.length && showNavigationSteps && (
            <div className="navigation-list">
              <h4>Step-by-step navigation</h4>
              {routeData.recommendation.navigationSteps.slice(0, visibleStepCount).map((step) => (
                <div key={`${step.order}-${step.instruction}`} className="navigation-step">
                  <p>
                    <strong>{step.order}. {step.instruction}</strong>
                  </p>
                  <p className="muted">
                    Road: {step.road} | Square: {step.squareName} | {step.distance} km | {step.duration} min
                  </p>
                </div>
              ))}
              {visibleStepCount < routeData.recommendation.navigationSteps.length && (
                <button
                  type="button"
                  onClick={() => setVisibleStepCount((count) => count + 5)}
                >
                  Show More Steps
                </button>
              )}
            </div>
          )}

          <h3 className="section-title">All Available Routes</h3>
          {routeData.routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}
    </div>
  );
}