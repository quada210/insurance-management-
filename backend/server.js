const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const supabase = require('./config/supabaseClient');

// Import routes
const clientRoutes = require('./routes/clientRoutes');
const agentRoutes = require('./routes/agentRoutes');
const policyRoutes = require('./routes/policyRoutes');
const claimRoutes = require('./routes/claimRoutes');
const payoutRoutes = require('./routes/payoutRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/payouts', payoutRoutes);

// Policy types endpoint
app.get('/api/policy-types', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('policy_type')
      .select('*')
      .order('type_name');
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    endpoints: {
      clients: '/api/clients',
      agents: '/api/agents',
      policies: '/api/policies',
      claims: '/api/claims',
      payouts: '/api/payouts'
    }
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});