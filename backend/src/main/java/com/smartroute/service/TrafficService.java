package com.smartroute.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class TrafficService {

    @Value("${smartroute.mapbox.accessToken}")
    private String token;

    private final RestTemplate restTemplate = new RestTemplate();

    // -------- LOCATION NAME --------
    public Map<String, Object> getLocationName(String source) {

        String url = "https://api.mapbox.com/geocoding/v5/mapbox.places/"
                + source + ".json?access_token=" + token;

        Map res = restTemplate.getForObject(url, Map.class);
        List features = (List) res.get("features");

        String name = "Unknown";

        if (features != null && !features.isEmpty()) {
            Map f = (Map) features.get(0);
            name = (String) f.get("place_name");
        }

        return Map.of("squareName", name);
    }

    // -------- SUGGESTIONS --------
    public Map<String, Object> getSuggestions(String query) {

        String url = "https://api.mapbox.com/geocoding/v5/mapbox.places/"
                + query + ".json?autocomplete=true&limit=5&access_token=" + token;

        Map res = restTemplate.getForObject(url, Map.class);
        List features = (List) res.get("features");

        List<Map<String, Object>> list = new ArrayList<>();

        if (features != null) {
            for (Object obj : features) {
                Map f = (Map) obj;

                list.add(Map.of(
                        "id", f.get("id"),
                        "name", f.get("text"),
                        "placeName", f.get("place_name")
                ));
            }
        }

        return Map.of("suggestions", list);
    }

    // -------- ROUTE ANALYSIS --------
    public Map<String, Object> analyze(String source, String destination) {

        try {
            String[] s = source.split(",");
            String lat1 = s[0];
            String lng1 = s[1];

            // Convert destination to lat/lng
            String geoUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places/"
                    + destination + ".json?access_token=" + token;

            Map geoRes = restTemplate.getForObject(geoUrl, Map.class);
            List features = (List) geoRes.get("features");

            if (features == null || features.isEmpty()) {
                return Map.of("routes", List.of(), "recommendation", null);
            }

            Map first = (Map) features.get(0);
            List center = (List) first.get("center");

            double lng2 = ((Number) center.get(0)).doubleValue();
            double lat2 = ((Number) center.get(1)).doubleValue();

            // Directions API (MULTIPLE ROUTES + STEPS)
            String dirUrl = "https://api.mapbox.com/directions/v5/mapbox/driving/"
                    + lng1 + "," + lat1 + ";" + lng2 + "," + lat2
                    + "?alternatives=true&steps=true&overview=full&geometries=geojson&access_token=" + token;

            Map dirRes = restTemplate.getForObject(dirUrl, Map.class);
            List routes = (List) dirRes.get("routes");

            if (routes == null || routes.isEmpty()) {
                return Map.of("routes", List.of(), "recommendation", null);
            }

            List<Map<String, Object>> routeList = new ArrayList<>();

            int i = 1;
            for (Object obj : routes) {
                Map r = (Map) obj;

                double distance = ((Number) r.get("distance")).doubleValue() / 1000;
                double duration = ((Number) r.get("duration")).doubleValue() / 60;

                // steps
                List legs = (List) r.get("legs");
                List<Map<String, Object>> stepsList = new ArrayList<>();

                if (legs != null && !legs.isEmpty()) {
                    Map leg = (Map) legs.get(0);
                    List steps = (List) leg.get("steps");

                    if (steps != null) {
                        int order = 1;
                        for (Object sObj : steps) {
                            Map step = (Map) sObj;
                            Map maneuver = (Map) step.get("maneuver");

                            stepsList.add(Map.of(
                                    "order", order++,
                                    "instruction", maneuver.get("instruction"),
                                    "distance", ((Number) step.get("distance")).doubleValue() / 1000,
                                    "duration", ((Number) step.get("duration")).doubleValue() / 60
                            ));
                        }
                    }
                }

                routeList.add(Map.of(
                        "id", "r" + i,
                        "name", i == 1 ? "Fastest Route" : "Alternative Route",
                        "distance", distance,
                        "duration", duration,
                        "navigationSteps", stepsList
                ));

                i++;
            }

            Map recommended = routeList.stream()
                    .min(Comparator.comparing(r -> (Double) r.get("duration")))
                    .orElse(null);

            return Map.of(
                    "routes", routeList,
                    "recommendation", recommended
            );

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("routes", List.of(), "recommendation", null);
        }
    }
}