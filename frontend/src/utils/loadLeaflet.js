/**
 * Loads Leaflet once from CDN so webpack does not require `leaflet` in node_modules.
 * Sets window.L for RouteMapView.
 */
let loadPromise = null;

export function loadLeaflet() {
  if (typeof window !== "undefined" && window.L) {
    return Promise.resolve(window.L);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existingCss = document.querySelector('link[data-leaflet-css="1"]');
    if (!existingCss) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      css.crossOrigin = "";
      css.setAttribute("data-leaflet-css", "1");
      document.head.appendChild(css);
    }

    const existingScript = document.querySelector('script[data-leaflet-js="1"]');
    if (existingScript) {
      if (window.L) {
        resolve(window.L);
        return;
      }
      existingScript.addEventListener("load", () => resolve(window.L), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Leaflet script failed")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.crossOrigin = "";
    script.setAttribute("data-leaflet-js", "1");
    script.onload = () => {
      if (window.L) resolve(window.L);
      else reject(new Error("Leaflet loaded but window.L is missing"));
    };
    script.onerror = () => reject(new Error("Could not load map library (network/CDN blocked)."));
    document.body.appendChild(script);
  });

  return loadPromise;
}
