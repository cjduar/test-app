#!/bin/bash

set -e  # Stop if any command fails

VENV_DIR="backend/venv"
REQUIREMENTS_FILE="backend/requirements.txt"
if [ -x "/opt/homebrew/bin/python3" ]; then
  PYTHON_BIN="/opt/homebrew/bin/python3"
else
  echo "❌ Homebrew Python not found. Please install it with: brew install python"
  exit 1
fi

echo "✅ Using Python at: $PYTHON_BIN"
$PYTHON_BIN --version

echo "🔄 Updating Python with Homebrew..."
brew update
brew upgrade python3

echo "✅ Python upgraded. Version is now:"
$PYTHON_BIN --version

echo "🧼 Removing old virtual environment (if exists)..."
rm -rf "$VENV_DIR"

echo "🚀 Creating new virtual environment with latest Python..."
$PYTHON_BIN -m venv "$VENV_DIR"

echo "📦 Activating venv and installing requirements..."
source "$VENV_DIR/bin/activate"
pip install --upgrade pip

if [ -f "$REQUIREMENTS_FILE" ]; then
    pip install -r "$REQUIREMENTS_FILE"
else
    echo "⚠️ No requirements.txt found at $REQUIREMENTS_FILE. Skipping install."
fi

echo "✅ Done! Venv at '$VENV_DIR' now uses Python:"
python --version
