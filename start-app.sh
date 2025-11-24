#!/bin/bash

#!/bin/bash

set -e

echo "🚀 Запуск Budget Compass (BroJS)..."
cd "$(dirname "$0")"

if ! command -v brojs >/dev/null 2>&1; then
  echo "ℹ️  Устанавливаем brojs CLI локально..."
  npm install
fi

echo "🌐 Поднимаем единый dev-сервер..."
npm run dev
