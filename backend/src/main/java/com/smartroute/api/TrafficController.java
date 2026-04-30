package com.smartroute.api;

import com.smartroute.service.TrafficService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/traffic")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TrafficController {

    private final TrafficService trafficService;

    public TrafficController(TrafficService trafficService) {
        this.trafficService = trafficService;
    }

    // ---------------- LOCATION NAME ----------------
    @PostMapping("/location-name")
    public Map<String, Object> getLocationName(@RequestBody Map<String, String> req) {

        String source = req.get("source");

        if (source == null || source.isBlank()) {
            return Map.of("squareName", "Invalid location");
        }

        return trafficService.getLocationName(source);
    }

    // ---------------- SUGGESTIONS ----------------
    @GetMapping("/suggestions")
    public Map<String, Object> getSuggestions(@RequestParam String query) {

        if (query == null || query.isBlank()) {
            return Map.of("suggestions", java.util.List.of());
        }

        return trafficService.getSuggestions(query);
    }

    // ---------------- ROUTE ANALYSIS ----------------
    @PostMapping("/analyze")
    public Map<String, Object> analyze(@RequestBody Map<String, String> req) {

        String source = req.get("source");
        String destination = req.get("destination");

        if (source == null || destination == null) {
            return Map.of(
                    "routes", java.util.List.of(),
                    "recommendation", null
            );
        }

        return trafficService.analyze(source, destination);
    }
}