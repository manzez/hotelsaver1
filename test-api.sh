#!/bin/bash
echo "Testing negotiate API..."
sleep 2
curl -X POST http://localhost:3000/api/negotiate \
     -H "Content-Type: application/json" \
     -d '{"propertyId":"transcorp-hilton-abuja-abuja"}' \
     -w "\nHTTP Status: %{http_code}\n"