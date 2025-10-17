import AuditLog from '../models/AuditLog.js';

/**
 * Create an audit log entry
 * @param {Object} options - Audit log options
 * @param {String} options.userId - User ID performing the action
 * @param {String} options.userRole - User role (Patient, Staff, Admin)
 * @param {String} options.action - Action performed
 * @param {String} options.resource - Resource type
 * @param {String} options.resourceId - Resource ID
 * @param {String} options.details - Additional details
 * @param {Object} options.metadata - Additional metadata
 * @param {String} options.ipAddress - IP address
 * @param {String} options.userAgent - User agent
 * @param {String} options.status - Status (Success, Failure, Partial)
 * @param {String} options.errorMessage - Error message if failure
 */
export const createAuditLog = async (options) => {
  const {
    userId,
    userRole,
    action,
    resource,
    resourceId,
    details,
    metadata = {},
    ipAddress,
    userAgent,
    status = 'Success',
    errorMessage,
  } = options;

  try {
    await AuditLog.create({
      userId,
      userRole,
      action,
      resource,
      resourceId,
      details,
      metadata,
      ipAddress,
      userAgent,
      status,
      errorMessage,
    });

    console.log(`[AUDIT LOG] ${userRole} ${userId} performed ${action} on ${resource} ${resourceId || ''} - ${status}`);
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error - audit logging should not break the main flow
  }
};

/**
 * Middleware to extract request metadata for audit logging
 */
export const extractRequestMetadata = (req) => {
  return {
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent'),
  };
};

/**
 * Get audit logs with filters
 */
export const getAuditLogs = async (filters = {}, limit = 100, skip = 0) => {
  const query = {};
  
  if (filters.userId) query.userId = filters.userId;
  if (filters.action) query.action = filters.action;
  if (filters.resource) query.resource = filters.resource;
  if (filters.status) query.status = filters.status;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  return AuditLog.find(query)
    .populate('userId', 'name email role')
    .sort('-createdAt')
    .limit(limit)
    .skip(skip)
    .lean();
};
