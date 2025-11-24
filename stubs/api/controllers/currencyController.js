const { currencyModel } = require('../models/currencyModel');

const currencyController = {
  rates: (req, res) => {
    res.json({ success: true, data: currencyModel.getRates() });
  },

  convert: (req, res) => {
    const { amount, from, to } = req.query;
    if (!amount || !from || !to) {
      return res.status(400).json({ success: false, error: 'Параметры amount, from, to обязательны' });
    }
    try {
      const result = currencyModel.convert(Number(amount), String(from), String(to));
      res.json({
        success: true,
        data: {
          amount: Number(amount),
          from,
          to,
          result,
        },
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },
};

module.exports = { currencyController };

