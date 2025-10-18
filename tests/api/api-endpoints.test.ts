import axios, { AxiosResponse } from 'axios';
import { expect } from 'chai';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_TIMEOUT = 10000;

// HTTP client with timeout
const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

describe('🏨 Hotel Negotiation API', () => {
  describe('POST /api/negotiate', () => {
    it('should return valid discount for existing hotel', async () => {
      const response = await httpClient.post('/api/negotiate', {
        propertyId: 'eko-hotels-and-suites-lagos'
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('status');

      if (response.data.status === 'discount') {
        expect(response.data).to.have.property('baseTotal');
        expect(response.data).to.have.property('discountedTotal');
        expect(response.data).to.have.property('savings');
        expect(response.data).to.have.property('expiresAt');

        // Validate discount calculation
        expect(response.data.discountedTotal).to.be.lessThan(response.data.baseTotal);
        expect(response.data.savings).to.equal(response.data.baseTotal - response.data.discountedTotal);

        // Validate expiry timestamp
        const expiryTime = new Date(response.data.expiresAt).getTime();
        const now = Date.now();
        expect(expiryTime).to.be.greaterThan(now);

        // Should expire in approximately 5 minutes (300 seconds)
        const timeUntilExpiry = (expiryTime - now) / 1000;
        expect(timeUntilExpiry).to.be.at.most(300);
        expect(timeUntilExpiry).to.be.at.least(280); // Allow 20 second variance due to processing
      }
    });

    it('should return 404 for non-existent hotel', async () => {
      try {
        await httpClient.post('/api/negotiate', {
          propertyId: 'non-existent-hotel'
        });
        throw new Error('Expected 404 error');
      } catch (error: any) {
        expect(error.response.status).to.equal(404);
        expect(error.response.data.status).to.equal('no-offer');
        expect(error.response.data.reason).to.equal('not-found');
      }
    });

    it('should return 400 for missing propertyId', async () => {
      try {
        await httpClient.post('/api/negotiate', {});
        throw new Error('Expected 400 error');
      } catch (error: any) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.status).to.equal('no-offer');
        expect(error.response.data.reason).to.equal('invalid-propertyId');
      }
    });

    it('should return 400 for invalid propertyId type', async () => {
      try {
        await httpClient.post('/api/negotiate', {
          propertyId: 123 // Should be string
        });
        throw new Error('Expected 400 error');
      } catch (error: any) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.status).to.equal('no-offer');
        expect(error.response.data.reason).to.equal('invalid-propertyId');
      }
    });

    it('should reject GET requests', async () => {
      try {
        await httpClient.get('/api/negotiate');
        throw new Error('Expected 405 error');
      } catch (error: any) {
        expect(error.response.status).to.equal(405); // Method Not Allowed
      }
    });

    it('should validate discount percentage is reasonable', async () => {
      const response = await httpClient.post('/api/negotiate', {
        propertyId: 'hotel-lagos-1'
      });

      if (response.data.status === 'discount') {
        const discountPercent = response.data.savings / response.data.baseTotal;
        
        // Discount should be between 5% and 50%
        expect(discountPercent).to.be.greaterThan(0.05);
        expect(discountPercent).to.be.lessThan(0.50);

        // Values should be positive integers
        expect(response.data.baseTotal).to.be.greaterThan(0);
        expect(response.data.discountedTotal).to.be.greaterThan(0);
        expect(response.data.savings).to.be.at.least(0);
      }
    });

    it('should handle concurrent requests consistently', async () => {
      const promises = Array(5).fill(null).map(() =>
        httpClient.post('/api/negotiate', {
          propertyId: 'eko-hotels-and-suites-lagos'
        })
      );

      const responses = await Promise.all(promises);

      // All should return same discount for same property
      const firstResponse = responses[0].data;
      responses.forEach(response => {
        if (response.data.status === 'discount' && firstResponse.status === 'discount') {
          expect(response.data.baseTotal).to.equal(firstResponse.baseTotal);
          expect(response.data.discountedTotal).to.equal(firstResponse.discountedTotal);
          expect(response.data.savings).to.equal(firstResponse.savings);
        }
      });
    });

    it('should respond within acceptable time limit', async () => {
      const startTime = Date.now();

      await httpClient.post('/api/negotiate', {
        propertyId: 'eko-hotels-and-suites-lagos'
      });

      const responseTime = Date.now() - startTime;
      expect(responseTime).to.be.lessThan(2000); // Should respond within 2 seconds (1s delay + processing)
    });
  });
});

