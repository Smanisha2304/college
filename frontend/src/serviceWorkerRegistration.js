// serviceWorkerRegistration.js

export function register() {
  if (process.env.NODE_ENV !== "production") {
    unregister();
    return;
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });
    });
  }
}

export function unregister() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}