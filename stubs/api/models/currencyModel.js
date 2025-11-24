const { baseRates } = require('../data/currencies');

class CurrencyModel {
  constructor() {
    this.rates = { ...baseRates };
  }

  getRates() {
    return { ...this.rates };
  }

  convert(amount, from, to) {
    if (!this.rates[from] || !this.rates[to]) {
      throw new Error('Unsupported currency');
    }
    const usdAmount = amount / this.rates[from];
    return usdAmount * this.rates[to];
  }

  updateRates(nextRates) {
    this.rates = { ...this.rates, ...nextRates };
    return this.getRates();
  }
}

const currencyModel = new CurrencyModel();

module.exports = { currencyModel };

