const segments = [
  'Попробуйте локальные рынки и авторские бары, чтобы прочувствовать атмосферу.',
  'Заложите часть бюджета на экспресс-экскурсии — они экономят время и деньги.',
  'Планируйте дневные активности рядом друг с другом, чтобы меньше тратить на транспорт.',
  'Выделите вечер на гастрономический опыт: дегустация вин, фьюжн-кухня или стрит-фуд.',
  'Для экономии на перелётах бронируйте ночные рейсы и выбирайте ручную кладь.',
  'Распределите резерв на непредвиденные расходы и страховку — это снимает стресс.',
];

const labelByKey = {
  flights: 'Перелёты',
  lodging: 'Жильё',
  food: 'Еда',
  local: 'Локальные активности',
  buffer: 'Резерв',
};

const deterministicRebalance = ({ current, lock = [], preferences = {}, chatContext = '' }) => {
  const keys = ['flights', 'lodging', 'food', 'local', 'buffer'];
  const lockSet = new Set(lock);
  const result = { ...current };
  const lockedSum = keys.reduce((sum, key) => sum + (lockSet.has(key) ? current[key] || 0 : 0), 0);
  const pool = Math.max(0, 100 - lockedSum);
  const mentions = {
    food: /еда|кухн|restaurant|food/i.test(chatContext) ? 1.2 : 1,
    lodging: /жиль|отел|apartment/i.test(chatContext) ? 1.15 : 1,
    flights: /перелет|flight|avia/i.test(chatContext) ? 1.15 : 1,
    local: /экскурс|activity|развлеч/i.test(chatContext) ? 1.2 : 1,
    buffer: /резерв|страхов/i.test(chatContext) ? 1.1 : 1,
  };

  const weights = {
    flights: 1 + (preferences.party || 0) * 0.002,
    lodging: 1 + (preferences.culture || 0) * 0.002,
    food: 1.1 + (preferences.party || 0) * 0.003,
    local: 1 + (preferences.nature || 0) * 0.003,
    buffer: 0.8,
  };

  const adjustableKeys = keys.filter((key) => !lockSet.has(key));
  const weightSum = adjustableKeys.reduce((sum, key) => sum + (weights[key] * mentions[key] || 1), 0) || 1;
  adjustableKeys.forEach((key) => {
    result[key] = Math.round((pool * weights[key] * mentions[key]) / weightSum);
  });
  const total = keys.reduce((sum, key) => sum + result[key], 0);
  if (total !== 100) {
    result.buffer = Math.max(0, (result.buffer || 0) + (100 - total));
  }
  return result;
};

const buildAdvice = (payload, breakdown) => {
  const lines = [];
  lines.push(
    `### Маршрут: ${payload.origin ?? 'Город отправления не указан'} → ${
      payload.city?.name ?? 'не выбран'
    }${payload.city?.country ? ', ' + payload.city.country : ''}`,
  );
  if (payload.startDate && payload.endDate) {
    lines.push(`**Даты:** ${payload.startDate} — ${payload.endDate}`);
  }
  lines.push('');
  lines.push(
    `**Бюджет:** ${
      payload.budget ? `${payload.budget} $` : 'не указан'
    }. Распределение (в %): перелёты ${breakdown.flights}, жильё ${breakdown.lodging}, еда ${breakdown.food}, активности ${breakdown.local}, резерв ${breakdown.buffer}.`,
  );
  lines.push('');
  const recommendations = segments.slice(0, 3 + Math.floor(Math.random() * 2));
  recommendations.forEach((tip, index) => {
    lines.push(`${index + 1}. ${tip}`);
  });
  return lines.join('\n');
};

const travelBotService = {
  askQuestion: async (payload) => {
    const breakdown = payload.budgetBreakdown || {
      flights: 35,
      lodging: 30,
      food: 20,
      local: 10,
      buffer: 5,
    };
    const answer = buildAdvice(payload, breakdown);
    return { answer };
  },

  rebalance: async (payload) => {
    const breakdown = deterministicRebalance(payload);
    const changedKey =
      payload.lock?.length === 5
        ? null
        : Object.keys(breakdown).find(
            (key) => Math.abs((payload.current?.[key] || 0) - breakdown[key]) > 1,
          );
    const note = changedKey
      ? `Категория «${labelByKey[changedKey]}» скорректирована для соблюдения общего бюджета.`
      : undefined;
    return { breakdown, note };
  },
};

module.exports = { travelBotService };

