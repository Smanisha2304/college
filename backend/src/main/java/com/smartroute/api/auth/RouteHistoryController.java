package com.smartroute.api.auth;

import com.smartroute.api.auth.dto.DeleteRequestCreateRequest;
import com.smartroute.api.auth.dto.RouteHistoryRequest;
import com.smartroute.service.DeleteRequestService;
import com.smartroute.service.RouteHistoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
public class RouteHistoryController {
    private final RouteHistoryService routeHistoryService;
    private final DeleteRequestService deleteRequestService;

    public RouteHistoryController(RouteHistoryService routeHistoryService, DeleteRequestService deleteRequestService) {
        this.routeHistoryService = routeHistoryService;
        this.deleteRequestService = deleteRequestService;
    }

    @GetMapping({"/api/user/history", "/user/history", "/api/route-history"})
    public ResponseEntity<?> getHistory(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        String userId = authentication.getName();
        return ResponseEntity.ok(routeHistoryService.getUserHistory(userId));
    }

    @PostMapping({"/api/user/history", "/user/history", "/api/route-history"})
    public ResponseEntity<?> save(@RequestBody RouteHistoryRequest req,
                                  Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String userId = authentication.getName();
        return ResponseEntity.ok(routeHistoryService.save(req, userId));
    }

    @PostMapping({"/api/history/delete-request", "/history/delete-request"})
    public ResponseEntity<?> requestDelete(@Valid @RequestBody DeleteRequestCreateRequest req, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(deleteRequestService.create(userId, req.getHistoryId()));
    }

    @DeleteMapping("/api/route-history/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id,
                                    Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String userId = authentication.getName();
        routeHistoryService.delete(id, userId);
        return ResponseEntity.ok("Deleted");
    }

    @DeleteMapping("/api/route-history")
    public ResponseEntity<?> clear(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String userId = authentication.getName();
        routeHistoryService.clear(userId);
        return ResponseEntity.ok("Cleared");
    }
}