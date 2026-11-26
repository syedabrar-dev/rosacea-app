#!/bin/zsh
cd "$(dirname "$0")"

if [[ ! -x ".venv/bin/python" ]]; then
  echo "Backend environment not found. Create it and install backend/requirements.txt first."
  read -r "?Press Return to close..."
  exit 1
fi

echo "Starting DermaLens API at http://127.0.0.1:5000"
echo "Keep this window open while using the website."
echo "Open http://127.0.0.1:5000/health to confirm it is running."

if /usr/bin/curl --silent --fail --max-time 2 http://127.0.0.1:5000/health >/dev/null; then
  echo "DermaLens API is already running and healthy; you do not need a second copy."
  exit 0
fi

exec .venv/bin/python app.py
