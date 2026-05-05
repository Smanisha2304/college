package com.smartroute.api.auth;

import com.smartroute.api.auth.dto.DeleteRequestResponse;
import com.smartroute.service.AuthService;
import com.smartroute.service.DeleteRequestService;
import com.smartroute.service.RouteHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/admin", "/admin"})
public class AdminController {
    private final AuthService authService;
    private final RouteHistoryService routeHistoryService;
    private final DeleteRequestService deleteRequestService;

    public AdminController(
            AuthService authService,
            RouteHistoryService routeHistoryService,
            DeleteRequestService deleteRequestService
    ) {
        this.authService = authService;
        this.routeHistoryService = routeHistoryService;
        this.deleteRequestService = deleteRequestService;
    }

    @GetMapping("/users")
    public ResponseEntity<?> users() {
        return ResponseEntity.ok(authService.listUsers());
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> userHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(routeHistoryService.getUserHistoryByAdmin(userId));
    }

    @GetMapping("/delete-requests")
    public ResponseEntity<?> deleteRequests() {
        return ResponseEntity.ok(deleteRequestService.listAll());
    }

    @PostMapping("/delete-requests/{id}/approve")
    public ResponseEntity<DeleteRequestResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(deleteRequestService.approve(id));
    }

    @PostMapping("/delete-requests/{id}/reject")
    public ResponseEntity<DeleteRequestResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(deleteRequestService.reject(id));
    }
}
