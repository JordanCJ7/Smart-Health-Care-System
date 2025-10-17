// Send success response
export const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
    error: null,
  });
};

// Send error response
export const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    data: null,
    error: message,
  });
};
