const { v4: uuidv4 } = require('uuid');

class TripModel {
  constructor() {
    this.trips = [];
  }

  list() {
    return [...this.trips];
  }

  get(id) {
    return this.trips.find((trip) => trip.id === id);
  }

  save(tripData) {
    const trip = {
      id: uuidv4(),
      cityId: tripData.cityId,
      params: tripData.params,
      adjustedBudget: tripData.adjustedBudget,
      total: tripData.total,
      savedAt: new Date().toISOString(),
      userId: tripData.userId,
    };
    this.trips.unshift(trip);
    return trip;
  }

  remove(id, userId) {
    const index = this.trips.findIndex((trip) => trip.id === id);
    if (index === -1) {
      return false;
    }
    const target = this.trips[index];
    if (userId && target.userId && target.userId !== userId) {
      return false;
    }
    this.trips.splice(index, 1);
    return true;
  }
}

const tripModel = new TripModel();

module.exports = { tripModel };

