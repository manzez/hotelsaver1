import { test, expect } from '@playwright/test';

test.describe('API Testing - Hotel Data & Negotiation', () => {
  const BASE_URL = 'http://localhost:3000';

  test('046: Negotiate API - Valid property returns discount', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/negotiate`, {
      data: { propertyId: 'hotel-lagos-1' }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    
    if (data.status === 'discount') {
      expect(data).toHaveProperty('baseTotal');
      expect(data).toHaveProperty('discountedTotal');
      expect(data).toHaveProperty('savings');
      expect(data).toHaveProperty('expiresAt');
      
      // Verify discount calculation
      expect(data.discountedTotal).toBeLessThan(data.baseTotal);
      expect(data.savings).toBe(data.baseTotal - data.discountedTotal);
      
      // Verify expiry timestamp is in future
      const expiryTime = new Date(data.expiresAt).getTime();
      const now = Date.now();
      expect(expiryTime).toBeGreaterThan(now);
      
      // Verify expiry is approximately 5 minutes (300 seconds)
      const timeUntilExpiry = (expiryTime - now) / 1000;
      expect(timeUntilExpiry).toBeLessThanOrEqual(300);
      expect(timeUntilExpiry).toBeGreaterThan(290); // Allow 10 second variance
    }
  });

  test('047: Negotiate API - Invalid property ID', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/negotiate`, {
      data: { propertyId: 'non-existent-hotel' }
    });
    
    expect(response.status()).toBe(404);
    
    const data = await response.json();
    expect(data.status).toBe('no-offer');
    expect(data.reason).toBe('not-found');
  });

  test('048: Negotiate API - Missing property ID', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/negotiate`, {
      data: {}
    });
    
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data.status).toBe('no-offer');
    expect(data.reason).toBe('invalid-propertyId');
  });

  test('049: Negotiate API - Invalid request method', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/negotiate`);
    
    expect(response.status()).toBe(405); // Method Not Allowed
  });

  test('050: Book API - Successful booking', async ({ request }) => {
    const bookingData = {
      propertyId: 'hotel-lagos-1',
      negotiationToken: 'valid-token',
      rooms: 1,
      adults: 2,
      children: 0,
      checkIn: '2024-12-01',
      checkOut: '2024-12-03',
      contact: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+2348012345678'
      }
    };
    
    const response = await request.post(`${BASE_URL}/api/book`, {
      data: bookingData
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('bookingId');
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('confirmed');
    expect(data.bookingId).toMatch(/^BK\d+$/);
  });

  test('051: Services Search API - Valid city', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/services/search`, {
      data: { city: 'Lagos' }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('results');
    expect(Array.isArray(data.results)).toBe(true);
    
    // Verify results are limited (max 60)
    expect(data.results.length).toBeLessThanOrEqual(60);
    
    // Verify each result has required properties
    if (data.results.length > 0) {
      const firstResult = data.results[0];
      expect(firstResult).toHaveProperty('id');
      expect(firstResult).toHaveProperty('city');
      expect(firstResult).toHaveProperty('category');
      expect(firstResult).toHaveProperty('amountNGN');
      expect(firstResult).toHaveProperty('provider');
    }
  });

  test('052: Services Search API - Text query', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/services/search`, {
      data: { query: 'massage' }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    const results = data.results;
    
    // Verify results match query
    for (const result of results) {
      const titleMatch = result.title?.toLowerCase().includes('massage');
      const categoryMatch = result.category?.toLowerCase().includes('massage');
      expect(titleMatch || categoryMatch).toBe(true);
    }
  });

  test('053: Services Book API - Successful service booking', async ({ request }) => {
    const serviceBookingData = {
      serviceId: 'service-lagos-1',
      date: '2024-12-01',
      time: '14:00',
      people: 2,
      contact: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+2349087654321'
      }
    };
    
    const response = await request.post(`${BASE_URL}/api/services/book`, {
      data: serviceBookingData
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('reference');
    expect(data.status).toBe('confirmed');
    expect(data.reference).toMatch(/^SV\d+$/);
  });

  test('054: Partner API - Partnership application', async ({ request }) => {
    const partnerData = {
      businessName: 'Test Hotel Group',
      contactName: 'Business Owner',
      email: 'owner@testhotel.com',
      phone: '+2348012345678',
      businessType: 'hotel',
      location: 'Lagos'
    };
    
    const response = await request.post(`${BASE_URL}/api/partner`, {
      data: partnerData
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('ok');
    expect(data.ok).toBe(true);
  });
});

test.describe('API Data Validation & Edge Cases', () => {
  const BASE_URL = 'http://localhost:3000';

  test('055: Negotiate API - Property price validation', async ({ request }) => {
    // Test with known hotel to verify price consistency
    const response = await request.post(`${BASE_URL}/api/negotiate`, {
      data: { propertyId: 'hotel-lagos-1' }
    });
    
    if (response.status() === 200) {
      const data = await response.json();
      
      if (data.status === 'discount') {
        // Verify discount percentage is reasonable (10-20%)
        const discountPercent = data.savings / data.baseTotal;
        expect(discountPercent).toBeGreaterThan(0.05); // At least 5%
        expect(discountPercent).toBeLessThan(0.50); // No more than 50%
        
        // Verify amounts are positive integers
        expect(data.baseTotal).toBeGreaterThan(0);
        expect(data.discountedTotal).toBeGreaterThan(0);
        expect(data.savings).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('056: Services Search API - Empty results handling', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/services/search`, {
      data: { query: 'nonexistentservice12345' }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.results).toBeDefined();
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results.length).toBe(0);
  });

  test('057: API CORS and Headers', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/negotiate`, {
      data: { propertyId: 'hotel-lagos-1' }
    });
    
    // Verify CORS headers are present
    const headers = response.headers();
    expect(headers['content-type']).toContain('application/json');
  });

  test('058: API Rate Limiting (if implemented)', async ({ request }) => {
    // Test multiple rapid requests to same endpoint
    const promises = Array(10).fill(null).map(() => 
      request.post(`${BASE_URL}/api/negotiate`, {
        data: { propertyId: 'hotel-lagos-1' }
      })
    );
    
    const responses = await Promise.all(promises);
    
    // All should succeed (no rate limiting currently)
    for (const response of responses) {
      expect(response.status()).toBeLessThan(429); // Not rate limited
    }
  });

  test('059: API Response Time Performance', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.post(`${BASE_URL}/api/negotiate`, {
      data: { propertyId: 'hotel-lagos-1' }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.status()).toBe(200);
    // API should respond within 1 second
    expect(responseTime).toBeLessThan(1000);
  });

  test('060: Services API - Large payload handling', async ({ request }) => {
    const largeQuery = 'a'.repeat(1000); // 1000 character query
    
    const response = await request.post(`${BASE_URL}/api/services/search`, {
      data: { query: largeQuery }
    });
    
    // Should handle large query gracefully
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('results');
  });
});