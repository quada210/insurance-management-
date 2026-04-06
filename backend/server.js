const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
<<<<<<< HEAD
=======
const path = require('path');
>>>>>>> c097251ff7c8748e7fe323a4fe8dcd32e995df03
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const supabase = require('./config/supabaseClient');

<<<<<<< HEAD
// Import routes
=======
>>>>>>> c097251ff7c8748e7fe323a4fe8dcd32e995df03
const clientRoutes = require('./routes/clientRoutes');
const agentRoutes = require('./routes/agentRoutes');
const policyRoutes = require('./routes/policyRoutes');
const claimRoutes = require('./routes/claimRoutes');
const payoutRoutes = require('./routes/payoutRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
<<<<<<< HEAD
app.use(cors());
=======
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
>>>>>>> c097251ff7c8748e7fe323a4fe8dcd32e995df03
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

<<<<<<< HEAD
// Routes
=======
// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
>>>>>>> c097251ff7c8748e7fe323a4fe8dcd32e995df03
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
<<<<<<< HEAD
    
=======
>>>>>>> c097251ff7c8748e7fe323a4fe8dcd32e995df03
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// Health check
app.get('/health', (req, res) => {
<<<<<<< HEAD
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
=======
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
>>>>>>> c097251ff7c8748e7fe323a4fe8dcd32e995df03
});

// Error handling
app.use(errorHandler);

<<<<<<< HEAD
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
=======
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
>>>>>>> c097251ff7c8748e7fe323a4fe8dcd32e995df03
});