
-- ========================================
-- ENHANCED LOGISTICS PLATFORM SCHEMA
-- Comprehensive database design for full platform functionality
-- ========================================

-- USERS (all roles)
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

-- USER SESSIONS
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PASSWORD RESET TOKENS
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMAIL VERIFICATION TOKENS
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CLIENTS
CREATE TABLE clients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(100),
    business_type ENUM('individual', 'corporate', 'government') DEFAULT 'individual',
    tin_number VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    contact_person VARCHAR(100),
    credit_limit DECIMAL(12,2) DEFAULT 0, --  Maximum amount client can owe before payment is required
    payment_terms INT DEFAULT 30, -- days -- Number of days client has to pay invoices
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DRIVERS
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

-- DRIVER DOCUMENTS
CREATE TABLE driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    document_type ENUM('license', 'medical_cert', 'insurance', 'vehicle_registration', 'other'),
    document_number VARCHAR(100),
    file_url TEXT,
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VEHICLES
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

-- VEHICLE MAINTENANCE RECORDS
CREATE TABLE vehicle_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type ENUM('routine', 'repair', 'inspection', 'emergency'),
    description TEXT,
    cost DECIMAL(10,2),
    service_provider VARCHAR(100),
    service_date DATE,
    next_service_date DATE,
    mileage_at_service INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LOCATIONS/WAREHOUSES
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    operating_hours JSON, -- Store as JSON for flexible hours
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CARGO CATEGORIES
CREATE TABLE cargo_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_rate_multiplier DECIMAL(3,2) DEFAULT 1.0, -- Price adjustment factor for this cargo type
    special_handling_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CARGO REQUESTS
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

-- ROUTES AND WAYPOINTS
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cargo_id UUID NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
    route_name VARCHAR(100),
    total_distance_km DECIMAL(8,2),
    estimated_duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- DELIVERIES
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

-- DELIVERY STATUS UPDATES
CREATE TABLE delivery_status_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cargo_id UUID NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
    status ENUM('pending', 'quoted', 'accepted', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'disputed'),
    location_latitude DECIMAL(10,8),
    location_longitude DECIMAL(11,8),
    location_address TEXT,
    notes TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRICING POLICIES
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

-- INVOICES
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    cargo_id UUID NOT NULL REFERENCES cargos(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    due_date DATE,
    paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP,
    payment_method ENUM('cash', 'mobile_money', 'card', 'online', 'bank_transfer'),
    payment_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PAYMENT TRANSACTIONS
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'mobile_money', 'card', 'online', 'bank_transfer'),
    transaction_id VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded'),
    gateway_response JSON,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REFUNDS
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'processed', 'rejected'),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSURANCE AND CLAIMS
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

CREATE TABLE insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cargo_id UUID NOT NULL REFERENCES cargos(id),
    claim_number VARCHAR(100),
    claim_amount DECIMAL(10,2),
    claim_reason TEXT,
    status ENUM('filed', 'under_review', 'approved', 'rejected', 'paid'),
    filed_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SYSTEM LOGS
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    message TEXT NOT NULL,
    type ENUM('sms', 'email', 'push', 'in_app') NOT NULL,
    category ENUM('delivery_update', 'payment', 'system', 'promotional'),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GPS TRACKING
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

-- TRANSLATIONS (for multi-language)
CREATE TABLE translations (
    id SERIAL PRIMARY KEY,
    translation_key VARCHAR(100) UNIQUE NOT NULL,
    en TEXT NOT NULL,
    rw TEXT,
    fr TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SERVICE AREAS
CREATE TABLE service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    coverage_radius_km DECIMAL(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OPERATING HOURS
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

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_cargos_client_id ON cargos(client_id);
CREATE INDEX idx_cargos_status ON cargos(status);
CREATE INDEX idx_cargos_assigned_driver_id ON cargos(assigned_driver_id);
CREATE INDEX idx_deliveries_cargo_id ON deliveries(cargo_id);
CREATE INDEX idx_gps_tracking_vehicle_id ON gps_tracking(vehicle_id);
CREATE INDEX idx_gps_tracking_recorded_at ON gps_tracking(recorded_at);
CREATE INDEX idx_invoices_cargo_id ON invoices(cargo_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cargos_updated_at BEFORE UPDATE ON cargos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

