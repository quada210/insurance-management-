-- =============================================
-- BCNF NORMALIZED INSURANCE MANAGEMENT SCHEMA
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. AGENT TABLE (Independent Entity)
-- =============================================
CREATE TABLE agent (
    agent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    commission_rate DECIMAL(5,2) CHECK (commission_rate >= 0 AND commission_rate <= 100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 2. CLIENT TABLE (Independent Entity)
-- =============================================
CREATE TABLE client (
    client_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    date_of_birth DATE NOT NULL,
    address_line1 VARCHAR(100) NOT NULL,
    address_line2 VARCHAR(100),
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(50) DEFAULT 'USA',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 3. POLICY_TYPE TABLE (Lookup/Reference Table)
-- =============================================
CREATE TABLE policy_type (
    policy_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    base_premium DECIMAL(10,2) NOT NULL,
    coverage_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 4. POLICY TABLE (Depends on CLIENT, AGENT, POLICY_TYPE)
-- =============================================
CREATE TABLE policy (
    policy_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_number VARCHAR(20) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES client(client_id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agent(agent_id) ON DELETE RESTRICT,
    policy_type_id UUID NOT NULL REFERENCES policy_type(policy_type_id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    premium_amount DECIMAL(10,2) NOT NULL,
    coverage_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CHECK (end_date > start_date)
);

-- =============================================
-- 5. CLAIM TABLE (Depends on POLICY) - NoSQL JSONB for incident details
-- =============================================
CREATE TABLE claim (
    claim_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_number VARCHAR(20) UNIQUE NOT NULL,
    policy_id UUID NOT NULL REFERENCES policy(policy_id) ON DELETE CASCADE,
    claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
    incident_date DATE NOT NULL,
    claim_amount DECIMAL(10,2) NOT NULL CHECK (claim_amount > 0),
    incident_details JSONB NOT NULL, -- NoSQL component
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'investigating')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 6. PAYOUT TABLE (Depends on CLAIM)
-- =============================================
CREATE TABLE payout (
    payout_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID NOT NULL REFERENCES claim(claim_id) ON DELETE CASCADE,
    payout_amount DECIMAL(10,2) NOT NULL CHECK (payout_amount > 0),
    payout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) DEFAULT 'bank_transfer',
    transaction_reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_policy_client ON policy(client_id);
CREATE INDEX idx_policy_agent ON policy(agent_id);
CREATE INDEX idx_claim_policy ON claim(policy_id);
CREATE INDEX idx_payout_claim ON payout(claim_id);
CREATE INDEX idx_claim_status ON claim(status);
CREATE INDEX idx_policy_status ON policy(status);

-- =============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_timestamp BEFORE UPDATE ON agent
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_timestamp BEFORE UPDATE ON client
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_timestamp BEFORE UPDATE ON policy
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_timestamp BEFORE UPDATE ON claim
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payout_timestamp BEFORE UPDATE ON payout
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();