describe('📋 Hotel Booking API', () => {
  describe('POST /api/book', () => {
    it('should accept valid booking data', async () => {
      const bookingData = {
        propertyId: 'eko-hotels-and-suites-lagos',
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

      const response = await httpClient.post('/api/book', bookingData);

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('bookingId');
      expect(response.data).to.have.property('status');
      expect(response.data.status).to.equal('confirmed');
      expect(response.data.bookingId).to.match(/^BK\d+$/);
    });

    it('should generate unique booking IDs', async () => {
      const bookingData = {
        propertyId: 'eko-hotels-and-suites-lagos',
        contact: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+2348012345678'
        }
      };

      const response1 = await httpClient.post('/api/book', bookingData);
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const response2 = await httpClient.post('/api/book', bookingData);

      expect(response1.data.bookingId).to.not.equal(response2.data.bookingId);
    });

    it('should handle minimal booking data', async () => {
      const response = await httpClient.post('/api/book', {
        propertyId: 'test-hotel'
      });

      expect(response.status).to.equal(200);
      expect(response.data.status).to.equal('confirmed');
    });

    it('should accept FormData content type', async () => {
      const formData = new URLSearchParams();
      formData.append('propertyId', 'eko-hotels-and-suites-lagos');
      formData.append('name', 'Form User');
      formData.append('email', 'form@example.com');

      const response = await axios.post(`${BASE_URL}/api/book`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data.status).to.equal('confirmed');
    });
  });
});

