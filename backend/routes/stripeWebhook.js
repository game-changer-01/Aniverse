const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Stripe requires the raw body to verify webhook signatures
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return res.status(500).send('Stripe not configured');

  const Stripe = require('stripe');
  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

  let event;
  try {
    if (secret) {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } else {
      // Unsafe fallback for local dev only
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'identity.verification_session.verified': {
        const vs = event.data.object;
        const userId = vs.metadata?.userId;
        if (userId) {
          await User.findByIdAndUpdate(userId, { $set: { verified: true } });
        }
        break;
      }
      case 'checkout.session.completed': {
        const sess = event.data.object;
        const userId = sess.metadata?.userId;
        if (userId) {
          await User.findByIdAndUpdate(userId, { $set: { premium: true, stripeCustomerId: sess.customer } });
        }
        break;
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.unpaid': {
        const sub = event.data.object;
        // Find user by customer id and clear premium
        const user = await User.findOne({ stripeCustomerId: sub.customer });
        if (user) await User.findByIdAndUpdate(user._id, { $set: { premium: false } });
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).send('Webhook handler error');
  }
});

module.exports = router;
