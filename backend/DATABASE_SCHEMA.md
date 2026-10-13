# GigMart MySQL Database Schema Reference

**Database Name**: `gigmart_db`  
**Character Set**: `utf8mb4`  
**Collation**: `utf8mb4_unicode_ci`  
**ORM / DDL Generation**: Hibernate 7 (`spring.jpa.hibernate.ddl-auto=update`)

---

## 1. Table Definitions

### 1. `users`
Identity and core authentication table.
- `id` (BINARY(16) / UUID, PK)
- `full_name` (VARCHAR(255), NOT NULL)
- `email` (VARCHAR(255), NOT NULL, UNIQUE, Index: `idx_users_email`)
- `phone` (VARCHAR(255), NOT NULL, UNIQUE, Index: `idx_users_phone`)
- `password_hash` (VARCHAR(255), NOT NULL)
- `role` (VARCHAR(20), NOT NULL) - Enum: `WORKER`, `PROVIDER`, `ADMIN`
- `is_verified` (BIT(1), NOT NULL, DEFAULT 0)
- `created_at` (DATETIME(6) / TIMESTAMP, NOT NULL)

### 2. `worker_profiles`
Worker details and ratings.
- `id` (BINARY(16) / UUID, PK)
- `user_id` (BINARY(16) / UUID, NOT NULL, UNIQUE, FK -> `users.id`)
- `bio` (TEXT)
- `experience_years` (INT, DEFAULT 0)
- `verification_status` (VARCHAR(20), NOT NULL) - Enum: `PENDING`, `VERIFIED`, `REJECTED`
- `avg_rating` (FLOAT, NOT NULL, DEFAULT 0.0)
- `service_radius_km` (INT, DEFAULT 10)

### 3. `provider_profiles`
Provider details.
- `id` (BINARY(16) / UUID, PK)
- `user_id` (BINARY(16) / UUID, NOT NULL, UNIQUE, FK -> `users.id`)
- `provider_type` (VARCHAR(20), NOT NULL) - Enum: `INDIVIDUAL`, `BUSINESS`
- `business_name` (VARCHAR(255))
- `avg_rating` (FLOAT, NOT NULL, DEFAULT 0.0)

### 4. `addresses`
Saved physical locations with coordinates.
- `id` (BINARY(16) / UUID, PK)
- `user_id` (BINARY(16) / UUID, NOT NULL, FK -> `users.id`)
- `line1` (VARCHAR(255), NOT NULL)
- `city` (VARCHAR(255), NOT NULL)
- `pincode` (VARCHAR(255), NOT NULL)
- `latitude` (FLOAT)
- `longitude` (FLOAT)
- Index: `idx_addresses_coordinates (latitude, longitude)`

### 5. `service_categories`
Master categories of services (e.g., AC Technician, Plumber).
- `id` (BINARY(16) / UUID, PK)
- `name` (VARCHAR(255), NOT NULL, UNIQUE, Index: `idx_category_name`)
- `icon` (VARCHAR(255))
- `is_active` (BIT(1), NOT NULL, DEFAULT 1)

### 6. `worker_services`
Join table connecting workers to services offered.
- `id` (BINARY(16) / UUID, PK)
- `worker_id` (BINARY(16) / UUID, NOT NULL, FK -> `worker_profiles.id`)
- `category_id` (BINARY(16) / UUID, NOT NULL, FK -> `service_categories.id`)
- `base_rate` (DECIMAL(10,2), NOT NULL)
- `rate_type` (VARCHAR(20), NOT NULL) - Enum: `HOURLY`, `FIXED`
- Constraint: `uk_worker_category UNIQUE (worker_id, category_id)`

### 7. `worker_documents`
Uploaded verification documents.
- `id` (BINARY(16) / UUID, PK)
- `worker_id` (BINARY(16) / UUID, NOT NULL, FK -> `worker_profiles.id`)
- `doc_type` (VARCHAR(255), NOT NULL)
- `file_url` (VARCHAR(255), NOT NULL)
- `status` (VARCHAR(20), NOT NULL) - Enum: `PENDING`, `APPROVED`, `REJECTED`

### 8. `availability_slots`
Weekly schedule for workers.
- `id` (BINARY(16) / UUID, PK)
- `worker_id` (BINARY(16) / UUID, NOT NULL, FK -> `worker_profiles.id`)
- `day_of_week` (INT, NOT NULL, 1 to 7)
- `start_time` (TIME, NOT NULL)
- `end_time` (TIME, NOT NULL)

### 9. `gigs`
Jobs posted by providers.
- `id` (BINARY(16) / UUID, PK)
- `provider_id` (BINARY(16) / UUID, NOT NULL, FK -> `provider_profiles.id`)
- `category_id` (BINARY(16) / UUID, NOT NULL, FK -> `service_categories.id`)
- `address_id` (BINARY(16) / UUID, NOT NULL, FK -> `addresses.id`)
- `title` (VARCHAR(255), NOT NULL)
- `description` (TEXT)
- `budget` (DECIMAL(10,2), NOT NULL)
- `scheduled_at` (DATETIME(6), NOT NULL)
- `status` (VARCHAR(20), NOT NULL) - Enum: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- Indexes: `idx_gigs_category_status (category_id, status)`, `idx_gigs_scheduled_at (scheduled_at)`

