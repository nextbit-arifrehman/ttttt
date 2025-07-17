const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body; // amount in cents

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be a positive number' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      // In the latest API version, the PaymentIntent is confirmed on the client
      // and does not require a confirmation_method.
      // automatic_payment_methods: {
      //   enabled: true,
      // },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
};