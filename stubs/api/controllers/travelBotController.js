const { travelBotService } = require('../services/travelBotService');

const travelBotController = {
  ask: async (req, res) => {
    const body = req.body || {};
    if (!body.question) {
      return res.status(400).json({ success: false, error: 'question обязателен' });
    }
    try {
      const response = await travelBotService.askQuestion(body);
      res.json({ success: true, data: response });
    } catch (error) {
      res.status(500).json({ success: false, error: 'TravelBot временно недоступен' });
    }
  },

  rebalance: async (req, res) => {
    const body = req.body || {};
    if (typeof body.budget !== 'number' || !body.current) {
      return res.status(400).json({ success: false, error: 'budget и current обязательны' });
    }
    try {
      const response = await travelBotService.rebalance(body);
      res.json({ success: true, data: response });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Не удалось пересчитать бюджет' });
    }
  },
};

module.exports = { travelBotController };