### 10. `applications`
Worker bids on gigs.
- `id` (BINARY(16) / UUID, PK)
- `gig_id` (BINARY(16) / UUID, NOT NULL, FK -> `gigs.id`)
- `worker_id` (BINARY(16) / UUID, NOT NULL, FK -> `worker_profiles.id`)
- `quoted_price` (DECIMAL(10,2), NOT NULL)
- `cover_note` (TEXT)
- `status` (VARCHAR(20), NOT NULL) - Enum: `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`
- `created_at` (DATETIME(6), NOT NULL)
- Constraint: `uk_gig_worker_application UNIQUE (gig_id, worker_id)`

### 11. `bookings`
Confirmed jobs created when an application is accepted.
- `id` (BINARY(16) / UUID, PK)
- `gig_id` (BINARY(16) / UUID, NOT NULL, UNIQUE, FK -> `gigs.id`, Constraint: `uk_booking_gig`)
- `application_id` (BINARY(16) / UUID, NOT NULL, UNIQUE, FK -> `applications.id`, Constraint: `uk_booking_application`)
- `agreed_price` (DECIMAL(10,2), NOT NULL)
- `started_at` (DATETIME(6))
- `completed_at` (DATETIME(6))
- `status` (VARCHAR(20), NOT NULL) - Enum: `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

### 12. `payments`
Transactions associated with a booking.
- `id` (BINARY(16) / UUID, PK)
- `booking_id` (BINARY(16) / UUID, NOT NULL, FK -> `bookings.id`)
- `amount` (DECIMAL(10,2), NOT NULL)
- `platform_fee` (DECIMAL(10,2), NOT NULL)
- `method` (VARCHAR(30), NOT NULL) - Enum: `CARD`, `UPI`, `BANK_TRANSFER`, `CASH`, `WALLET`
- `status` (VARCHAR(20), NOT NULL) - Enum: `PENDING`, `PAID`, `FAILED`, `REFUNDED`
- `paid_at` (DATETIME(6))

### 13. `reviews`
Mutual ratings between provider and worker.
- `id` (BINARY(16) / UUID, PK)
- `booking_id` (BINARY(16) / UUID, NOT NULL, FK -> `bookings.id`)
- `reviewer_id` (BINARY(16) / UUID, NOT NULL, FK -> `users.id`)
- `reviewee_id` (BINARY(16) / UUID, NOT NULL, FK -> `users.id`)
- `rating` (INT, NOT NULL, CHECK rating BETWEEN 1 AND 5)
- `comment` (TEXT)
- `created_at` (DATETIME(6), NOT NULL)
- Constraint: `uk_booking_reviewer UNIQUE (booking_id, reviewer_id)`

### 14. `messages`
Chat messages scoped to a gig.
- `id` (BINARY(16) / UUID, PK)
- `gig_id` (BINARY(16) / UUID, NOT NULL, FK -> `gigs.id`)
- `sender_id` (BINARY(16) / UUID, NOT NULL, FK -> `users.id`)
- `receiver_id` (BINARY(16) / UUID, NOT NULL, FK -> `users.id`)
- `body` (TEXT, NOT NULL)
- `sent_at` (DATETIME(6), NOT NULL)
- Index: `idx_messages_gig_sent_at (gig_id, sent_at)`

---

## 2. Complete DDL Script (MySQL)

```sql
CREATE DATABASE IF NOT EXISTS gigmart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gigmart_db;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id BINARY(16) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_verified BIT(1) NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY idx_users_email (email),
    UNIQUE KEY idx_users_phone (phone)
) ENGINE=InnoDB;

