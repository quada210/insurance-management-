const supabase = require('../config/supabaseClient');

exports.getAllPayouts = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('payout')
      .select(`
        *,
        claim:claim_id (
          claim_number,
          claim_amount,
          policy:policy_id (
            policy_number,
            client:client_id (first_name, last_name)
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getPayoutById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('payout')
      .select(`
        *,
        claim:claim_id (*)
      `)
      .eq('payout_id', id)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.createPayout = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('payout')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updatePayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('payout')
      .update(req.body)
      .eq('payout_id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Special function to complete payout (triggers claim status update)
exports.completePayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('payout')
      .update({ status: 'completed', payout_date: new Date().toISOString() })
      .eq('payout_id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ 
      success: true, 
      data,
      message: 'Payout completed. Claim status updated automatically.' 
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('payout')
      .delete()
      .eq('payout_id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Payout deleted successfully' });
  } catch (error) {
    next(error);
  }
};