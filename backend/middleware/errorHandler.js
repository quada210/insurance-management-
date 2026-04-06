const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Supabase/PostgreSQL constraint violations
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'This record already exists',
      details: err.message
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Foreign key violation',
      message: 'Referenced record does not exist',
      details: err.message
    });
  }

  if (err.code === '23514') {
    return res.status(400).json({
      error: 'Check constraint violation',
      message: 'Data validation failed',
      details: err.message
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;