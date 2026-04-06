-- =============================================
-- POLICY OVERVIEW VIEW (Dashboard Analytics)
-- =============================================
CREATE OR REPLACE VIEW policy_overview AS
SELECT 
    p.policy_id,
    p.policy_number,
    CONCAT(c.first_name, ' ', c.last_name) AS client_name,
    c.email AS client_email,
    CONCAT(a.first_name, ' ', a.last_name) AS agent_name,
    pt.type_name AS policy_type,
    p.premium_amount,
    p.coverage_amount,
    p.start_date,
    p.end_date,
    p.status AS policy_status,
    COUNT(cl.claim_id) AS total_claims,
    COALESCE(SUM(cl.claim_amount), 0) AS total_claimed_amount,
    COALESCE(SUM(po.payout_amount), 0) AS total_payout_amount
FROM policy p
JOIN client c ON p.client_id = c.client_id
JOIN agent a ON p.agent_id = a.agent_id
JOIN policy_type pt ON p.policy_type_id = pt.policy_type_id
LEFT JOIN claim cl ON p.policy_id = cl.policy_id
LEFT JOIN payout po ON cl.claim_id = po.claim_id
GROUP BY p.policy_id, p.policy_number, c.first_name, c.last_name, 
         c.email, a.first_name, a.last_name, pt.type_name, 
         p.premium_amount, p.coverage_amount, p.start_date, 
         p.end_date, p.status;

-- =============================================
-- CLAIM ANALYTICS VIEW
-- =============================================
CREATE OR REPLACE VIEW claim_analytics AS
SELECT 
    cl.claim_id,
    cl.claim_number,
    p.policy_number,
    CONCAT(c.first_name, ' ', c.last_name) AS client_name,
    cl.claim_date,
    cl.incident_date,
    cl.claim_amount,
    cl.status AS claim_status,
    po.payout_amount,
    po.payout_date,
    po.status AS payout_status
FROM claim cl
JOIN policy p ON cl.policy_id = p.policy_id
JOIN client c ON p.client_id = c.client_id
LEFT JOIN payout po ON cl.claim_id = po.claim_id;