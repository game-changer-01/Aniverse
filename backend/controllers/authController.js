const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const { sendAdminNotification, sendUserWelcomeEmail, sendVerificationRequest } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      verified: user.verified,
      premium: user.premium,
      isAdmin: user.isAdmin,
      picture: user.picture || user.avatar,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    // Check if user exists by email OR username
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    }).select('+password');
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', user.email);
    console.log('Stored password hash:', user.password.substring(0, 20) + '...');
    console.log('Attempting password comparison...');

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      // Check if this was a Google OAuth user (their password might not be set properly)
      if (user.picture && user.picture.includes('googleusercontent.com')) {
        console.log('Detected Google OAuth user');
        return res.status(401).json({ 
          error: 'This account was created with Google. Please sign in with Google instead.',
          useGoogle: true 
        });
      }
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful for:', email);

    // Update last active timestamp
    user.lastActive = Date.now();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      verified: user.verified,
      premium: user.premium,
      isAdmin: user.isAdmin,
      picture: user.picture || user.avatar,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Google Sign-In: verify ID token and mint our JWT
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body; // Google ID token from client
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    if (!credential || !clientId) return res.status(400).json({ error: 'Missing Google credential or client id' });

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    const picture = payload.picture || '';

    let user = await User.findOne({ email });
    let isNewUser = false;
    
    if (!user) {
      // Create new user for Google OAuth
      // Generate a random password and hash it properly
      const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      user = await User.create({ 
        username: name.replace(/\s+/g, '').toLowerCase().slice(0,30), 
        email, 
        password: hashedPassword, // Store hashed password
        avatar: picture,
        verified: false, // Google users start unverified and need admin approval
        picture: picture // Store Google profile picture
      });
      isNewUser = true;
    } else {
      // Update existing user's picture if they have one from Google
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        user.picture = picture;
        await user.save();
      }
    }

    // Send notifications for new users or verification requests
    try {
      if (isNewUser) {
        // Send admin notification about new Google user
        await sendAdminNotification({
          _id: user._id,
          username: user.username,
          email: user.email,
          picture: picture
        }, 'google');
        
        // Send welcome email to user
        await sendUserWelcomeEmail(user);
        
        console.log(`📧 Admin notified about new Google user: ${user.email}`);
      } else if (!user.verified) {
        // For existing unverified users, send verification request
        await sendVerificationRequest(user);
        console.log(`🔐 Verification request sent for user: ${user.email}`);
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the login if email fails
    }

    const token = generateToken(user._id);
    res.json({ 
      _id: user._id, 
      username: user.username, 
      email: user.email, 
      verified: user.verified,
      premium: user.premium,
      picture: user.picture || user.avatar,
      token 
    });
  } catch (error) {
    res.status(401).json({ error: error.message || 'Google authentication failed' });
  }
};