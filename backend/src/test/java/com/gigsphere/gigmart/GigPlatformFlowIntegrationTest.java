package com.gigsphere.gigmart;

import com.gigsphere.gigmart.controller.*;
import com.gigsphere.gigmart.dto.*;
import com.gigsphere.gigmart.enums.*;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class GigPlatformFlowIntegrationTest {

    @Autowired
    private AuthController authController;

    @Autowired
    private UserController userController;

    @Autowired
    private CategoryController categoryController;

    @Autowired
    private AddressController addressController;

    @Autowired
    private WorkerProfileController workerProfileController;

    @Autowired
    private ProviderProfileController providerProfileController;

    @Autowired
    private GigController gigController;

    @Autowired
    private ApplicationController applicationController;

    @Autowired
    private BookingController bookingController;

    @Autowired
    private PaymentController paymentController;

    @Autowired
    private ReviewController reviewController;

    @Autowired
    private MessageController messageController;

    @Test
    @Order(1)
    void testUserRegistrationAndLogin() {
        long ts = System.currentTimeMillis();

        // 1. Register new user
        UserRegisterRequest reg = new UserRegisterRequest();
        reg.setFullName("Alice Customer");
        reg.setEmail("alice" + ts + "@test.com");
        reg.setPhone("+91" + (ts % 10000000000L));
        reg.setPassword("secret123");
        reg.setRole(UserRole.PROVIDER);

        ResponseEntity<ApiResponse<UserResponse>> regResp = authController.register(reg);
        assertNotNull(regResp.getBody());
        assertTrue(regResp.getBody().isSuccess());
        assertEquals("Alice Customer", regResp.getBody().getData().getFullName());

        // 2. Login
        UserLoginRequest login = new UserLoginRequest();
        login.setEmail(reg.getEmail());
        login.setPassword("secret123");

        ResponseEntity<ApiResponse<UserResponse>> loginResp = authController.login(login);
        assertNotNull(loginResp.getBody());
        assertTrue(loginResp.getBody().isSuccess());
        assertEquals(reg.getEmail(), loginResp.getBody().getData().getEmail());
    }

    @Test
    @Order(2)
    void testCategoriesEndpoint() {
        ResponseEntity<ApiResponse<List<CategoryResponse>>> catResp = categoryController.getAllCategories(false);
        assertNotNull(catResp.getBody());
        assertTrue(catResp.getBody().isSuccess());
        assertFalse(catResp.getBody().getData().isEmpty());
    }

    @Test
    @Order(3)
    void testFullGigMarketplaceFlow() {
        long ts = System.currentTimeMillis();

        // 1. Register Provider
        UserRegisterRequest providerUserReq = new UserRegisterRequest();
        providerUserReq.setFullName("Bob Builder Provider");
        providerUserReq.setEmail("bob" + ts + "@market.com");
        providerUserReq.setPhone("+9111" + (ts % 100000000L));
        providerUserReq.setPassword("password123");
        providerUserReq.setRole(UserRole.PROVIDER);

        ResponseEntity<ApiResponse<UserResponse>> pUserResp = authController.register(providerUserReq);
        assertNotNull(pUserResp.getBody());
        UUID providerUserId = pUserResp.getBody().getData().getId();

        // 2. Fetch Provider Profile
        ResponseEntity<ApiResponse<ProviderProfileResponse>> pProfResp =
                providerProfileController.getProfileByUserId(providerUserId);
        assertNotNull(pProfResp.getBody());
        UUID providerProfileId = pProfResp.getBody().getData().getId();

        // 3. Add Provider Address
        AddressRequest addrReq = new AddressRequest();
        addrReq.setUserId(providerUserId);
        addrReq.setLine1("42 Tech Boulevard");
        addrReq.setCity("Metropolis");
        addrReq.setPincode("560001");
        addrReq.setLatitude(12.9716f);
        addrReq.setLongitude(77.5946f);

        ResponseEntity<ApiResponse<AddressResponse>> addrResp = addressController.addAddress(addrReq);
        assertNotNull(addrResp.getBody());
        UUID addressId = addrResp.getBody().getData().getId();

        // 4. Register Worker
        UserRegisterRequest workerUserReq = new UserRegisterRequest();
        workerUserReq.setFullName("Charlie Tech Worker");
        workerUserReq.setEmail("charlie" + ts + "@market.com");
        workerUserReq.setPhone("+9122" + (ts % 100000000L));
        workerUserReq.setPassword("password123");
        workerUserReq.setRole(UserRole.WORKER);

        ResponseEntity<ApiResponse<UserResponse>> wUserResp = authController.register(workerUserReq);
        assertNotNull(wUserResp.getBody());
        UUID workerUserId = wUserResp.getBody().getData().getId();

        // 5. Fetch Worker Profile
        ResponseEntity<ApiResponse<WorkerProfileResponse>> wProfResp =
                workerProfileController.getProfileByUserId(workerUserId);
        assertNotNull(wProfResp.getBody());
        UUID workerProfileId = wProfResp.getBody().getData().getId();

        // 6. Get a Category
        ResponseEntity<ApiResponse<List<CategoryResponse>>> catList = categoryController.getAllCategories(true);
        assertNotNull(catList.getBody());
        assertFalse(catList.getBody().getData().isEmpty());
        UUID categoryId = catList.getBody().getData().get(0).getId();

        // 7. Worker adds service skill
        WorkerServiceRequest wsReq = new WorkerServiceRequest();
        wsReq.setWorkerProfileId(workerProfileId);
        wsReq.setCategoryId(categoryId);
        wsReq.setBaseRate(new BigDecimal("200.00"));
        wsReq.setRateType(RateType.HOURLY);

        ResponseEntity<ApiResponse<WorkerServiceResponse>> wsResp = workerProfileController.addService(wsReq);
        assertNotNull(wsResp.getBody());
        assertTrue(wsResp.getBody().isSuccess());

        // 8. Provider posts a Gig
        GigCreateRequest gigReq = new GigCreateRequest();
        gigReq.setProviderProfileId(providerProfileId);
        gigReq.setCategoryId(categoryId);
        gigReq.setAddressId(addressId);
        gigReq.setTitle("Urgent AC Servicing Required");
        gigReq.setDescription("AC is leaking water and not cooling.");
        gigReq.setBudget(new BigDecimal("600.00"));
        gigReq.setScheduledAt(LocalDateTime.now().plusDays(1));

        ResponseEntity<ApiResponse<GigResponse>> gigPostResp = gigController.createGig(gigReq);
        assertNotNull(gigPostResp.getBody());
        assertTrue(gigPostResp.getBody().isSuccess());
        UUID gigId = gigPostResp.getBody().getData().getId();
        assertEquals(GigStatus.OPEN, gigPostResp.getBody().getData().getStatus());

        // 9. Worker submits an Application
        ApplicationCreateRequest appReq = new ApplicationCreateRequest();
        appReq.setGigId(gigId);
        appReq.setWorkerProfileId(workerProfileId);
        appReq.setQuotedPrice(new BigDecimal("550.00"));
        appReq.setCoverNote("5 years certified AC technician. Available immediately.");

        ResponseEntity<ApiResponse<ApplicationResponse>> appResp = applicationController.applyForGig(appReq);
        assertNotNull(appResp.getBody());
        assertTrue(appResp.getBody().isSuccess());
        UUID applicationId = appResp.getBody().getData().getId();
        assertEquals(ApplicationStatus.PENDING, appResp.getBody().getData().getStatus());

        // 10. Provider accepts Application -> creates Booking
        ResponseEntity<ApiResponse<BookingResponse>> bookingResp = bookingController.acceptApplication(applicationId);
        assertNotNull(bookingResp.getBody());
        assertTrue(bookingResp.getBody().isSuccess());
        BookingResponse booking = bookingResp.getBody().getData();
        UUID bookingId = booking.getId();
        assertEquals(BookingStatus.SCHEDULED, booking.getStatus());
        assertEquals(new BigDecimal("550.00"), booking.getAgreedPrice());

        // Verify Gig status changed to ASSIGNED
        ResponseEntity<ApiResponse<GigResponse>> gigUpdated = gigController.getGigById(gigId);
        assertEquals(GigStatus.ASSIGNED, gigUpdated.getBody().getData().getStatus());

        // 11. In-Gig Chat Message
        MessageCreateRequest msgReq = new MessageCreateRequest();
        msgReq.setGigId(gigId);
        msgReq.setSenderId(providerUserId);
        msgReq.setReceiverId(workerUserId);
        msgReq.setBody("Hello Charlie, please bring the gas refilling kit.");

        ResponseEntity<ApiResponse<MessageResponse>> msgResp = messageController.sendMessage(msgReq);
        assertNotNull(msgResp.getBody());
        assertTrue(msgResp.getBody().isSuccess());
        assertEquals(msgReq.getBody(), msgResp.getBody().getData().getBody());

        // 12. Move Booking Status: SCHEDULED -> IN_PROGRESS -> COMPLETED
        BookingStatusUpdateRequest progressReq = new BookingStatusUpdateRequest();
        progressReq.setStatus(BookingStatus.IN_PROGRESS);
        bookingController.updateBookingStatus(bookingId, progressReq);

        BookingStatusUpdateRequest completeReq = new BookingStatusUpdateRequest();
        completeReq.setStatus(BookingStatus.COMPLETED);
        ResponseEntity<ApiResponse<BookingResponse>> compResp = bookingController.updateBookingStatus(bookingId, completeReq);
        assertEquals(BookingStatus.COMPLETED, compResp.getBody().getData().getStatus());

        // 13. Process Payment (with 10% platform fee)
        PaymentCreateRequest payReq = new PaymentCreateRequest();
        payReq.setBookingId(bookingId);
        payReq.setAmount(new BigDecimal("550.00"));
        payReq.setMethod(PaymentMethod.UPI);

        ResponseEntity<ApiResponse<PaymentResponse>> payResp = paymentController.processPayment(payReq);
        assertNotNull(payResp.getBody());
        assertTrue(payResp.getBody().isSuccess());
        PaymentResponse payment = payResp.getBody().getData();
        assertEquals(PaymentStatus.PAID, payment.getStatus());
        assertEquals(new BigDecimal("55.00"), payment.getPlatformFee());
        assertEquals(new BigDecimal("495.00"), payment.getNetWorkerAmount());

        // 14. Provider leaves 5-Star Review for Worker
        ReviewCreateRequest reviewReq = new ReviewCreateRequest();
        reviewReq.setBookingId(bookingId);
        reviewReq.setReviewerId(providerUserId);
        reviewReq.setRating(5);
        reviewReq.setComment("Prompt and clean work! Highly recommended.");

        ResponseEntity<ApiResponse<ReviewResponse>> revResp = reviewController.createReview(reviewReq);
        assertNotNull(revResp.getBody());
        assertTrue(revResp.getBody().isSuccess());
        assertEquals(5, revResp.getBody().getData().getRating());

        // 15. Verify Worker's Average Rating dynamically updated to 5.0
        ResponseEntity<ApiResponse<WorkerProfileResponse>> workerAfterReview =
                workerProfileController.getProfileById(workerProfileId);
        assertNotNull(workerAfterReview.getBody());
        assertEquals(5.0f, workerAfterReview.getBody().getData().getAvgRating());
    }
}
