const supabase = require('../config/supabaseClient');

// Get all policies with joined data
exports.getAllPolicies = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('policy')
      .select(`
        *,
        client:client_id (client_id, first_name, last_name, email),
        agent:agent_id (agent_id, first_name, last_name),
        policy_type:policy_type_id (policy_type_id, type_name, description)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Get policy overview from VIEW
exports.getPolicyOverview = async (req, res, next) => {
  try {
    // First try to get from view
    let { data, error } = await supabase
      .from('policy_overview')
      .select('*');

    // If view doesn't exist, fall back to regular query
    if (error && error.message.includes('does not exist')) {
      console.log('View not found, using fallback query');
      const result = await supabase
        .from('policy')
        .select(`
          *,
          client:client_id (first_name, last_name, email),
          agent:agent_id (first_name, last_name),
          policy_type:policy_type_id (type_name)
        `);
      
      data = result.data;
      error = result.error;
    }

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getPolicyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('policy')
      .select(`
        *,
        client:client_id (*),
        agent:agent_id (*),
        policy_type:policy_type_id (*)
      `)
      .eq('policy_id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Policy not found' });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.createPolicy = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('policy')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updatePolicy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('policy')
      .update(req.body)
      .eq('policy_id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.deletePolicy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('policy')
      .delete()
      .eq('policy_id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Policy deleted successfully' });
  } catch (error) {
    next(error);
  }
};