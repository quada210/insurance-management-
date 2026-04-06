const supabase = require('../config/supabaseClient');

// Get all claims with JSONB incident details
exports.getAllClaims = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('claim')
      .select(`
        *,
        policy:policy_id (
          policy_number,
          client:client_id (first_name, last_name, email)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Get claim analytics from VIEW
exports.getClaimAnalytics = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('claim_analytics')
      .select('*');

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getClaimById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('claim')
      .select(`
        *,
        policy:policy_id (
          *,
          client:client_id (*),
          policy_type:policy_type_id (*)
        )
      `)
      .eq('claim_id', id)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Create claim with JSONB validation
exports.createClaim = async (req, res, next) => {
  try {
    // Ensure incident_details is valid JSON
    if (req.body.incident_details && typeof req.body.incident_details === 'string') {
      req.body.incident_details = JSON.parse(req.body.incident_details);
    }

    const { data, error } = await supabase
      .from('claim')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Ensure incident_details is valid JSON if provided
    if (req.body.incident_details && typeof req.body.incident_details === 'string') {
      req.body.incident_details = JSON.parse(req.body.incident_details);
    }

    const { data, error } = await supabase
      .from('claim')
      .update(req.body)
      .eq('claim_id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.deleteClaim = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('claim')
      .delete()
      .eq('claim_id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Claim deleted successfully' });
  } catch (error) {
    next(error);
  }
};