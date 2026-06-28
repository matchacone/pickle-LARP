# Normalized Database Schema: Court Booking System

### Table: `user`
Stores registered user accounts and their roles.

| Column Name | Data Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| **userID** | SERIAL | **PK**, NOT NULL | Unique identifier for the user. |
| **username** | VARCHAR(50) | NOT NULL, UNIQUE | |
| **email** | VARCHAR(100) | NOT NULL, UNIQUE | |
| **password** | VARCHAR(256) | NOT NULL | Store as a hashed value. |
| **role** | VARCHAR(20) | NOT NULL | Default: 'user' (e.g., 'admin', 'user'). |

---

### Table: `court`
Stores details about the individual courts available for booking. *(Note: The `items` column has been removed for normalization).*

| Column Name | Data Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| **courtID** | SERIAL | **PK**, NOT NULL | Unique identifier for the court. |
| **courtName** | VARCHAR(100) | NOT NULL, UNIQUE | |
| **description** | VARCHAR(500) | NULL | |
| **location** | VARCHAR(255) | NULL | City/barangay text (e.g. 'BGC, Taguig'). Phase 2: GPS. |
| **price_per_hour** | DECIMAL(10,2) | NULL | Rental rate in PHP per hour. |
| **court_type** | VARCHAR(20) | NULL, CHECK IN ('indoor','outdoor') | Court surface/environment type. |

---

### Table: `item`
*(New)* Lookup table storing all possible equipment or amenities.

| Column Name | Data Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| **itemID** | SERIAL | **PK**, NOT NULL | Unique identifier for the item. |
| **itemName** | VARCHAR(100) | NOT NULL, UNIQUE | e.g., 'Basketball', 'Electronic Scoreboard'. |

---

### Table: `court_item`
*(New)* Junction table linking courts to their specific items (Many-to-Many).

| Column Name | Data Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| **courtID** | INTEGER | **PK, FK**, NOT NULL | References `court(courtID)`. |
| **itemID** | INTEGER | **PK, FK**, NOT NULL | References `item(itemID)`. |

> **Note:** `courtID` and `itemID` act as a **Composite Primary Key** together, ensuring the same item isn't linked to the same court twice.

---

### Table: `invoice`
Stores booking details and payment transactions linking a user to a court.

| Column Name | Data Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| **invoiceID** | SERIAL | **PK**, NOT NULL | Unique identifier for the invoice. |
| **payment_method** | VARCHAR(50) | NOT NULL | e.g., 'Credit Card', 'Cash'. |
| **payment_total** | DECIMAL(10,2) | NOT NULL | Snapshot of the price paid. |
| **booking_date** | DATE | NOT NULL | The date the court is reserved for. |
| **start_time** | TIME | NOT NULL | |
| **end_time** | TIME | NOT NULL | |
| **userID** | INTEGER | **FK**, NOT NULL | References `user(userID)`. |
| **courtID** | INTEGER | **FK**, NOT NULL | References `court(courtID)`. |

---

### Table: `reviews`
Stores user-generated reviews for specific courts.

| Column Name | Data Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| **reviewID** | SERIAL | **PK**, NOT NULL | Unique identifier for the review. |
| **title** | VARCHAR(100) | NULL | |
| **description** | VARCHAR(500) | NOT NULL | Body of the review. |
| **userID** | INTEGER | **FK**, NOT NULL | References `user(userID)`. |
| **courtID** | INTEGER | **FK**, NOT NULL | References `court(courtID)`. |