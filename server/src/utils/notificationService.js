import Notification from '../models/Notification.js';

/**
 * Notify doctor about prescription issues
 * @param {Object} options - Notification options
 * @param {String} options.doctorId - Doctor's user ID
 * @param {String} options.type - Notification type
 * @param {String} options.title - Notification title
 * @param {String} options.message - Notification message
 * @param {String} options.prescriptionId - Related prescription ID
 * @param {String} options.priority - Notification priority
 * @param {Object} options.metadata - Additional metadata
 * @param {String} options.senderId - Sender's user ID
 */
export const notifyDoctor = async (options) => {
  const {
    doctorId,
    type,
    title,
    message,
    prescriptionId,
    priority = 'Medium',
    metadata = {},
    senderId,
  } = options;

  try {
    const notification = await Notification.create({
      recipientId: doctorId,
      senderId,
      type,
      title,
      message,
      relatedPrescriptionId: prescriptionId,
      metadata,
      priority,
    });

    // In production, you would also send email/SMS/push notification here
    console.log(`Notification sent to doctor ${doctorId}:`, title);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Notify about unclear prescription (Extension 3a)
 */
export const notifyUnclearPrescription = async (prescriptionId, doctorId, pharmacistId, details) => {
  return notifyDoctor({
    doctorId,
    senderId: pharmacistId,
    type: 'PRESCRIPTION_UNCLEAR',
    title: 'Prescription Clarification Required',
    message: `A pharmacist has flagged prescription ${prescriptionId} for clarification. Details: ${details}`,
    prescriptionId,
    priority: 'High',
    metadata: { details, requestedBy: pharmacistId },
  });
};

/**
 * Notify about drug unavailability (Extension 4a)
 */
export const notifyDrugUnavailable = async (prescriptionId, doctorId, pharmacistId, drugName, alternatives) => {
  const altList = alternatives && alternatives.length > 0 
    ? alternatives.map(a => a.drugName).join(', ') 
    : 'None available';
  
  return notifyDoctor({
    doctorId,
    senderId: pharmacistId,
    type: 'DRUG_UNAVAILABLE',
    title: 'Drug Unavailable - Action Required',
    message: `Drug "${drugName}" for prescription ${prescriptionId} is out of stock. Suggested alternatives: ${altList}`,
    prescriptionId,
    priority: 'Urgent',
    metadata: { drugName, alternatives, requestedBy: pharmacistId },
  });
};

/**
 * Notify about partial dispense (Extension 7a)
 */
export const notifyPartialDispense = async (prescriptionId, doctorId, pharmacistId, dispensedItems, unavailableItems) => {
  return notifyDoctor({
    doctorId,
    senderId: pharmacistId,
    type: 'PARTIAL_DISPENSE',
    title: 'Partial Prescription Dispensed',
    message: `Prescription ${prescriptionId} was partially dispensed. Some medications were unavailable and require reissue.`,
    prescriptionId,
    priority: 'High',
    metadata: { dispensedItems, unavailableItems, requestedBy: pharmacistId },
  });
};

/**
 * Notify about successful dispense
 */
export const notifyPrescriptionDispensed = async (prescriptionId, patientId, pharmacistId) => {
  try {
    await Notification.create({
      recipientId: patientId,
      senderId: pharmacistId,
      type: 'PRESCRIPTION_DISPENSED',
      title: 'Prescription Ready',
      message: `Your prescription ${prescriptionId} has been dispensed and is ready for pickup.`,
      relatedPrescriptionId: prescriptionId,
      priority: 'Medium',
    });
  } catch (error) {
    console.error('Error notifying patient:', error);
  }
};

/**
 * Notify about payment failure (Extension 6a)
 */
export const notifyPaymentFailed = async (paymentId, userId, reason) => {
  try {
    await Notification.create({
      recipientId: userId,
      type: 'PAYMENT_FAILED',
      title: 'Payment Failed',
      message: `Your payment failed: ${reason}. Please try again or use an alternate payment method.`,
      relatedPaymentId: paymentId,
      priority: 'High',
      metadata: { reason },
    });
  } catch (error) {
    console.error('Error notifying about payment failure:', error);
  }
};

/**
 * Notify doctor about patient triage and admission (UC-004 Step 8)
 */
export const notifyPatientAdmission = async (doctorId, nurseId, patientName, bedNumber, ward, triageRecordId) => {
  return notifyDoctor({
    doctorId,
    senderId: nurseId,
    type: 'PATIENT_ADMITTED',
    title: 'Patient Admission Notification',
    message: `Patient ${patientName} has been admitted to bed ${bedNumber} in ${ward}. Please review triage status and patient details.`,
    priority: 'High',
    metadata: { patientName, bedNumber, ward, triageRecordId },
  });
};

/**
 * Send appointment confirmation (UC-002 Step 7)
 * Sends confirmation via SMS/Email/App with appointment details
 */
export const sendAppointmentConfirmation = async (options) => {
  const {
    appointmentId,
    patientId,
    patientName,
    patientEmail,
    doctorName,
    doctorSpecialization,
    date,
    time,
    department,
    reason,
  } = options;

  try {
    // Create in-app notification
    await Notification.create({
      recipientId: patientId,
      type: 'GENERAL',
      title: 'Appointment Confirmed',
      message: `Your appointment with Dr. ${doctorName} (${doctorSpecialization}) is confirmed for ${new Date(date).toLocaleDateString()} at ${time}.`,
      priority: 'Medium',
      metadata: {
        appointmentId,
        doctorName,
        doctorSpecialization,
        date,
        time,
        department,
        reason,
      },
    });

    // TODO: In production, integrate with:
    // - Email service (SendGrid, AWS SES, etc.) to send confirmation email
    // - SMS service (Twilio, AWS SNS, etc.) to send SMS confirmation
    // - Push notification service for mobile app
    
    console.log(`Appointment confirmation sent to ${patientName} (${patientEmail})`);
    console.log(`Appointment: ${appointmentId} - ${doctorName} on ${date} at ${time}`);

    return true;
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    // Don't throw - this is a non-critical operation
    return false;
  }
};
