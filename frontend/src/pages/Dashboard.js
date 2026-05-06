import { useState, useContext, useEffect, useRef, useCallback } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import RouteCard from "../components/RouteCard";
import RouteHistoryPanel from "../components/RouteHistoryPanel";
import mapBanner from "../assets/map-banner.svg";
import { fetchHistoryFromApi } from "../utils/routeHistory";
import { getStepPresentation } from "../utils/navigationInstruction";
import RouteMapView from "../components/RouteMapView";

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
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const mapSectionRef = useRef(null);
  const { token, user, logout } = useContext(AuthContext);
  const [hasHistoryLoaded, setHasHistoryLoaded] = useState(false);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const remote = await fetchHistoryFromApi(axios);
      setHistoryItems(remote);
      setHasHistoryLoaded(true);
    } catch (err) {
      console.error("History merge failed:", err);
      setHistoryError("Could not refresh history.");
      setHistoryItems([]);
      setHasHistoryLoaded(true);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    setHistoryItems([]);
    setHistoryError("");
    setHasHistoryLoaded(false);
    if (user?.id && token) {
      refreshHistory();
    }
  }, [user?.id, token, refreshHistory]);

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
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSourceLabel(res.data.squareName || source);
        } catch (err) {
          console.error("Failed to resolve current location name:", err);
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
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSuggestionsLoading(true);
        const res = await axios.get("/traffic/suggestions", {
          params: { query: destination.trim() },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuggestions(res.data.suggestions || []);
        setIsSuggestionOpen(true);
        setHighlightedSuggestionIndex(-1);
      } catch (err) {
        console.error("Failed to fetch destination suggestions:", err);
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

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDestinationKeyDown = (event) => {
    if (!isSuggestionOpen || !suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
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
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setRouteData(res.data);
          setSourceLabel(res.data.sourceSquareName || source);
          setIsSuggestionOpen(false);
          setShowNavigationSteps(false);
          setVisibleStepCount(5);

          if (destination.trim()) {
            const sourceResolved = res.data.sourceSquareName || source;
            await axios.post(
              "/api/user/history",
              {
                destination: destination.trim(),
                source,
                sourceLabel: sourceResolved,
                routeData: res.data,
              }
            );
            await refreshHistory();
          }
        } catch (err) {
          console.error("Failed to analyze route:", err);
          setError(
            err.response?.data?.error ||
              err.response?.data?.message ||
              err.response?.data?.msg ||
              "Failed to fetch route"
          );
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

  const handleHistoryPick = (text) => {
    setDestination(text);
    setIsSuggestionOpen(false);
  };

  const canShowMap =
    routeData?.source &&
    routeData?.destination &&
    routeData?.recommendation;

  return (
    <div className="page dashboard-page">
      <div className="dashboard-header">
        <div>
          <h2>Smart Traffic Dashboard</h2>
          <p>
            Welcome, <strong>{user?.fullName || "User"}</strong>
          </p>
        </div>
        <button type="button" className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <img className="map-banner" src={mapBanner} alt="Map routes visual" />

      <div className="dashboard-main-grid">
        <div className="dashboard-col dashboard-col-main">
          <div className="location-box">
            <p>
              <strong>Current Location:</strong> {sourceLabel || "Fetching current location..."}
            </p>
            {!!sourceCoords && <p className="muted">{sourceCoords}</p>}
          </div>

          <div className="route-form">
            <label className="field-label" htmlFor="destination-input">
              Destination
            </label>
            <div className="route-form-row">
              <div className="route-form-field-grow">
                <div className="suggestion-wrapper">
                  <input
                    id="destination-input"
                    placeholder="Enter destination/square name (example: Vijay Nagar, Satya Sai)"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onFocus={() => setIsSuggestionOpen(true)}
                    onKeyDown={handleDestinationKeyDown}
                  />
                  {isSuggestionOpen && (isSuggestionsLoading || suggestions.length > 0) && (
                    <div className="suggestion-dropdown">
                      {isSuggestionsLoading && <p className="muted">Searching places...</p>}
                      {!isSuggestionsLoading &&
                        suggestions.map((item, index) => (
                          <button
                            key={item.id}
                            type="button"
                            className={`suggestion-item ${highlightedSuggestionIndex === index ? "active" : ""}`}
                            onClick={() => handleDestinationSelect(item)}
                          >
                            <strong>{item.name}</strong>
                            <span>{item.placeName}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="route-submit-btn"
                onClick={getRoute}
                disabled={!destination || isLoading}
              >
                {isLoading ? "Loading..." : "Get Route"}
              </button>
            </div>
          </div>

          {sourceLabel && <p className="muted dashboard-location-repeat">Current location: {sourceLabel}</p>}
          {error && <p className="error">{error}</p>}
        </div>

        <div className="dashboard-col dashboard-col-side">
          <RouteHistoryPanel
            items={historyItems}
            loading={historyLoading}
            error={historyError}
            hasLoaded={hasHistoryLoaded}
            onRefresh={refreshHistory}
            onPick={handleHistoryPick}
          />
        </div>
      </div>

      {routeData && (
        <div className="dashboard-route-results">
          <h3 className="section-title">
            Recommended Route: {routeData.recommendation?.name || routeData.recommendation?.id}
          </h3>
          <p className="muted">
            From: {routeData.sourceSquareName} | To: {routeData.destinationSquareName}
          </p>
          {routeData.recommendation ? (
            <RouteCard route={routeData.recommendation} />
          ) : (
            <p className="muted">No recommended route available.</p>
          )}
          <div className="action-buttons">
            <button type="button" onClick={scrollToMap} disabled={!canShowMap}>
              View route on map
            </button>
            {!!routeData.recommendation?.navigationSteps?.length && (
              <button type="button" onClick={() => setShowNavigationSteps((prev) => !prev)}>
                {showNavigationSteps ? "Hide Steps" : "Show Step-by-Step Navigation"}
              </button>
            )}
          </div>

          {canShowMap && (
            <section className="route-map-section" ref={mapSectionRef} aria-label="In-app route map">
              <h4 className="section-subtitle">Navigation map</h4>
              <RouteMapView
                encodedPolyline={routeData.recommendation.geometry}
                sourceLngLat={routeData.source}
                destLngLat={routeData.destination}
                height={380}
              />
            </section>
          )}

          {!!routeData.recommendation?.navigationSquares?.length && (
            <p className="muted">
              Squares/Junctions on route: {routeData.recommendation.navigationSquares.join(" -> ")}
            </p>
          )}
          {!!routeData.recommendation?.navigationSteps?.length && showNavigationSteps && (
            <div className="navigation-list">
              <h4>Step-by-step navigation</h4>
              {routeData.recommendation.navigationSteps.slice(0, visibleStepCount).map((step) => {
                const pres = getStepPresentation(step.instruction);
                return (
                  <div key={`${step.order}-${step.instruction}`} className="navigation-step nav-step-enhanced">
                    <div className="nav-step-icon" aria-hidden="true">
                      <span className="nav-step-arrow">{pres.arrow}</span>
                      <span className="nav-step-label">{pres.label}</span>
                    </div>
                    <div className="nav-step-body">
                      <p className="nav-step-instruction">
                        <strong>
                          {step.order}. {pres.instructionText}
                        </strong>
                      </p>
                      <p className="muted">
                        Road: {step.road} | {step.distance} km | {step.duration} min
                      </p>
                    </div>
                  </div>
                );
              })}
              {visibleStepCount < routeData.recommendation.navigationSteps.length && (
                <button type="button" onClick={() => setVisibleStepCount((count) => count + 5)}>
                  Show More Steps
                </button>
              )}
            </div>
          )}

          <h3 className="section-title">All Available Routes</h3>
          {(routeData.routes || []).map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}
    </div>
  );
}
