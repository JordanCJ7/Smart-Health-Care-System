import paypal from 'paypal-rest-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure PayPal SDK
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

export default paypal;
