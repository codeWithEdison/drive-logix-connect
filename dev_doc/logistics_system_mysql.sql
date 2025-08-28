-- ========================================
-- LOGISTICS PLATFORM MYSQL SCHEMA
-- Normalized database design for ERD conversion
-- ========================================

CREATE DATABASE IF NOT EXISTS loveway_logistics;
USE loveway_logistics;

-- ========================================
-- 1. USER MANAGEMENT (Core Entity)
-- ========================================

CREATE TABLE users (
    id BINARY(16) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash TEXT NOT NULL,
    role ENUM('client', 'driver', 'admin', 'super_admin') NOT NULL,
    preferred_language ENUM('en', 'rw', 'fr') DEFAULT 'en',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

CREATE TABLE user_sessions (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Combined verification/reset tokens
CREATE TABLE user_verification_tokens (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    token_hash TEXT NOT NULL,
    token_type ENUM('password_reset', 'email_verification') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_uvt_user_id (user_id),
    INDEX idx_uvt_token_type (token_type),
    INDEX idx_uvt_expires_at (expires_at),
    INDEX idx_uvt_token_hash (token_hash(64))
);

-- ========================================
-- 2. CLIENT MANAGEMENT (Subtype of Users)
-- ========================================

CREATE TABLE clients (
    id BINARY(16) PRIMARY KEY,
    company_name VARCHAR(100),
    business_type ENUM('individual', 'corporate', 'government') DEFAULT 'individual',
    tax_id VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    contact_person VARCHAR(100),
    credit_limit DECIMAL(12,2) DEFAULT 0.00,
    payment_terms INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- 3. DRIVER MANAGEMENT (Subtype of Users)
-- ========================================

CREATE TABLE drivers (
    id BINARY(16) PRIMARY KEY,
    license_number VARCHAR(50) UNIQUE,
    license_expiry DATE,
    license_type ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
    date_of_birth DATE,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    blood_type VARCHAR(5),
    medical_certificate_expiry DATE,
    status ENUM('available', 'on_duty', 'unavailable', 'suspended') DEFAULT 'available',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_deliveries INT DEFAULT 0,
    total_distance_km DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE driver_documents (
    id BINARY(16) PRIMARY KEY,
    driver_id BINARY(16) NOT NULL,
    document_type ENUM('license', 'medical_cert', 'insurance', 'vehicle_registration', 'other'),
    document_number VARCHAR(100),
    file_url TEXT,
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by BINARY(16),
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- ========================================
-- 4. VEHICLE MANAGEMENT
-- ========================================

CREATE TABLE vehicles (
    id BINARY(16) PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    year INT,
    color VARCHAR(30),
    capacity_kg INT,
    capacity_volume FLOAT,
    fuel_type ENUM('petrol', 'diesel', 'electric', 'hybrid'),
    fuel_efficiency DECIMAL(5,2),
    type ENUM('truck', 'moto', 'van', 'pickup') NOT NULL,
    status ENUM('active', 'maintenance', 'retired', 'suspended') DEFAULT 'active',
    insurance_expiry DATE,
    registration_expiry DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    total_distance_km DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE vehicle_maintenance (
    id BINARY(16) PRIMARY KEY,
    vehicle_id BINARY(16) NOT NULL,
    maintenance_type ENUM('routine', 'repair', 'inspection', 'emergency'),
    description TEXT,
    cost DECIMAL(10,2),
    service_provider VARCHAR(100),
    service_date DATE,
    next_service_date DATE,
    mileage_at_service INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- ========================================
-- 5. LOCATION MANAGEMENT
-- ========================================

CREATE TABLE locations (
    id BINARY(16) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('warehouse', 'pickup_point', 'delivery_point', 'office'),
    address TEXT NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    operating_hours JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 6. CARGO CATEGORIES
-- ========================================

CREATE TABLE cargo_categories (
    id BINARY(16) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_rate_multiplier DECIMAL(3,2) DEFAULT 1.00,
    special_handling_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 7. CARGO MANAGEMENT (Main Entity)
-- ========================================

CREATE TABLE cargos (
    id BINARY(16) PRIMARY KEY,
    client_id BINARY(16) NOT NULL,
    category_id BINARY(16),
    type VARCHAR(100),
    weight_kg FLOAT NOT NULL,
    volume FLOAT,
    dimensions JSON,
    pickup_location_id BINARY(16),
    pickup_address TEXT,
    pickup_contact VARCHAR(100),
    pickup_phone VARCHAR(20),
    pickup_instructions TEXT,
    destination_location_id BINARY(16),
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
    pickup_date TIMESTAMP NULL,
    delivery_date TIMESTAMP NULL,
    distance_km DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES cargo_categories(id),
    FOREIGN KEY (pickup_location_id) REFERENCES locations(id),
    FOREIGN KEY (destination_location_id) REFERENCES locations(id),
    INDEX idx_cargos_client_id (client_id),
    INDEX idx_cargos_status (status),
    INDEX idx_cargos_status_created (status, created_at),
    INDEX idx_cargos_client_created (client_id, created_at)
);

-- ========================================
-- 8. DELIVERY ASSIGNMENTS (Junction Table)
-- ========================================

CREATE TABLE delivery_assignments (
    id BINARY(16) PRIMARY KEY,
    cargo_id BINARY(16) NOT NULL,
    driver_id BINARY(16) NOT NULL,
    vehicle_id BINARY(16) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    UNIQUE KEY unique_cargo_assignment (cargo_id),
    INDEX idx_delivery_assignments_driver_id (driver_id),
    INDEX idx_delivery_assignments_vehicle_id (vehicle_id),
    INDEX idx_delivery_assignments_driver_assigned (driver_id, assigned_at)
);

-- ========================================
-- 9. ROUTE MANAGEMENT
-- ========================================

CREATE TABLE routes (
    id BINARY(16) PRIMARY KEY,
    cargo_id BINARY(16) NOT NULL,
    route_name VARCHAR(100),
    total_distance_km DECIMAL(8,2),
    estimated_duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cargo_route (cargo_id)
);

CREATE TABLE route_waypoints (
    id BINARY(16) PRIMARY KEY,
    route_id BINARY(16) NOT NULL,
    waypoint_order INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    address TEXT,
    waypoint_type ENUM('pickup', 'delivery', 'stop', 'checkpoint'),
    estimated_time TIMESTAMP NULL,
    actual_time TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_route_waypoints_route_id (route_id),
    INDEX idx_route_waypoints_order (waypoint_order)
);

-- ========================================
-- 10. DELIVERY EXECUTION
-- ========================================

CREATE TABLE deliveries (
    id BINARY(16) PRIMARY KEY,
    cargo_id BINARY(16) NOT NULL,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    actual_pickup_time TIMESTAMP NULL,
    actual_delivery_time TIMESTAMP NULL,
    confirmation_method ENUM('otp', 'signature', 'photo', 'qr', 'manual'),
    confirmation_data TEXT,
    delivery_proof_url TEXT,
    recipient_name VARCHAR(100),
    recipient_signature TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    delivery_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cargo_delivery (cargo_id),
    INDEX idx_deliveries_cargo_created (cargo_id, created_at)
);

CREATE TABLE delivery_status_updates (
    id BINARY(16) PRIMARY KEY,
    cargo_id BINARY(16) NOT NULL,
    status ENUM('pending', 'quoted', 'accepted', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'disputed'),
    location_latitude DECIMAL(10,8),
    location_longitude DECIMAL(11,8),
    location_address TEXT,
    notes TEXT,
    updated_by BINARY(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id),
    INDEX idx_delivery_status_cargo_id (cargo_id),
    INDEX idx_delivery_status_created_at (created_at),
    INDEX idx_delivery_status_cargo_id_created_at (cargo_id, created_at)
);

-- ========================================
-- 11. PRICING MANAGEMENT
-- ========================================

CREATE TABLE pricing_policies (
    id BINARY(16) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    base_rate_per_km DECIMAL(10,2) NOT NULL,
    rate_per_kg DECIMAL(10,2) NOT NULL,
    minimum_fare DECIMAL(10,2),
    surcharge_type VARCHAR(50),
    surcharge_amount DECIMAL(10,2),
    surcharge_description VARCHAR(100),
    discount_percent INT CHECK (discount_percent BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 12. INVOICE MANAGEMENT
-- ========================================

CREATE TABLE invoices (
    id BINARY(16) PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    cargo_id BINARY(16) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RWF',
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    due_date DATE,
    paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP NULL,
    payment_method ENUM('cash', 'mobile_money', 'card', 'online', 'bank_transfer'),
    payment_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cargo_id) REFERENCES cargos(id),
    UNIQUE KEY unique_cargo_invoice (cargo_id),
    INDEX idx_invoices_status (status),
    INDEX idx_invoices_status_created (status, created_at)
);

-- ========================================
-- 13. PAYMENT MANAGEMENT
-- ========================================

CREATE TABLE payment_transactions (
    id BINARY(16) PRIMARY KEY,
    invoice_id BINARY(16),
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'mobile_money', 'card', 'online', 'bank_transfer'),
    transaction_id VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded'),
    gateway_response JSON,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    INDEX idx_payment_transactions_invoice_id (invoice_id),
    INDEX idx_payment_transactions_status (status)
);

CREATE TABLE refunds (
    id BINARY(16) PRIMARY KEY,
    invoice_id BINARY(16) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'processed', 'rejected'),
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    INDEX idx_refunds_invoice_id (invoice_id)
);

-- ========================================
-- 14. INSURANCE MANAGEMENT
-- ========================================

CREATE TABLE insurance_policies (
    id BINARY(16) PRIMARY KEY,
    cargo_id BINARY(16) NOT NULL,
    policy_number VARCHAR(100),
    coverage_amount DECIMAL(10,2),
    premium_amount DECIMAL(10,2),
    insurance_provider VARCHAR(100),
    policy_start_date DATE,
    policy_end_date DATE,
    status ENUM('active', 'expired', 'cancelled'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cargo_id) REFERENCES cargos(id),
    UNIQUE KEY unique_cargo_insurance (cargo_id)
);

CREATE TABLE insurance_claims (
    id BINARY(16) PRIMARY KEY,
    cargo_id BINARY(16) NOT NULL,
    claim_number VARCHAR(100),
    claim_amount DECIMAL(10,2),
    claim_reason TEXT,
    status ENUM('filed', 'under_review', 'approved', 'rejected', 'paid'),
    filed_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cargo_id) REFERENCES cargos(id),
    INDEX idx_insurance_claims_cargo_id (cargo_id),
    INDEX idx_insurance_claims_status (status)
);

-- ========================================
-- 15. GPS TRACKING
-- ========================================

CREATE TABLE gps_tracking (
    id BINARY(16) PRIMARY KEY,
    vehicle_id BINARY(16),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    altitude DECIMAL(8,2),
    speed_kmh DECIMAL(5,2),
    heading_degrees DECIMAL(5,2),
    accuracy_meters DECIMAL(5,2),
    battery_level INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    INDEX idx_gps_tracking_vehicle_id (vehicle_id),
    INDEX idx_gps_tracking_recorded_at (recorded_at),
    INDEX idx_gps_tracking_vehicle_recorded (vehicle_id, recorded_at)
);

-- ========================================
-- 16. SYSTEM MANAGEMENT
-- ========================================

CREATE TABLE system_logs (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BINARY(16),
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_system_logs_user_id (user_id),
    INDEX idx_system_logs_created_at (created_at)
);

CREATE TABLE notifications (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    title VARCHAR(255),
    message TEXT NOT NULL,
    type ENUM('sms', 'email', 'push', 'in_app') NOT NULL,
    category ENUM('delivery_update', 'payment', 'system', 'promotional'),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_notifications_user_id (user_id)
);

-- ========================================
-- 17. OPERATIONAL MANAGEMENT
-- ========================================

CREATE TABLE service_areas (
    id BINARY(16) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    coverage_radius_km DECIMAL(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE operating_hours (
    id BINARY(16) PRIMARY KEY,
    entity_type ENUM('location', 'driver', 'vehicle') NOT NULL,
    entity_id BINARY(16) NOT NULL,
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_entity_day (entity_type, entity_id, day_of_week)
);

-- ========================================
-- 18. LOCALIZATION
-- ========================================

CREATE TABLE translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    translation_key VARCHAR(100) UNIQUE NOT NULL,
    en TEXT NOT NULL,
    rw TEXT,
    fr TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- SAMPLE DATA
-- ========================================

INSERT INTO cargo_categories (id, name, description, base_rate_multiplier, special_handling_required) VALUES
(UUID_TO_BIN(UUID(), TRUE), 'Electronics', 'Computers, phones, gadgets', 1.25, TRUE),
(UUID_TO_BIN(UUID(), TRUE), 'Fragile Items', 'Glass, ceramics, artwork', 1.30, TRUE),
(UUID_TO_BIN(UUID(), TRUE), 'Food & Beverages', 'Perishable food items', 1.35, TRUE),
(UUID_TO_BIN(UUID(), TRUE), 'Documents', 'Paper files, packages', 0.90, FALSE),
(UUID_TO_BIN(UUID(), TRUE), 'General Cargo', 'Mixed items, household goods', 1.00, FALSE);

INSERT INTO service_areas (id, name, city, country, coverage_radius_km) VALUES
(UUID_TO_BIN(UUID(), TRUE), 'Kigali Central', 'Kigali', 'Rwanda', 25.00),
(UUID_TO_BIN(UUID(), TRUE), 'Western Province', 'Gisenyi', 'Rwanda', 75.00),
(UUID_TO_BIN(UUID(), TRUE), 'Southern Region', 'Butare', 'Rwanda', 60.00);

INSERT INTO pricing_policies (id, name, base_rate_per_km, rate_per_kg, minimum_fare) VALUES
(UUID_TO_BIN(UUID(), TRUE), 'Standard Rate', 2.00, 0.50, 10.00),
(UUID_TO_BIN(UUID(), TRUE), 'Express Delivery', 3.00, 0.75, 15.00),
(UUID_TO_BIN(UUID(), TRUE), 'Economy Rate', 1.50, 0.30, 8.00);

-- ========================================
-- VIEWS FOR ERD ANALYSIS
-- ========================================

-- Active deliveries view
CREATE VIEW active_deliveries AS
SELECT 
    BIN_TO_UUID(c.id, TRUE) as cargo_id,
    c.type as cargo_type,
    c.status as cargo_status,
    c.priority,
    c.pickup_address,
    c.destination_address,
    u.full_name as driver_name,
    v.plate_number as vehicle_plate,
    c.estimated_cost,
    c.created_at
FROM cargos c
LEFT JOIN delivery_assignments da ON c.id = da.cargo_id
LEFT JOIN drivers d ON da.driver_id = d.id
LEFT JOIN users u ON d.id = u.id
LEFT JOIN vehicles v ON da.vehicle_id = v.id
WHERE c.status IN ('assigned', 'picked_up', 'in_transit');

-- Driver performance view
CREATE VIEW driver_performance AS
SELECT 
    BIN_TO_UUID(d.id, TRUE) as driver_id,
    u.full_name,
    d.rating,
    d.total_deliveries,
    d.total_distance_km,
    d.status,
    COUNT(del.id) as completed_deliveries,
    AVG(del.rating) as avg_delivery_rating
FROM drivers d
LEFT JOIN users u ON d.id = u.id
LEFT JOIN delivery_assignments da ON d.id = da.driver_id
LEFT JOIN deliveries del ON da.cargo_id = del.cargo_id
GROUP BY d.id, u.full_name, d.rating, d.total_deliveries, d.total_distance_km, d.status;

-- Financial summary view
CREATE VIEW financial_summary AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_cargos,
    SUM(final_cost) as total_revenue,
    AVG(final_cost) as avg_cost,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_deliveries,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_deliveries
FROM cargos
GROUP BY DATE(created_at)
ORDER BY date DESC;
