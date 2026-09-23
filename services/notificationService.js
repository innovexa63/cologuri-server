/**
 * Notification and Bangladeshi Payment Gateway Integration Stubs
 */

export const notificationService = {
  /**
   * Send SMS Notification (SSL Wireless / Alpha SMS / Bulk SMS API)
   */
  async sendSMS(phoneNumber, message) {
    console.log(`[SMS Gateway Mock] Sending SMS to ${phoneNumber}: "${message}"`);
    // In production, invoke API:
    // const res = await fetch('https://api.sms-provider.com/send', { method: 'POST', body: ... })
    return { success: true, messageId: 'SMS-' + Date.now() };
  },

  /**
   * Send Booking Confirmation SMS with Reference
   */
  async sendBookingConfirmationSMS(phoneNumber, { tourTitle, seats, bookingReference, totalAmount }) {
    const text = `ঘুরবেসবাই: আপনার ${tourTitle} ট্যুরে ${seats.join(', ')} নং সিট বুকিং সফল হয়েছে। বুকিং আইডি: ${bookingReference}। মোট: ৳${totalAmount}। ধন্যবাদ!`;
    return this.sendSMS(phoneNumber, text);
  },

  /**
   * Initiate bKash / SSLCommerz Payment
   */
  async initiatePayment({ bookingReference, amount, paymentMethod }) {
    console.log(`[Payment Gateway Mock] Initiating ${paymentMethod} for Booking: ${bookingReference} Amount: ৳${amount}`);
    return {
      success: true,
      paymentUrl: `https://mock-payment-gateway.com/pay/${bookingReference}`,
      transactionId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
    };
  },
};
