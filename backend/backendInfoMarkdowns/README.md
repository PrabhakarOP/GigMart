# GigMart - On-Demand Gig Marketplace Platform

GigMart is a full-featured on-demand gig marketplace backend built with **Spring Boot 4 / Java 23** and **MySQL**. It connects **gig providers** (homeowners, individuals, and businesses who post jobs) with skilled **gig workers** (AC technicians, plumbers, electricians, carpenters, gardeners, etc.) who bid on jobs, execute work, receive payouts, and exchange ratings.

---

## 🌟 Key Features

- **Multi-Role Authentication & User Management**: Workers, Providers, and Admins with secure SHA-256 hashed credentials and verification flags.
- **Worker Profiles & Skills Catalog**: Profiles with bio, experience, verification status, service radius, and hourly/fixed rates per service category.
- **Provider Profiles & Addresses**: Individual or business accounts with saved multi-address locations and GPS coordinates.
- **Service Categories Master Catalog**: Admin-managed active categories with iconography.
- **Job / Gig Lifecycle**: Post gigs with budget, category, location, and schedule. State machine: `OPEN` -> `ASSIGNED` -> `IN_PROGRESS` -> `COMPLETED` / `CANCELLED`.
- **Worker Applications & Bidding**: Quotes and cover notes. Prevents duplicate bidding per gig.
- **Booking State Machine**: Accepting a bid auto-confirms a Booking, assigns the Gig, accepts the winning application, and rejects competing bids. Tracks `started_at` and `completed_at`.
- **Payment Processing**: Multi-method payments (UPI, Card, Bank Transfer, Cash, Wallet) with automatic platform fee calculation (10%) and net payout tracking.
- **Two-Way Verified Reviews & Dynamic Rating Aggregation**: Mutual reviews between provider and worker upon completion with automatic recalculation and persistence of average ratings (`avg_rating`).
- **In-Gig Messaging / Chat**: Scoped communications between provider and worker for each gig.
- **Pre-Seeded Demo Data**: Out-of-the-box categories, admin account, demo provider, and demo worker for instant testing.

---

## 🏗️ Technology Stack

- **Java**: 23 / 21+
- **Framework**: Spring Boot 4.1.1 (Spring Framework 7)
- **Persistence**: Spring Data JPA, Hibernate ORM 7
- **Database**: MySQL 8.0+ / MariaDB (XAMPP or standalone)
- **Validation**: Jakarta Bean Validation (`hibernate-validator`)
- **Connection Pooling**: HikariCP
- **Testing**: JUnit 5, Spring Boot Test, Spring MVC Test
- **Build Tool**: Apache Maven 3.9+

---

## 📁 Project Architecture

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/gigsphere/gigmart/
│   │   │   ├── config/              # WebMvcConfig (CORS), DataInitializer (Seeder)
│   │   │   ├── controller/          # 11 REST Controllers under /api/v1/
│   │   │   ├── dto/                 # Request & Response DTOs + ApiResponse<T>
│   │   │   ├── entity/              # 14 JPA Entities matching the ERD
│   │   │   ├── enums/               # 10 Domain Enums (UserRole, GigStatus, etc.)
│   │   │   ├── exception/           # Custom Exceptions & GlobalExceptionHandler
│   │   │   ├── repository/          # 14 Spring Data JPA Repositories
│   │   │   ├── service/             # 12 Business Service Implementations
│   │   │   └── GigmartApplication.java
│   │   └── resources/
│   │       └── application.properties # Datasource & JPA configuration
│   └── test/
│       └── java/com/gigsphere/gigmart/
│           ├── GigmartApplicationTests.java
│           └── GigPlatformFlowIntegrationTest.java # Full 15-step integration suite
├── gig_platform_erd.md              # Original ERD diagram & specifications
├── ARCHITECTURE.md                  # Deep architectural design and state machines
├── API_DOCUMENTATION.md             # Complete REST API reference & cURL examples
├── DATABASE_SCHEMA.md               # DDL, indexes, constraints & entity mappings
├── AGENTS.md                        # AI Agent development playbook & guidelines
└── pom.xml                          # Maven build dependencies
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Java 21 or 23** (`java -version`)
- **Maven 3.9+** (`mvn -version`)
- **MySQL Server** running on `localhost:3306` (e.g., via XAMPP MySQL or standalone MySQL)

### 2. Database Setup
The application connects to `gigmart_db` by default and has auto-creation enabled in `application.properties`:
```sql
CREATE DATABASE IF NOT EXISTS gigmart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Database credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/gigmart_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=
server.port=8081
```

### 3. Build & Run
Run with Maven:
```bash
# Compile and run test suite
mvn clean test

# Run the Spring Boot application
mvn spring-boot:run
```
The server will start on **http://localhost:8081**.

---

## 🔑 Pre-Seeded Accounts

When the application boots for the first time, `DataInitializer` seeds:

| Role | Name | Email | Password | Phone |
|---|---|---|---|---|
| **ADMIN** | Platform Admin | `admin@gigmart.com` | `admin123` | `+10000000001` |
| **PROVIDER** | John Provider | `provider@gigmart.com` | `provider123` | `+10000000002` |
| **WORKER** | Alex Worker | `worker@gigmart.com` | `worker123` | `+10000000003` |

### Default Service Categories Seeded:
- AC Technician
- Plumber
- Electrician
- Gardener
- Carpenter
- House Cleaner
- Painter
- Appliance Repair

---

## 🧪 Running Integration Tests

Run the full end-to-end integration test covering all 14 entities and the complete 5-step core flow:
```bash
mvn test -Dtest=GigPlatformFlowIntegrationTest
```

---

## 📚 Further Documentation

- [ARCHITECTURE.md](file:///c:/Users/Prabhakar/Desktop/backend/ARCHITECTURE.md) - Deep dive into domain design, state machines, and calculations.
- [API_DOCUMENTATION.md](file:///c:/Users/Prabhakar/Desktop/backend/API_DOCUMENTATION.md) - Full endpoint catalog with schemas, parameters, and cURLs.
- [DATABASE_SCHEMA.md](file:///c:/Users/Prabhakar/Desktop/backend/DATABASE_SCHEMA.md) - MySQL DDL, foreign keys, constraints, and indexes.
- [AGENTS.md](file:///c:/Users/Prabhakar/Desktop/backend/AGENTS.md) - Playbook for AI agents and developers extending this codebase.
