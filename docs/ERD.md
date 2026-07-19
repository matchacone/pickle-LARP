# Pickle All - Entity Relationship Diagram (ERD)

This document outlines the Entity Relationship Diagram (ERD) for the Pickle All database schema, mapping out the connections between our entities.

## Mermaid ER Diagram

```mermaid
erDiagram
    %% Entities
    AUTH_USERS {
        uuid id PK
    }
    
    PROFILES {
        uuid id PK "FK to auth.users.id"
        string username
        string role
        datetime suspended_at
    }

    COURT {
        uuid id PK
        string court_name
        string description
        string location
        numeric price_per_hour
        string court_type
        string status
        uuid owner_id FK "References profiles.id"
    }

    COURT_OPERATING_HOURS {
        uuid id PK
        uuid court_id FK
        int day_of_week
        time open_time
        time close_time
        boolean is_open
    }

    COURT_CLOSED_DATES {
        uuid id PK
        uuid court_id FK
        date closed_date
        string reason
    }

    ITEM {
        uuid id PK
        string item_name
    }

    COURT_ITEM {
        uuid court_id PK, FK
        uuid item_id PK, FK
    }

    BOOKING {
        uuid id PK
        uuid user_id FK "References profiles.id"
        uuid court_id FK
        datetime start_at
        datetime end_at
        string status
    }

    INVOICE {
        uuid id PK
        uuid booking_id FK
        string payment_method
        numeric payment_total
        string status
    }

    REVIEWS {
        uuid id PK
        uuid user_id FK "References profiles.id"
        uuid court_id FK
        string title
        string description
    }

    %% Relationships
    AUTH_USERS ||--|| PROFILES : "1:1 Extension"
    PROFILES ||--o{ COURT : "1:M Owns (Role: owner)"
    COURT ||--o{ COURT_OPERATING_HOURS : "1:M Has"
    COURT ||--o{ COURT_CLOSED_DATES : "1:M Has"
    
    %% Many-to-Many between Court and Item via Court_Item
    COURT ||--o{ COURT_ITEM : "1:M Includes"
    ITEM ||--o{ COURT_ITEM : "1:M Included in"
    
    PROFILES ||--o{ BOOKING : "1:M Makes (Role: user)"
    COURT ||--o{ BOOKING : "1:M Booked for"
    
    BOOKING ||--o{ INVOICE : "1:M Paid via (Conceptual 1:1 or 1:M)"
    
    PROFILES ||--o{ REVIEWS : "1:M Writes"
    COURT ||--o{ REVIEWS : "1:M Receives"
```

## Entity Relationships Explained

### One-to-One (1:1)
- **`auth.users` ↔ `profiles`**: Every Supabase auth user has exactly one corresponding profile. The `id` in the `profiles` table acts as both the Primary Key and a Foreign Key linking directly to `auth.users.id`.

### One-to-Many (1:M)
- **`profiles` (Owner) ↔ `court`**: A single business owner can own multiple courts, but each court is owned by only one owner (via `owner_id`).
- **`court` ↔ `court_operating_hours`**: A single court can have multiple operating hour records (one for each day of the week).
- **`court` ↔ `court_closed_dates`**: A single court can have multiple specific closed dates (e.g., holidays, maintenance).
- **`profiles` (User) ↔ `booking`**: A customer can make many bookings over time.
- **`court` ↔ `booking`**: A court will have many bookings linked to it.
- **`booking` ↔ `invoice`**: A booking can have an invoice (or potentially multiple invoices if partial payments or refunds are handled on separate records).
- **`profiles` (User) ↔ `reviews`**: A user can write many reviews across different courts.
- **`court` ↔ `reviews`**: A court can receive many reviews from different users.

### Many-to-Many (M:N)
- **`court` ↔ `item`**: A court can have multiple items/amenities (e.g., Paddles, Balls), and a specific item type can belong to multiple courts.
  - This is resolved via the junction table **`court_item`**.
  - **`court` ↔ `court_item`** is One-to-Many.
  - **`item` ↔ `court_item`** is One-to-Many.
