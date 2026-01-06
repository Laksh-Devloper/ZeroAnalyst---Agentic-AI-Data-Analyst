#!/bin/bash
# Render build script for InsightFlow backend

set -e  # Exit on error

echo "🔧 Upgrading pip..."
pip install --upgrade pip setuptools wheel

echo "📦 Installing dependencies (binary wheels only)..."
# Try to install only pre-built wheels first
pip install --prefer-binary --no-cache-dir -r requirements.txt

echo "✅ Build completed successfully!"
