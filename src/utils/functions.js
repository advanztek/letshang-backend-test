// Utility functions
const validateSchema = (data, schema) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw new Error(JSON.stringify(errors));
  }
  
  return value;
};

const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

const errorResponse = (message, statusCode = 500) => ({
  success: false,
  message,
  error: statusCode,
  timestamp: new Date().toISOString()
});

export {validateSchema,successResponse,errorResponse}