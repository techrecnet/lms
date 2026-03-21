const User = require('../models/User');
const Mentor = require('../models/Mentor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('../config/jwt');
const crypto = require('crypto')
const mailer = require('../services/mail.service')

exports.signup = async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ msg: 'Email already in use' });

    // generate a random password server-side and store its hash
    const plainPassword = crypto.randomBytes(6).toString('hex'); // 12 hex chars
    const hashed = await bcrypt.hash(plainPassword, 10);
    const user = await User.create({ ...req.body, password: hashed });

    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn });
    // send welcome email including the generated password (fire-and-forget)
    try { mailer.sendSignupMail(user, plainPassword).catch(() => {}) } catch (e) {}

    res.json({ token, user: { id: user._id, role: user.role, email: user.email, name: user.name } });
  } catch (e) {
    res.status(500).json({ msg: 'Signup failed', error: e.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, captchaToken } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ msg: 'If the email exists, a reset link will be sent' });

    // verify reCAPTCHA if token provided and secret present
    if (captchaToken && process.env.RECAPTCHA_SECRET) {
      try {
        const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET, response: captchaToken })
        })
        const j = await r.json()
        if (!j.success) return res.status(400).json({ msg: 'Captcha verification failed' })
      } catch (e) {
        console.error('Captcha verify error', e.message || e)
        return res.status(400).json({ msg: 'Captcha verification failed' })
      }
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    try { await mailer.sendForgotPasswordMail(email, token) } catch (e) { console.error('Mail send failed', e.message) }
    res.json({ msg: 'If the email exists, a reset link will be sent' });
  } catch (e) {
    res.status(500).json({ msg: 'Failed', error: e.message });
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ msg: 'Token and new password required' });
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ msg: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ msg: 'Password reset successful' });
  } catch (e) {
    res.status(500).json({ msg: 'Failed', error: e.message });
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email exists in Mentor collection first
    let mentor = await Mentor.findOne({ email });
    if (mentor) {
      // Check if mentor is active
      if (!mentor.isActive) {
        return res.status(403).json({ msg: 'Your account has been deactivated. Please contact an administrator.' });
      }
      
      const match = await mentor.comparePassword(password);
      if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

      const token = jwt.sign({ id: mentor._id, role: 'mentor' }, secret, { expiresIn });
      return res.json({ 
        token, 
        user: { 
          id: mentor._id, 
          role: 'mentor', 
          email: mentor.email, 
          name: mentor.name 
        } 
      });
    }

    // Check User collection
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    if (user.isActive === false) return res.status(403).json({ msg: 'Account is inactive' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn });
    res.json({ token, user: { id: user._id, role: user.role, email: user.email, name: user.name } });
  } catch (e) {
    res.status(500).json({ msg: 'Login failed', error: e.message });
  }
};
