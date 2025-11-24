const { tripModel } = require('../models/tripModel');

const tripController = {
  list: (req, res) => {
    res.json({ success: true, data: tripModel.list() });
  },

  get: (req, res) => {
    const trip = tripModel.get(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Маршрут не найден' });
    }
    res.json({ success: true, data: trip });
  },

  create: (req, res) => {
    const body = req.body || {};
    if (!body.cityId || !body.params || !body.adjustedBudget || typeof body.total !== 'number') {
      return res.status(400).json({ success: false, error: 'Неверные данные поездки' });
    }
    const trip = tripModel.save({
      cityId: body.cityId,
      params: body.params,
      adjustedBudget: body.adjustedBudget,
      total: body.total,
      userId: req.userId,
    });
    res.status(201).json({ success: true, data: trip });
  },

  remove: (req, res) => {
    const ok = tripModel.remove(req.params.id, req.userId);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Маршрут не найден' });
    }
    res.json({ success: true });
  },
};

module.exports = { tripController };

