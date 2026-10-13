package com.gigsphere.gigmart.config;

import com.gigsphere.gigmart.dto.UserRegisterRequest;
import com.gigsphere.gigmart.dto.UserResponse;
import com.gigsphere.gigmart.entity.ServiceCategory;
import com.gigsphere.gigmart.enums.UserRole;
import com.gigsphere.gigmart.repository.ServiceCategoryRepository;
import com.gigsphere.gigmart.repository.UserRepository;
import com.gigsphere.gigmart.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ServiceCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public DataInitializer(ServiceCategoryRepository categoryRepository,
                           UserRepository userRepository,
                           UserService userService) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Override
    public void run(String... args) {
        seedCategories();
        seedDemoUsers();
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            List<ServiceCategory> defaultCategories = List.of(
                    new ServiceCategory("AC Technician", "air-conditioner", true),
                    new ServiceCategory("Plumber", "wrench", true),
                    new ServiceCategory("Electrician", "bolt", true),
                    new ServiceCategory("Gardener", "flower", true),
                    new ServiceCategory("Carpenter", "hammer", true),
                    new ServiceCategory("House Cleaner", "sparkles", true),
                    new ServiceCategory("Painter", "brush", true),
                    new ServiceCategory("Appliance Repair", "cog", true)
            );
            categoryRepository.saveAll(defaultCategories);
            System.out.println(">>> Seeded default service categories.");
        }
    }

    private void seedDemoUsers() {
        if (userRepository.count() == 0) {
            // Seed Admin
            UserRegisterRequest admin = new UserRegisterRequest();
            admin.setFullName("Platform Admin");
            admin.setEmail("admin@gigmart.com");
            admin.setPhone("+10000000001");
            admin.setPassword("admin123");
            admin.setRole(UserRole.ADMIN);
            userService.register(admin);

            // Seed Demo Provider
            UserRegisterRequest provider = new UserRegisterRequest();
            provider.setFullName("John Provider");
            provider.setEmail("provider@gigmart.com");
            provider.setPhone("+10000000002");
            provider.setPassword("provider123");
            provider.setRole(UserRole.PROVIDER);
            UserResponse pResp = userService.register(provider);
            userService.verifyUser(pResp.getId());

            // Seed Demo Worker
            UserRegisterRequest worker = new UserRegisterRequest();
            worker.setFullName("Alex Worker");
            worker.setEmail("worker@gigmart.com");
            worker.setPhone("+10000000003");
            worker.setPassword("worker123");
            worker.setRole(UserRole.WORKER);
            UserResponse wResp = userService.register(worker);
            userService.verifyUser(wResp.getId());

            System.out.println(">>> Seeded demo users (admin, provider, worker).");
        }
    }
}
