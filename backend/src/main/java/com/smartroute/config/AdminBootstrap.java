package com.smartroute.config;

import com.smartroute.entity.Role;
import com.smartroute.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminBootstrap {
    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    @Bean
    CommandLineRunner promoteAdminIfConfigured(
            UserRepository userRepository,
            @Value("${smartroute.admin.bootstrapEmail:}") String bootstrapEmail
    ) {
        return args -> {
            if (bootstrapEmail == null || bootstrapEmail.isBlank()) return;
            String email = bootstrapEmail.trim().toLowerCase();
            userRepository.findByEmail(email).ifPresentOrElse(user -> {
                if (user.getRole() != Role.ADMIN) {
                    user.setRole(Role.ADMIN);
                    userRepository.save(user);
                    log.warn("Bootstrapped ADMIN role for {}", email);
                }
            }, () -> log.warn("Admin bootstrap email not found in DB: {}", email));
        };
    }
}
