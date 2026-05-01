package com.smartroute.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class TrafficService {

    private static final Logger log = LoggerFactory.getLogger(TrafficService.class);

    @Value("${smartroute.mapbox.accessToken}")
    private String token;

    private final RestTemplate restTemplate = new RestTemplate();

    // -------- LOCATION NAME --------
    public Map<String, Object> getLocationName(String source) {
        try {
            double[] sourceLatLng = parseLatLng(source);
            double sourceLat = sourceLatLng[0];
            double sourceLng = sourceLatLng[1];

            String url = "https://api.mapbox.com/geocoding/v5/mapbox.places/"
                    + sourceLng + "," + sourceLat
                    + ".json?types=place,locality,neighborhood,address&limit=1&access_token=" + token;

            Map<?, ?> res = restTemplate.getForObject(url, Map.class);
            List<?> features = asList(res == null ? null : res.get("features"));

            String name = "Unknown";
            if (!features.isEmpty() && features.get(0) instanceof Map<?, ?> first) {
                name = asString(first.get("place_name"), "Unknown");
            }
            return Map.of("squareName", name);
        } catch (Exception ex) {
            log.warn("Reverse geocoding failed for source '{}': {}", source, ex.getMessage());
            return Map.of("squareName", "Unknown");
        }
    }

    // -------- SUGGESTIONS --------
    public Map<String, Object> getSuggestions(String query) {
        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = "https://api.mapbox.com/geocoding/v5/mapbox.places/"
                    + encodedQuery + ".json?autocomplete=true&limit=7&types=place,locality,neighborhood,address,poi"
                    + "&country=IN&language=en&access_token=" + token;

            Map<?, ?> res = restTemplate.getForObject(url, Map.class);
            List<?> features = asList(res == null ? null : res.get("features"));

            List<Map<String, Object>> list = new ArrayList<>();
            for (Object obj : features) {
                if (!(obj instanceof Map<?, ?> f)) continue;
                List<?> center = asList(f.get("center"));
                double centerLng = asDouble(center, 0);
                double centerLat = asDouble(center, 1);

                list.add(Map.of(
                        "id", asString(f.get("id"), UUID.randomUUID().toString()),
                        "name", asString(f.get("text"), ""),
                        "placeName", asString(f.get("place_name"), ""),
                        "center", centerLng + "," + centerLat
                ));
            }
            return Map.of("suggestions", list);
        } catch (Exception ex) {
            log.warn("Suggestions API failed for query '{}': {}", query, ex.getMessage());
            return Map.of("suggestions", List.of());
        }
    }

    // -------- ROUTE ANALYSIS --------
    public Map<String, Object> analyze(String source, String destination) {
        try {
            double[] sourceLatLng = parseLatLng(source);
            double sourceLat = sourceLatLng[0];
            double sourceLng = sourceLatLng[1];

            String sourcePlaceName = getLocationName(source).get("squareName").toString();

            // Convert destination text to lng,lat
            String encodedDestination = URLEncoder.encode(destination, StandardCharsets.UTF_8);
            String geoUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places/"
                    + encodedDestination + ".json?autocomplete=true&limit=1&country=IN&language=en&access_token=" + token;

            Map<?, ?> geoRes = restTemplate.getForObject(geoUrl, Map.class);
            List<?> features = asList(geoRes == null ? null : geoRes.get("features"));

            if (features.isEmpty() || !(features.get(0) instanceof Map<?, ?> first)) {
                return Map.of(
                        "sourceSquareName", sourcePlaceName,
                        "destinationSquareName", "Unknown",
                        "source", sourceLng + "," + sourceLat,
                        "destination", "",
                        "staticMapImageUrl", "",
                        "routes", List.of(),
                        "recommendation", null
                );
            }

            List<?> center = asList(first.get("center"));
            double destinationLng = asDouble(center, 0);
            double destinationLat = asDouble(center, 1);
            String destinationPlaceName = asString(first.get("place_name"), destination);

            // Directions API (MULTIPLE ROUTES + STEPS)
            String dirUrl = "https://api.mapbox.com/directions/v5/mapbox/driving/"
                    + sourceLng + "," + sourceLat + ";" + destinationLng + "," + destinationLat
                    + "?alternatives=true&steps=true&overview=full&geometries=polyline&language=en&access_token=" + token;

            Map<?, ?> dirRes = restTemplate.getForObject(dirUrl, Map.class);
            List<?> routes = asList(dirRes == null ? null : dirRes.get("routes"));

            if (routes.isEmpty()) {
                return Map.of(
                        "sourceSquareName", sourcePlaceName,
                        "destinationSquareName", destinationPlaceName,
                        "source", sourceLng + "," + sourceLat,
                        "destination", destinationLng + "," + destinationLat,
                        "staticMapImageUrl", "",
                        "routes", List.of(),
                        "recommendation", null
                );
            }

            List<Map<String, Object>> routeList = new ArrayList<>();
            int i = 1;
            for (Object obj : routes) {
                if (!(obj instanceof Map<?, ?> r)) continue;

                double distanceKm = asNumber(r.get("distance")) / 1000.0;
                double durationMin = asNumber(r.get("duration")) / 60.0;
                double avgSpeed = durationMin > 0 ? (distanceKm / (durationMin / 60.0)) : 0.0;

                // steps
                List<?> legs = asList(r.get("legs"));
                List<Map<String, Object>> stepsList = new ArrayList<>();
                List<String> roadNames = new ArrayList<>();

                if (!legs.isEmpty() && legs.get(0) instanceof Map<?, ?> leg) {
                    List<?> steps = asList(leg.get("steps"));

                    int order = 1;
                    for (Object sObj : steps) {
                        if (!(sObj instanceof Map<?, ?> step)) continue;
                        Map<?, ?> maneuver = step.get("maneuver") instanceof Map<?, ?> mv ? mv : Map.of();
                        String road = asString(step.get("name"), "Unnamed Road");
                        if (!road.isBlank() && !roadNames.contains(road)) {
                            roadNames.add(road);
                        }

                        stepsList.add(Map.of(
                                "order", order++,
                                "instruction", asString(maneuver.get("instruction"), "Continue"),
                                "road", road,
                                "squareName", road,
                                "distance", round2(asNumber(step.get("distance")) / 1000.0),
                                "duration", round2(asNumber(step.get("duration")) / 60.0)
                        ));
                    }
                }

                String level = avgSpeed >= 40 ? "Low" : avgSpeed >= 25 ? "Moderate" : "High";

                Map<String, Object> routePayload = new LinkedHashMap<>();
                routePayload.put("id", "r" + i);
                routePayload.put("name", i == 1 ? "Fastest Route" : "Alternative Route");
                routePayload.put("distance", round2(distanceKm));
                routePayload.put("duration", round2(durationMin));
                routePayload.put("avgSpeed", round2(avgSpeed));
                routePayload.put("level", level);
                routePayload.put("roads", roadNames);
                routePayload.put("incidents", Map.of(
                        "congestion", "Unknown",
                        "accident", "Unknown",
                        "construction", "Unknown"
                ));
                routePayload.put("alerts", List.of());
                routePayload.put("navigationSteps", stepsList);
                routePayload.put("geometry", asString(r.get("geometry"), ""));

                routeList.add(routePayload);

                i++;
            }

            Map recommended = routeList.stream()
                    .min(Comparator.comparing(r -> (Double) r.get("duration")))
                    .orElse(null);

            String staticMapImageUrl = "";
            if (recommended != null) {
                String geometry = asString(recommended.get("geometry"), "");
                staticMapImageUrl = buildStaticMapUrl(geometry, sourceLng, sourceLat, destinationLng, destinationLat);
            }

            return Map.of(
                    "sourceSquareName", sourcePlaceName,
                    "destinationSquareName", destinationPlaceName,
                    "source", sourceLng + "," + sourceLat,
                    "destination", destinationLng + "," + destinationLat,
                    "staticMapImageUrl", staticMapImageUrl,
                    "routes", routeList,
                    "recommendation", recommended
            );
        } catch (Exception e) {
            log.error("Route analysis failed for source '{}' and destination '{}'", source, destination, e);
            return Map.of(
                    "sourceSquareName", "Unknown",
                    "destinationSquareName", "Unknown",
                    "source", "",
                    "destination", "",
                    "staticMapImageUrl", "",
                    "routes", List.of(),
                    "recommendation", null
            );
        }
    }

    private double[] parseLatLng(String latLng) {
        if (latLng == null || latLng.isBlank()) {
            throw new IllegalArgumentException("Coordinates are required in lat,lng format.");
        }
        String[] parts = latLng.split(",");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid coordinates. Expected lat,lng.");
        }
        double lat = Double.parseDouble(parts[0].trim());
        double lng = Double.parseDouble(parts[1].trim());
        return new double[]{lat, lng};
    }

    private String buildStaticMapUrl(String polyline, double sourceLng, double sourceLat, double destLng, double destLat) {
        if (polyline == null || polyline.isBlank()) {
            return "";
        }
        String encodedPolyline = URLEncoder.encode(polyline, StandardCharsets.UTF_8);
        return "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/"
                + "path-5+1E90FF-0.8(" + encodedPolyline + "),"
                + "pin-s-a+2ecc71(" + sourceLng + "," + sourceLat + "),"
                + "pin-s-b+e74c3c(" + destLng + "," + destLat + ")/"
                + "auto/1000x500?padding=60&access_token=" + token;
    }

    private List<?> asList(Object value) {
        if (value instanceof List<?> list) return list;
        return List.of();
    }

    private String asString(Object value, String fallback) {
        if (value == null) return fallback;
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? fallback : text;
    }

    private double asNumber(Object value) {
        if (value instanceof Number n) return n.doubleValue();
        return 0.0;
    }

    private double asDouble(List<?> list, int index) {
        if (index < 0 || index >= list.size()) return 0.0;
        Object value = list.get(index);
        return value instanceof Number n ? n.doubleValue() : 0.0;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}