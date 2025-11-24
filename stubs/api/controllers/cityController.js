const { cityModel } = require('../models/cityModel');

const cityController = {
  list: (req, res) => {
    try {
      const cities = cityModel.getAllCities();
      res.json({ success: true, data: cities });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Не удалось загрузить города' });
    }
  },

  get: (req, res) => {
    const city = cityModel.getCityById(req.params.id);
    if (!city) {
      return res.status(404).json({ success: false, error: 'Город не найден' });
    }
    res.json({ success: true, data: city });
  },

  search: (req, res) => {
    const { budget, startDate, endDate } = req.query;
    if (!budget || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'budget, startDate и endDate обязательны',
      });
    }
    try {
      const cities = cityModel.searchCities({
        budget: Number(budget),
        startDate: String(startDate),
        endDate: String(endDate),
        prefCulture: Number(req.query.prefCulture) || 50,
        prefNature: Number(req.query.prefNature) || 50,
        prefParty: Number(req.query.prefParty) || 50,
      });
      res.json({ success: true, data: cities });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Ошибка поиска' });
    }
  },
};

module.exports = { cityController };

