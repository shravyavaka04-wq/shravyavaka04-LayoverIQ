const mongoose = require('mongoose');
const { inMemoryStore } = require('../config/db');

// Mongoose Schema for MongoDB
let TripModel = null;
try {
  const tripSchema = new mongoose.Schema({
    userId: { type: String, required: false, default: 'guest' },
    title: { type: String, required: true },
    airportCode: { type: String, required: true },
    airportName: { type: String, required: true },
    city: { type: String, required: true },
    arrivalTime: { type: Date, required: true },
    departureTime: { type: Date, required: true },
    layoverDurationMinutes: { type: Number, required: true },
    usableExplorationMinutes: { type: Number, required: true },
    riskScore: { type: Number, required: true },
    riskLevel: { type: String, required: true },
    selectedAttractions: [{ type: Object }],
    timeline: [{ type: Object }],
    budgetBreakdown: { type: Object },
    isNewHere: { type: Boolean, default: false },
    hasCheckedLuggage: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  });

  TripModel = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
} catch (e) {
  // Schema handled
}

// In-Memory Trip Repository Wrapper
class TripRepository {
  static async create(tripData) {
    if (mongoose.connection.readyState === 1 && TripModel) {
      const trip = new TripModel(tripData);
      return await trip.save();
    }

    const id = 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const trip = {
      _id: id,
      id,
      ...tripData,
      createdAt: new Date()
    };

    inMemoryStore.trips.set(id, trip);
    return trip;
  }

  static async findByUser(userId) {
    if (mongoose.connection.readyState === 1 && TripModel) {
      return await TripModel.find({ userId }).sort({ createdAt: -1 });
    }
    const trips = Array.from(inMemoryStore.trips.values())
      .filter(t => t.userId === userId || userId === 'guest')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return trips;
  }

  static async findById(id) {
    if (mongoose.connection.readyState === 1 && TripModel) {
      return await TripModel.findById(id);
    }
    return inMemoryStore.trips.get(id.toString()) || null;
  }

  static async deleteById(id) {
    if (mongoose.connection.readyState === 1 && TripModel) {
      return await TripModel.findByIdAndDelete(id);
    }
    const deleted = inMemoryStore.trips.delete(id.toString());
    return { deleted };
  }
}

module.exports = {
  TripModel,
  TripRepository
};
