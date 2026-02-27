const User = require('../models/User');
const Mentor = require('../models/Mentor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('../config/jwt');

exports.signup = async (req, res) => {
  try {
    const { password, email } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ msg: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ ...req.body, password: hashed });

    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn });
    res.json({ token, user: { id: user._id, role: user.role, email: user.email, name: user.name } });
  } catch (e) {
    res.status(500).json({ msg: 'Signup failed', error: e.message });
  }
};

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
