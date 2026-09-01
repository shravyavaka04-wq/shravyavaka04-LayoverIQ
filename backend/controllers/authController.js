const { UserRepository } = require('../models/User');
const { generateToken } = require('../middleware/auth');

/**
 * Register User
 */
const register = async (req, res) => {
  try {
    const { name, email, password, homeCity, preferredCurrency } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await UserRepository.create({
      name,
      email,
      password,
      homeCity: homeCity || 'Delhi',
      preferredCurrency: preferredCurrency || 'INR'
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        homeCity: user.homeCity,
        preferredCurrency: user.preferredCurrency
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Login User
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await UserRepository.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        homeCity: user.homeCity,
        preferredCurrency: user.preferredCurrency
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Demo Quick Login (One-click instant access for presentations)
 */
const demoLogin = async (req, res) => {
  try {
    let demoUser = await UserRepository.findByEmail('demo@layoveriq.travel');
    if (!demoUser) {
      demoUser = await UserRepository.create({
        name: 'Alex Vance (Layover Traveler)',
        email: 'demo@layoveriq.travel',
        password: 'Password123!',
        homeCity: 'Delhi',
        preferredCurrency: 'INR'
      });
    }

    const token = generateToken(demoUser);

    res.json({
      success: true,
      message: 'Demo login successful.',
      token,
      user: {
        id: demoUser._id || demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        homeCity: demoUser.homeCity,
        preferredCurrency: demoUser.preferredCurrency
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Profile
 */
const getProfile = async (req, res) => {
  try {
    if (req.user.isGuest) {
      return res.json({
        success: true,
        user: {
          id: 'guest',
          name: 'Guest Traveler',
          email: 'guest@layoveriq.travel',
          homeCity: 'Transit Hub',
          preferredCurrency: 'INR'
        }
      });
    }

    const user = await UserRepository.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  demoLogin,
  getProfile
};
