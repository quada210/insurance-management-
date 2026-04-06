const supabase = require('../config/supabaseClient');

exports.getAllAgents = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('agent')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getAgentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('agent')
      .select('*')
      .eq('agent_id', id)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.createAgent = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('agent')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('agent')
      .update(req.body)
      .eq('agent_id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.deleteAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('agent')
      .delete()
      .eq('agent_id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    next(error);
  }
};