package com.smartroute.api.auth;

import com.smartroute.service.AuthService;
import com.smartroute.service.RouteHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/admin", "/admin"})
public class AdminController {
    private final AuthService authService;
    private final RouteHistoryService routeHistoryService;

    public AdminController(
            AuthService authService,
            RouteHistoryService routeHistoryService
    ) {
        this.authService = authService;
        this.routeHistoryService = routeHistoryService;
    }

    @GetMapping("/users")
    public ResponseEntity<?> users() {
        return ResponseEntity.ok(authService.listUsers());
    }

    @GetMapping({"/user/{userId}/history", "/history/{userId}"})
    public ResponseEntity<?> userHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(routeHistoryService.getUserHistoryByAdmin(userId));
    }
}
