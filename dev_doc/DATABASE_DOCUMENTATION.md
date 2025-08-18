# Logistics Platform Database Documentation

## Overview

This document provides a comprehensive guide to the Logistics Platform database schema. The database supports a full-featured logistics platform with multi-role user management, cargo tracking, route optimization, financial management, and insurance handling.

## Database Architecture

- **PostgreSQL** with UUID primary keys
- **Foreign Key Constraints** with CASCADE deletion
- **ENUM Types** for status and category fields
- **JSON Fields** for flexible data storage
- **Automatic Timestamps** for audit trails
- **Performance Indexes** for optimized queries

## Core Tables

### 1. User Management

#### Users Table
Core user authentication and profile management for all platform roles.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash TEXT NOT NULL,
    role ENUM('client', 'driver', 'admin', 'super_admin') NOT NULL,
    preferred_language ENUM('en', 'rw', 'fr') DEFAULT 'en',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features**:
- Multi-role support (client, driver, admin, super_admin)
- Multi-language preference
- Account verification status
- Last login tracking

#### Authentication Tables
- **user_sessions**: Manage active user sessions
- **password_reset_tokens**: Secure password reset functionality
- **email_verification_tokens**: Email verification system

### 2. Client Management

#### Clients Table
Extended business information for client users.

```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(100),
    business_type ENUM('individual', 'corporate', 'government') DEFAULT 'individual',
    tax_id VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    contact_person VARCHAR(100),
    credit_limit DECIMAL(12,2) DEFAULT 0,
    payment_terms INT DEFAULT 30, -- days
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features**:
- Business type classification
- Credit limit management
- Payment terms configuration
- Tax ID for compliance

### 3. Driver Management

#### Drivers Table
Extended information for driver users.

```sql
CREATE TABLE drivers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE,
    license_expiry DATE,
    license_type ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
    date_of_birth DATE,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    blood_type VARCHAR(5),
    medical_certificate_expiry DATE,
    status ENUM('available', 'on_duty', 'unavailable', 'suspended') DEFAULT 'available',
    rating DECIMAL(3,2) DEFAULT 0,
    total_deliveries INT DEFAULT 0,
    total_distance_km DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features**:
- License management with expiry tracking
- Medical certificate tracking
- Performance metrics (rating, deliveries, distance)
- Emergency contact information

#### Driver Documents Table
Store and verify driver documents (license, medical cert, insurance, etc.).

### 4. Vehicle Management

#### Vehicles Table
Fleet management and vehicle tracking.

```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id),
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    year INT,
    color VARCHAR(30),
    capacity_kg INT,
    capacity_volume FLOAT,
    fuel_type ENUM('petrol', 'diesel', 'electric', 'hybrid'),
    fuel_efficiency DECIMAL(5,2), -- km/l
    type ENUM('truck', 'moto', 'van', 'pickup') NOT NULL,
    status ENUM('active', 'maintenance', 'retired', 'suspended') DEFAULT 'active',
    insurance_expiry DATE,
    registration_expiry DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    total_distance_km DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features**:
- Comprehensive vehicle specifications
- Maintenance scheduling
- Fuel efficiency tracking
- Insurance and registration expiry

#### Vehicle Maintenance Table
Track vehicle maintenance history and costs.

### 5. Cargo Management

#### Cargo Categories Table
Define cargo types with pricing and handling requirements.

```sql
CREATE TABLE cargo_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_rate_multiplier DECIMAL(3,2) DEFAULT 1.0,
    special_handling_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features**:
- **base_rate_multiplier**: Price adjustment factor (1.0 = normal, 1.25 = 25% premium)
- **special_handling_required**: Flag for cargo needing extra care

**Example Categories**:
- Electronics (1.25x, special handling)
- Fragile Items (1.30x, special handling)
- Food & Beverages (1.35x, special handling)
- Documents (0.90x, standard handling)

#### Cargos Table
Core cargo shipment management.

