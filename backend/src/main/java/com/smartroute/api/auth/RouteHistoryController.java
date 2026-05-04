package com.smartroute.api.auth;

import com.smartroute.api.auth.dto.RouteHistoryRequest;
import com.smartroute.service.RouteHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/route-history")
public class RouteHistoryController {

    private final RouteHistoryService routeHistoryService;

    public RouteHistoryController(RouteHistoryService routeHistoryService) {
        this.routeHistoryService = routeHistoryService;
    }

    // GET all history for logged-in user
    @GetMapping
    public ResponseEntity<?> getHistory(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        String userId = authentication.getName();
        return ResponseEntity.ok(routeHistoryService.getUserHistory(userId));
    }

    // SAVE new route history
    @PostMapping
    public ResponseEntity<?> save(@RequestBody RouteHistoryRequest req,
                                  Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String userId = authentication.getName();
        return ResponseEntity.ok(routeHistoryService.save(req, userId));
    }

    // DELETE single history item
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id,
                                    Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String userId = authentication.getName();
        routeHistoryService.delete(id, userId);
        return ResponseEntity.ok("Deleted");
    }

    // CLEAR all history
    @DeleteMapping
    public ResponseEntity<?> clear(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String userId = authentication.getName();
        routeHistoryService.clear(userId);
        return ResponseEntity.ok("Cleared");
    }
}