-- 2. worker_profiles
CREATE TABLE IF NOT EXISTS worker_profiles (
    id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    bio TEXT,
    experience_years INT DEFAULT 0,
    verification_status VARCHAR(20) NOT NULL,
    avg_rating FLOAT NOT NULL DEFAULT 0.0,
    service_radius_km INT DEFAULT 10,
    PRIMARY KEY (id),
    UNIQUE KEY uk_worker_user (user_id),
    CONSTRAINT fk_worker_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. provider_profiles
CREATE TABLE IF NOT EXISTS provider_profiles (
    id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    provider_type VARCHAR(20) NOT NULL,
    business_name VARCHAR(255),
    avg_rating FLOAT NOT NULL DEFAULT 0.0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_provider_user (user_id),
    CONSTRAINT fk_provider_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. addresses
CREATE TABLE IF NOT EXISTS addresses (
    id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    line1 VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    pincode VARCHAR(255) NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    PRIMARY KEY (id),
    KEY idx_addresses_coordinates (latitude, longitude),
    CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. service_categories
CREATE TABLE IF NOT EXISTS service_categories (
    id BINARY(16) NOT NULL,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    is_active BIT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY idx_category_name (name)
) ENGINE=InnoDB;

-- 6. worker_services
CREATE TABLE IF NOT EXISTS worker_services (
    id BINARY(16) NOT NULL,
    worker_id BINARY(16) NOT NULL,
    category_id BINARY(16) NOT NULL,
    base_rate DECIMAL(10,2) NOT NULL,
    rate_type VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_worker_category (worker_id, category_id),
    CONSTRAINT fk_ws_worker FOREIGN KEY (worker_id) REFERENCES worker_profiles (id) ON DELETE CASCADE,
    CONSTRAINT fk_ws_category FOREIGN KEY (category_id) REFERENCES service_categories (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. worker_documents
CREATE TABLE IF NOT EXISTS worker_documents (
    id BINARY(16) NOT NULL,
    worker_id BINARY(16) NOT NULL,
    doc_type VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_doc_worker FOREIGN KEY (worker_id) REFERENCES worker_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. availability_slots
CREATE TABLE IF NOT EXISTS availability_slots (
    id BINARY(16) NOT NULL,
    worker_id BINARY(16) NOT NULL,
    day_of_week INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_slot_worker FOREIGN KEY (worker_id) REFERENCES worker_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. gigs
CREATE TABLE IF NOT EXISTS gigs (
    id BINARY(16) NOT NULL,
    provider_id BINARY(16) NOT NULL,
    category_id BINARY(16) NOT NULL,
    address_id BINARY(16) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    budget DECIMAL(10,2) NOT NULL,
    scheduled_at DATETIME(6) NOT NULL,
    status VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_gigs_category_status (category_id, status),
    KEY idx_gigs_scheduled_at (scheduled_at),
    CONSTRAINT fk_gig_provider FOREIGN KEY (provider_id) REFERENCES provider_profiles (id),
    CONSTRAINT fk_gig_category FOREIGN KEY (category_id) REFERENCES service_categories (id),
    CONSTRAINT fk_gig_address FOREIGN KEY (address_id) REFERENCES addresses (id)
) ENGINE=InnoDB;

-- 10. applications
CREATE TABLE IF NOT EXISTS applications (
    id BINARY(16) NOT NULL,
    gig_id BINARY(16) NOT NULL,
    worker_id BINARY(16) NOT NULL,
    quoted_price DECIMAL(10,2) NOT NULL,
    cover_note TEXT,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_gig_worker_application (gig_id, worker_id),
    CONSTRAINT fk_app_gig FOREIGN KEY (gig_id) REFERENCES gigs (id) ON DELETE CASCADE,
    CONSTRAINT fk_app_worker FOREIGN KEY (worker_id) REFERENCES worker_profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. bookings
CREATE TABLE IF NOT EXISTS bookings (
    id BINARY(16) NOT NULL,
    gig_id BINARY(16) NOT NULL,
    application_id BINARY(16) NOT NULL,
    agreed_price DECIMAL(10,2) NOT NULL,
    started_at DATETIME(6),
    completed_at DATETIME(6),
    status VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_booking_gig (gig_id),
    UNIQUE KEY uk_booking_application (application_id),
    CONSTRAINT fk_booking_gig FOREIGN KEY (gig_id) REFERENCES gigs (id),
    CONSTRAINT fk_booking_application FOREIGN KEY (application_id) REFERENCES applications (id)
) ENGINE=InnoDB;

-- 12. payments
CREATE TABLE IF NOT EXISTS payments (
    id BINARY(16) NOT NULL,
    booking_id BINARY(16) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    method VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    paid_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
) ENGINE=InnoDB;

-- 13. reviews
CREATE TABLE IF NOT EXISTS reviews (
    id BINARY(16) NOT NULL,
    booking_id BINARY(16) NOT NULL,
    reviewer_id BINARY(16) NOT NULL,
    reviewee_id BINARY(16) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_booking_reviewer (booking_id, reviewer_id),
    CONSTRAINT fk_review_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users (id),
    CONSTRAINT fk_review_reviewee FOREIGN KEY (reviewee_id) REFERENCES users (id)
) ENGINE=InnoDB;

-- 14. messages
CREATE TABLE IF NOT EXISTS messages (
    id BINARY(16) NOT NULL,
    gig_id BINARY(16) NOT NULL,
    sender_id BINARY(16) NOT NULL,
    receiver_id BINARY(16) NOT NULL,
    body TEXT NOT NULL,
    sent_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_messages_gig_sent_at (gig_id, sent_at),
    CONSTRAINT fk_msg_gig FOREIGN KEY (gig_id) REFERENCES gigs (id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users (id),
    CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_id) REFERENCES users (id)
) ENGINE=InnoDB;
```