```sql
CREATE TABLE cargos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    category_id UUID REFERENCES cargo_categories(id),
    type VARCHAR(100),
    weight_kg FLOAT NOT NULL,
    volume FLOAT,
    dimensions JSON, -- Store length, width, height
    pickup_location_id UUID REFERENCES locations(id),
    pickup_address TEXT,
    pickup_contact VARCHAR(100),
    pickup_phone VARCHAR(20),
    pickup_instructions TEXT,
    destination_location_id UUID REFERENCES locations(id),
    destination_address TEXT,
    destination_contact VARCHAR(100),
    destination_phone VARCHAR(20),
    delivery_instructions TEXT,
    special_requirements TEXT,
    insurance_required BOOLEAN DEFAULT FALSE,
    insurance_amount DECIMAL(10,2),
    fragile BOOLEAN DEFAULT FALSE,
    temperature_controlled BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'quoted', 'accepted', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'disputed') DEFAULT 'pending',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    estimated_cost DECIMAL(10,2),
    final_cost DECIMAL(10,2),
    assigned_vehicle_id UUID REFERENCES vehicles(id),
    assigned_driver_id UUID REFERENCES drivers(id),
    pickup_date TIMESTAMP,
    delivery_date TIMESTAMP,
    actual_pickup_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    distance_km DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features**:
- Comprehensive cargo specifications
- Multiple status tracking
- Priority levels
- Insurance requirements
- Actual vs estimated time tracking

### 6. Route Management

#### Routes Table
Main route container for cargo deliveries.

```sql
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cargo_id UUID NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
    route_name VARCHAR(100),
    total_distance_km DECIMAL(8,2),
    estimated_duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Route Waypoints Table
Individual stops along a route.

```sql
CREATE TABLE route_waypoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    waypoint_order INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    address TEXT,
    waypoint_type ENUM('pickup', 'delivery', 'stop', 'checkpoint'),
    estimated_time TIMESTAMP,
    actual_time TIMESTAMP,
    notes TEXT
);
```

**Example Route**:
1. **Waypoint 1**: Pickup at Warehouse A (08:00 AM)
2. **Waypoint 2**: Checkpoint at Police Station (08:30 AM)
3. **Waypoint 3**: Fuel stop at Gas Station (09:30 AM)
4. **Waypoint 4**: Delivery at Store (11:00 AM)

### 7. Delivery Management

#### Deliveries Table
Track individual delivery executions.

```sql
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cargo_id UUID NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    confirmation_method ENUM('otp', 'signature', 'photo', 'qr', 'manual'),
    confirmation_data TEXT,
    delivery_proof_url TEXT,
    recipient_name VARCHAR(100),
    recipient_signature TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    delivery_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Delivery Status Updates Table
Track detailed delivery progress with location data.

### 8. Financial Management

#### Pricing Policies Table
Flexible pricing rules for different scenarios.

```sql
CREATE TABLE pricing_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    base_rate_per_km DECIMAL(10,2) NOT NULL,
    rate_per_kg DECIMAL(10,2) NOT NULL,
    minimum_fare DECIMAL(10,2),
    surcharge_type VARCHAR(50),
    surcharge_amount DECIMAL(10,2),
    surcharge_description VARCHAR(100),
    discount_percent INT CHECK (discount_percent BETWEEN 0 AND 100),
    applies_to_vehicle_types TEXT[], -- Array of vehicle types
    applies_to_cargo_categories UUID[], -- Array of category IDs
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Invoices Table
Comprehensive invoice management with tax and discounts.

#### Payment Transactions Table
Track individual payment transactions with gateway responses.

#### Refunds Table
Handle refund requests and processing.

### 9. Insurance Management

#### Insurance Policies Table
Cargo insurance management.

```sql
CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cargo_id UUID NOT NULL REFERENCES cargos(id),
    policy_number VARCHAR(100),
    coverage_amount DECIMAL(10,2),
    premium_amount DECIMAL(10,2),
    insurance_provider VARCHAR(100),
    policy_start_date DATE,
    policy_end_date DATE,
    status ENUM('active', 'expired', 'cancelled'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Insurance Claims Table
Claims processing and tracking.

### 10. System Management

#### System Logs Table
Comprehensive audit trail for all system activities.

#### Notifications Table
Multi-channel notification system (SMS, email, push, in-app).

### 11. GPS Tracking

#### GPS Tracking Table
Real-time location tracking with high precision.

```sql
CREATE TABLE gps_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id),
    cargo_id UUID REFERENCES cargos(id),
    driver_id UUID REFERENCES drivers(id),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    altitude DECIMAL(8,2),
    speed_kmh DECIMAL(5,2),
    heading_degrees DECIMAL(5,2),
    accuracy_meters DECIMAL(5,2),
    battery_level INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Features**:
- High-precision GPS coordinates
- Speed and heading tracking
- Battery level monitoring
- Accuracy metrics

### 12. Operational Management

#### Service Areas Table
Define geographic coverage zones.

```sql
CREATE TABLE service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    coverage_radius_km DECIMAL(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Operating Hours Table
Manage availability schedules for locations, drivers, and vehicles.

```sql
CREATE TABLE operating_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type ENUM('location', 'driver', 'vehicle') NOT NULL,
    entity_id UUID NOT NULL,
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 13. Localization

