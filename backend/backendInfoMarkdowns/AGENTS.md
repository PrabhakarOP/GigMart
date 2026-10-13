# AI Agent & Developer Guidelines: GigMart Backend

> **Audience**: AI Agents (DeepMind Antigravity, Copilot, Claude, Cursor) and Human Engineers contributing to this repository.  
> **Mission**: Maintain architecture integrity, adhere to domain rules, and extend the platform safely without regression.

---

## 1. Quick Project Context

- **Domain**: On-demand gig marketplace connecting **Service Providers** (customers posting jobs) with **Gig Workers** (technicians, gardeners, plumbers).
- **Core Entities**: 14 JPA entities mapped to MySQL (`gigmart_db`).
- **Core Flow**:
  1. Provider posts a **Gig**.
  2. Workers submit **Applications** (quotes).
  3. Provider accepts one application -> automatically creates a confirmed **Booking**, sets Gig to `ASSIGNED`, and rejects other pending bids.
  4. Booking transitions: `SCHEDULED` -> `IN_PROGRESS` -> `COMPLETED`.
  5. **Payment** is processed with a 10% platform fee calculation.
  6. Mutual **Review** is posted, dynamically recalculating the reviewee's `avg_rating`.
  7. **Messages** provide in-gig chat between provider and worker.

---

## 2. Technical Stack & Environment

- **Java Version**: 21+ (Running on JDK 23.0.1)
- **Framework**: Spring Boot 4.1.1 (Spring Framework 7)
- **Database**: MySQL on `localhost:3306` (`gigmart_db`), user `root`, empty password.
- **Port**: Default application port is `8081`.
- **Build Tool**: Apache Maven (`mvn`).

---

## 3. Critical Architectural Invariants (DO NOT BREAK)

When generating code or refactoring, you **must adhere to these invariants**:

### Invariant 1: DTO Isolation & Response Envelope
- **Never expose JPA Entities directly in REST Controllers**.
- Always accept Request DTOs (annotated with `@Valid` and Jakarta validation annotations).
- Always return `ResponseEntity<ApiResponse<T>>` with appropriate HTTP status codes (`200 OK`, `201 CREATED`, `400 BAD_REQUEST`, `404 NOT_FOUND`, `409 CONFLICT`).

### Invariant 2: Booking Uniqueness (1 Booking Per Gig)
- A Gig can have **at most one** confirmed Booking (`uk_booking_gig`).
- Only an application in `PENDING` state on an `OPEN` gig can be accepted.
- When an application is accepted, the Service layer must atomically:
  1. Mark the chosen application as `ACCEPTED`.
  2. Reject all other pending applications for that gig as `REJECTED`.
  3. Mark the gig as `ASSIGNED`.
  4. Create the `Booking` with `status = SCHEDULED` and `agreedPrice = application.quotedPrice`.

### Invariant 3: Dynamic Rating Recalculation
- Whenever a review is submitted in `ReviewService`, query the database for the average of all reviews received by the `reviewee` user.
- Update `avgRating` on `WorkerProfile` or `ProviderProfile` within the same transaction.

### Invariant 4: Password Security
- Never store raw passwords.
- Passwords are hashed using SHA-256 before saving to `users.password_hash`.
- `User.passwordHash` is annotated with `@JsonIgnore` and is never exposed in any DTO.

### Invariant 5: Unique Constraints
- `users`: unique on `email` and `phone`.
- `applications`: unique on `(gig_id, worker_id)` (a worker cannot apply more than once to the same gig).
- `worker_services`: unique on `(worker_id, category_id)` (a worker cannot add duplicate service categories).
- `reviews`: unique on `(booking_id, reviewer_id)` (one review per participant per booking).

---

## 4. How to Extend the Codebase

### Step 1: Adding a New Entity
1. Define the entity under `com.gigsphere.gigmart.entity.*`.
2. Use `@Entity`, `@Table`, and explicit `@Index` or `@UniqueConstraint` annotations.
3. Use `UUID` as the primary key with `@GeneratedValue(strategy = GenerationType.UUID)`.
4. Avoid eager fetching on `@ManyToOne` / `@OneToOne` associations; use `fetch = FetchType.LAZY`.

### Step 2: Adding a Repository
1. Create an interface in `com.gigsphere.gigmart.repository.*` extending `JpaRepository<Entity, UUID>`.
2. Add Spring Data method queries or `@Query` with named `@Param` parameters.

### Step 3: Creating DTOs
1. Create Request and Response DTOs under `com.gigsphere.gigmart.dto.*`.
2. Include Jakarta validation (`@NotBlank`, `@NotNull`, `@Min`, `@DecimalMin`, etc.).
3. If formatting timestamps or local times, use `@JsonFormat(pattern = "...")`.

### Step 4: Implementing Service Logic
1. Create a `@Service` class under `com.gigsphere.gigmart.service.*`.
2. Annotate modifying methods with `@Transactional` and read methods with `@Transactional(readOnly = true)`.
3. Throw `ResourceNotFoundException`, `BadRequestException`, or `ConflictException` for domain errors; `GlobalExceptionHandler` will automatically format them into clean JSON error responses.

### Step 5: Exposing REST Endpoints
1. Create `@RestController` under `com.gigsphere.gigmart.controller.*` mapped to `/api/v1/{resource}`.
2. Inject services via constructor injection.
3. Return `ApiResponse.ok(data)` or `ApiResponse.ok(data, "message")`.

---

## 5. Testing & Validation Commands

Always run the full test suite before finishing any task:
```bash
# Run all unit and integration tests
mvn clean test

# Run the full end-to-end marketplace integration test specifically
mvn test -Dtest=GigPlatformFlowIntegrationTest
```

Expected output:
```
[INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 6. Common Gotchas

1. **MySQL Daemon**: If tests fail with connection refused on `localhost:3306`, check if XAMPP MySQL is running:
   ```powershell
   Get-Service mysql
   # Or launch from D:\xampp\mysql\bin\mysqld.exe
   ```
2. **Spring Boot 4 / Jackson 3**: In this environment, Spring Boot 4 is used with Java 23. Jackson 3 packages use `tools.jackson.core` and `tools.jackson.databind`. DTO mappings and standard Jackson annotations work seamlessly.
3. **Database Dialect Warning**: A benign warning about MySQL 5.5.5 legacy version may appear during Hibernate bootstrap if MariaDB/XAMPP defaults report `5.5.5-10.4.x`. It does not affect functionality or schema generation.
