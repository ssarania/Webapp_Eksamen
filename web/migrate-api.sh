#!/bin/bash

# Migration script to clean up old API files
# Run this script from the web directory

echo "Cleaning up old API structure..."

# Remove old api.ts from services
if [ -f "src/services/api.ts" ]; then
    rm src/services/api.ts
    echo "✓ Removed src/services/api.ts"
fi

# Remove old api directory
if [ -d "src/api" ]; then
    rm -rf src/api
    echo "✓ Removed src/api directory"
fi

echo "Migration complete!"
echo ""
echo "New API structure:"
echo "  services/"
echo "    ├── index.ts           # Central exports"
echo "    ├── authService.ts     # Authentication"  
echo "    ├── quizService.ts     # Quiz operations"
echo "    └── attemptService.ts  # Quiz attempts"
