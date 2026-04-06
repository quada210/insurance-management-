const supabase = require('../config/supabaseClient');

// Get all clients
exports.getAllClients = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('client')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Get client by ID
exports.getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('client')
      .select('*')
      .eq('client_id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Client not found' });
    
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Create new client
exports.createClient = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('client')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Update client
exports.updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('client')
      .update(req.body)
      .eq('client_id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Delete client
exports.deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('client')
      .delete()
      .eq('client_id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    next(error);
  }
};