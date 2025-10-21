#!/bin/bash

echo "🔍 Testing HotelSaver.ng API Documentation"
echo "============================================"

echo ""
echo "✅ Testing OpenAPI endpoint..."
curl -s -f http://localhost:3000/api/openapi > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ OpenAPI endpoint working: http://localhost:3000/api/openapi"
else
    echo "❌ OpenAPI endpoint failed"
    exit 1
fi

echo ""
echo "✅ Testing Interactive Docs page..."
curl -s -f http://localhost:3000/docs/api > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Interactive docs working: http://localhost:3000/docs/api"
else
    echo "❌ Interactive docs failed"
    exit 1
fi

echo ""
echo "🎉 API Documentation Setup Complete!"
echo ""
echo "📚 Available Documentation:"
echo "  • Full API Guide: /API_DOCUMENTATION.md"
echo "  • OpenAPI Spec: http://localhost:3000/api/openapi" 
echo "  • Interactive Docs: http://localhost:3000/docs/api"
echo "  • Swagger UI with live testing capabilities"
echo ""
echo "🔗 Key Features:"
echo "  • Complete endpoint documentation"
echo "  • Request/response examples"
echo "  • Authentication guide"
echo "  • Interactive testing interface"
echo "  • Nigerian business logic explained"
echo ""