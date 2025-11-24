const { baseCities } = require('../data/cities');

class CityModel {
  constructor() {
    this.cities = baseCities.map((city) => ({ ...city }));
  }

  getAllCities() {
    return this.cities.map((city) => ({ ...city }));
  }

  getCityById(id) {
    return this.cities.find((city) => city.id === id);
  }

  searchCities(searchParams) {
    const days = Math.max(
      1,
      Math.ceil(
        (new Date(searchParams.endDate).getTime() -
          new Date(searchParams.startDate).getTime()) /
          86400000,
      ),
    );

    const prefSum =
      Math.max(
        1,
        (searchParams.prefCulture || 0) +
          (searchParams.prefNature || 0) +
          (searchParams.prefParty || 0),
      );

    return this.cities
      .map((city) => {
        const totalCost = days * city.avgDailyCost;
        const budgetFit = Math.min(100, (searchParams.budget / totalCost) * 100);
        const scores = city.scores || {
          culture: 60,
          nature: 60,
          party: 60,
        };
        const wC = (searchParams.prefCulture || 0) / prefSum;
        const wN = (searchParams.prefNature || 0) / prefSum;
        const wP = (searchParams.prefParty || 0) / prefSum;
        const factorScore = scores.culture * wC + scores.nature * wN + scores.party * wP;
        const combinedScore = budgetFit * 0.7 + (factorScore / 100) * 30;
        return { ...city, totalCost, budgetFit, combinedScore };
      })
      .filter((city) => city.budgetFit >= 50)
      .sort((a, b) => b.combinedScore - a.combinedScore);
  }
}

const cityModel = new CityModel();

module.exports = { cityModel };