#### Translations Table
Multi-language support for platform internationalization.

## Performance Optimizations

### Strategic Indexes
```sql
-- User management indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Cargo tracking indexes
CREATE INDEX idx_cargos_client_id ON cargos(client_id);
CREATE INDEX idx_cargos_status ON cargos(status);
CREATE INDEX idx_cargos_assigned_driver_id ON cargos(assigned_driver_id);

-- GPS tracking indexes
CREATE INDEX idx_gps_tracking_vehicle_id ON gps_tracking(vehicle_id);
CREATE INDEX idx_gps_tracking_recorded_at ON gps_tracking(recorded_at);

-- Financial indexes
CREATE INDEX idx_invoices_cargo_id ON invoices(cargo_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

### Automatic Timestamps
Triggers automatically update `updated_at` columns for audit trails.

## Business Workflows

### 1. Cargo Booking Workflow
1. **Client Registration** → Create user and client records
2. **Cargo Creation** → Define shipment details and requirements
3. **Pricing Calculation** → Apply pricing policies and category multipliers
4. **Insurance Check** → Determine if insurance is required
5. **Route Planning** → Create route with waypoints
6. **Driver Assignment** → Assign based on availability and skills
7. **Vehicle Assignment** → Select appropriate vehicle
8. **Delivery Execution** → Track progress and confirm delivery

### 2. Financial Workflow
1. **Invoice Generation** → Create invoice with calculated costs
2. **Payment Processing** → Handle multiple payment methods
3. **Transaction Tracking** → Record payment transactions
4. **Refund Handling** → Process refund requests
5. **Credit Management** → Monitor client credit limits

### 3. Insurance Workflow
1. **Policy Creation** → Generate insurance policy for cargo
2. **Coverage Monitoring** → Track policy status and expiry
3. **Claim Filing** → Submit claims for incidents
4. **Claim Processing** → Review and resolve claims
5. **Payment Settlement** → Process approved claims

## Key Features

### Multi-Role Support
- **Clients**: Place orders, track shipments, manage payments
- **Drivers**: Accept jobs, update delivery status, track earnings
- **Admins**: Manage operations, monitor performance, handle disputes
- **Super Admins**: System configuration, user management, analytics

### Advanced Cargo Management
- **Category-based pricing** with special handling requirements
- **Priority levels** (low, normal, high, urgent)
- **Insurance integration** for high-value shipments
- **Temperature-controlled** and fragile item handling

### Route Optimization
- **Multi-waypoint routes** for complex deliveries
- **Real-time tracking** with GPS coordinates
- **Estimated vs actual times** for performance analysis
- **Checkpoint verification** for security

### Financial Management
- **Flexible pricing policies** with surcharges and discounts
- **Multi-payment methods** (cash, mobile money, card, online)
- **Credit limit management** for clients
- **Refund processing** and dispute resolution

### Insurance & Risk Management
- **Cargo insurance policies** with coverage tracking
- **Claims processing** with status management
- **Policy expiry monitoring** for compliance
- **Financial protection** for logistics company

### Real-time Operations
- **GPS tracking** with speed and location data
- **Delivery status updates** with location verification
- **Driver availability** management
- **Vehicle maintenance** scheduling

## Security Features

### Authentication & Authorization
- **Password hashing** for secure storage
- **Session management** with expiry
- **Token-based** password reset and email verification
- **Role-based** access control

### Data Protection
- **Foreign key constraints** for data integrity
- **CASCADE deletion** for related records
- **Audit trails** for all system activities
- **IP address tracking** for security monitoring

## Scalability Considerations

### Performance
- **Strategic indexing** for common queries
- **UUID primary keys** for distributed systems
- **JSON fields** for flexible data storage
- **Efficient data types** (DECIMAL for coordinates)

### Flexibility
- **ENUM types** for controlled values
- **Extensible schema** for future features
- **Multi-language support** for international expansion
- **Modular design** for easy maintenance

## Conclusion

This database schema provides a comprehensive foundation for a modern logistics platform, supporting:

- ✅ **Multi-role user management**
- ✅ **Complex route planning and optimization**
- ✅ **Comprehensive financial management**
- ✅ **Insurance and risk management**
- ✅ **Real-time tracking and analytics**
- ✅ **Document management and verification**
- ✅ **Multi-language support**
- ✅ **Performance optimization**

The schema is production-ready and can scale to handle thousands of users, vehicles, and deliveries while maintaining data integrity and performance.
