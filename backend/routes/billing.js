const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/checkout-session', auth.protect, async (req, res) => {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return res.status(500).json({ error: 'Stripe not configured' });
    const Stripe = require('stripe');
    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

    const { priceId } = req.body;
    const price = priceId || process.env.STRIPE_PRICE_ID_BASIC;
    if (!price) return res.status(400).json({ error: 'Missing priceId' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: `${req.headers.origin || 'http://localhost:3000'}/recommendations?upgrade=success`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/recommendations?upgrade=cancel`,
      metadata: { userId: req.user.id },
      allow_promotion_codes: true,
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

module.exports = router;
