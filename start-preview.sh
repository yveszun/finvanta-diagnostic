#!/bin/bash
# Phase 4.1 Visual Acceptance Testing - Development Server
# Run this script to start the local preview

cd /projects/sandbox/finvanta-diagnostic

echo "=========================================="
echo "Phase 4.1 Visual Acceptance Testing"
echo "Branch: phase4-1-executive-ux"
echo "=========================================="
echo ""
echo "Starting Vite development server..."
echo ""

npm run dev -- --host 0.0.0.0 --port 5173

# Server will be available at:
# http://localhost:5173
# or
# http://0.0.0.0:5173
