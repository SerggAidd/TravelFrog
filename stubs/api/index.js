const { Router } = require('express');
const cities = require('./routes/cities');
const trips = require('./routes/trips');
const currencies = require('./routes/currencies');
const travelbot = require('./routes/travelbot');
const auth = require('./routes/auth');

const api = Router();

api.use('/cities', cities);
api.use('/trips', trips);
api.use('/currencies', currencies);
api.use('/travelbot', travelbot);
api.use('/auth', auth);

module.exports = api;

