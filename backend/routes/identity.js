const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/session', auth.protect, async (req, res) => {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return res.status(500).json({ error: 'Stripe not configured' });
    const Stripe = require('stripe');
    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

    // Create a verification session for the authenticated user
    const session = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: { userId: req.user.id },
      options: {
        document: { require_matching_selfie: true }
      }
    });

    res.json({ client_secret: session.client_secret, sessionId: session.id });
  } catch (err) {
    console.error('Identity session error:', err);
    res.status(500).json({ error: 'Failed to create identity session' });
  }
});

module.exports = router;
