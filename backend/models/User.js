const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { inMemoryStore } = require('../config/db');

// Mongoose Schema for MongoDB
let UserModel = null;
try {
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    homeCity: { type: String, default: 'Delhi' },
    preferredCurrency: { type: String, default: 'INR' },
    travelPreferences: {
      transport: { type: String, default: 'metro' },
      interests: [{ type: String }],
      pace: { type: String, default: 'balanced' }
    },
    createdAt: { type: Date, default: Date.now }
  });

  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

  UserModel = mongoose.models.User || mongoose.model('User', userSchema);
} catch (e) {
  // Schema definition handled
}

// In-Memory User Repository Wrapper
class UserRepository {
  static async findByEmail(email) {
    if (mongoose.connection.readyState === 1 && UserModel) {
      return await UserModel.findOne({ email: email.toLowerCase() });
    }
    const user = Array.from(inMemoryStore.users.values()).find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );
    return user || null;
  }

  static async findById(id) {
    if (mongoose.connection.readyState === 1 && UserModel) {
      return await UserModel.findById(id).select('-password');
    }
    const user = inMemoryStore.users.get(id.toString());
    if (user) {
      const { password, ...rest } = user;
      return rest;
    }
    return null;
  }

  static async create(userData) {
    if (mongoose.connection.readyState === 1 && UserModel) {
      const user = new UserModel(userData);
      return await user.save();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    const user = {
      _id: id,
      id,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      homeCity: userData.homeCity || 'Delhi',
      preferredCurrency: userData.preferredCurrency || 'INR',
      travelPreferences: userData.travelPreferences || {
        transport: 'metro',
        interests: ['landmarks', 'food'],
        pace: 'balanced'
      },
      createdAt: new Date()
    };

    inMemoryStore.users.set(id, user);
    return user;
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = {
  UserModel,
  UserRepository
};