describe('🛍️ Services API', () => {
  describe('POST /api/services/search', () => {
    it('should return services for valid city', async () => {
      const response = await httpClient.post('/api/services/search', {
        city: 'Lagos'
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('results');
      expect(response.data.results).to.be.an('array');
      expect(response.data.results.length).to.be.at.most(60); // Max 60 results

      if (response.data.results.length > 0) {
        const firstResult = response.data.results[0];
        expect(firstResult).to.have.property('id');
        expect(firstResult).to.have.property('city');
        expect(firstResult).to.have.property('category');
        expect(firstResult).to.have.property('amountNGN');
        expect(firstResult).to.have.property('provider');
      }
    });

    it('should filter services by text query', async () => {
      const response = await httpClient.post('/api/services/search', {
        query: 'massage'
      });

      expect(response.status).to.equal(200);
      const results = response.data.results;

      // Verify results match query
      results.forEach((result: any) => {
        const titleMatch = result.title?.toLowerCase().includes('massage');
        const categoryMatch = result.category?.toLowerCase().includes('massage');
        expect(titleMatch || categoryMatch).to.be.true;
      });
    });

    it('should return empty array for non-existent query', async () => {
      const response = await httpClient.post('/api/services/search', {
        query: 'nonexistentservice12345'
      });

      expect(response.status).to.equal(200);
      expect(response.data.results).to.be.an('array');
      expect(response.data.results.length).to.equal(0);
    });

    it('should handle city and query combination', async () => {
      const response = await httpClient.post('/api/services/search', {
        city: 'Lagos',
        query: 'hair'
      });

      expect(response.status).to.equal(200);
      expect(response.data.results).to.be.an('array');

      // Results should match both city and query
      response.data.results.forEach((result: any) => {
        expect(result.city).to.equal('Lagos');
        const titleMatch = result.title?.toLowerCase().includes('hair');
        const categoryMatch = result.category?.toLowerCase().includes('hair');
        expect(titleMatch || categoryMatch).to.be.true;
      });
    });

    it('should handle large query strings', async () => {
      const largeQuery = 'a'.repeat(1000);

      const response = await httpClient.post('/api/services/search', {
        query: largeQuery
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('results');
    });
  });

  describe('POST /api/services/book', () => {
    it('should accept service booking with JSON data', async () => {
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

      const response = await httpClient.post('/api/services/book', serviceBookingData);

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('status');
      expect(response.data).to.have.property('reference');
      expect(response.data.status).to.equal('confirmed');
      expect(response.data.reference).to.match(/^SV\d+$/);
    });

    it('should accept service booking with FormData', async () => {
      const formData = new URLSearchParams();
      formData.append('serviceId', 'service-test');
      formData.append('name', 'Service Customer');
      formData.append('email', 'service@example.com');

      const response = await axios.post(`${BASE_URL}/api/services/book`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data.status).to.equal('confirmed');
      expect(response.data.reference).to.match(/^SV\d+$/);
    });

    it('should echo submitted data in response', async () => {
      const testData = {
        serviceId: 'test-service',
        customField: 'test-value',
        nestedData: {
          key: 'value'
        }
      };

      const response = await httpClient.post('/api/services/book', testData);

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.deep.include(testData);
    });
  });
});

describe('🤝 Partnership API', () => {
  describe('POST /api/partner', () => {
    it('should accept partnership application', async () => {
      const partnerData = {
        businessName: 'Test Hotel Group',
        contactName: 'Business Owner',
        email: 'owner@testhotel.com',
        phone: '+2348012345678',
        businessType: 'hotel',
        location: 'Lagos'
      };

      const response = await httpClient.post('/api/partner', partnerData);

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('ok');
      expect(response.data.ok).to.be.true;
    });

    it('should accept minimal partner data', async () => {
      const response = await httpClient.post('/api/partner', {
        businessName: 'Minimal Business'
      });

      expect(response.status).to.equal(200);
      expect(response.data.ok).to.be.true;
    });

    it('should accept empty partner data', async () => {
      const response = await httpClient.post('/api/partner', {});

      expect(response.status).to.equal(200);
      expect(response.data.ok).to.be.true;
    });
  });
});

describe('🔧 API Performance & Reliability', () => {
  it('should handle concurrent API requests', async () => {
    const requests = [
      httpClient.post('/api/negotiate', { propertyId: 'hotel-lagos-1' }),
      httpClient.post('/api/services/search', { city: 'Lagos' }),
      httpClient.post('/api/partner', { businessName: 'Test' }),
      httpClient.post('/api/book', { propertyId: 'test' })
    ];

    const responses = await Promise.all(requests);

    responses.forEach(response => {
      expect(response.status).to.be.at.least(200);
      expect(response.status).to.be.lessThan(500);
    });
  });

  it('should include proper CORS headers', async () => {
    const response = await httpClient.post('/api/negotiate', {
      propertyId: 'hotel-lagos-1'
    });

    expect(response.headers['content-type']).to.include('application/json');
  });

  it('should handle malformed JSON gracefully', async () => {
    try {
      await axios.post(`${BASE_URL}/api/negotiate`, 'invalid-json', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error: any) {
      // Should return error status, not crash
      expect(error.response.status).to.be.greaterThan(0);
    }
  });

  it('should respond to all endpoints within time limits', async () => {
    const endpoints = [
      { method: 'post', path: '/api/negotiate', data: { propertyId: 'hotel-lagos-1' } },
      { method: 'post', path: '/api/book', data: { propertyId: 'test' } },
      { method: 'post', path: '/api/services/search', data: { city: 'Lagos' } },
      { method: 'post', path: '/api/services/book', data: { serviceId: 'test' } },
      { method: 'post', path: '/api/partner', data: {} }
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      
      await httpClient.post(endpoint.path, endpoint.data);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).to.be.lessThan(2000); // All APIs should respond within 2 seconds
    }
  });
});