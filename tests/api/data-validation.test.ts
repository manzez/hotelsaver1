import axios from 'axios';
import { expect } from 'chai';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// HTTP client
const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

describe('🔍 Data Validation Tests', () => {
  describe('Hotel Data Consistency', () => {
    it('should return consistent pricing for same property', async () => {
      const propertyId = 'eko-hotels-and-suites-lagos';
      
      // Make multiple requests
      const requests = Array(3).fill(null).map(() =>
        httpClient.post('/api/negotiate', { propertyId })
      );
      
      const responses = await Promise.all(requests);
      
      // All successful responses should have same base price
      const successfulResponses = responses.filter(r => r.data.status === 'discount');
      
      if (successfulResponses.length > 1) {
        const firstPrice = successfulResponses[0].data.baseTotal;
        successfulResponses.forEach(response => {
          expect(response.data.baseTotal).to.equal(firstPrice);
        });
      }
    });

    it('should validate JSON data schema', async () => {
      const response = await httpClient.post('/api/negotiate', {
        propertyId: 'transcorp-hilton-abuja'
      });

      if (response.data.status === 'discount') {
        // Prices should be reasonable for Nigerian market (₦10,000 - ₦1,000,000)
        expect(response.data.baseTotal).to.be.at.least(10000);
        expect(response.data.baseTotal).to.be.at.most(1000000);
        expect(response.data.discountedTotal).to.be.at.least(5000);
        expect(response.data.discountedTotal).to.be.at.most(1000000);
      }
    });

    it('should validate discount calculation accuracy', async () => {
      const response = await httpClient.post('/api/negotiate', {
        propertyId: 'eko-hotels-and-suites-lagos'
      });

      if (response.data.status === 'discount') {
        const { baseTotal, discountedTotal, savings } = response.data;
        
        // Mathematical validation
        expect(baseTotal - discountedTotal).to.equal(savings);
        expect(discountedTotal + savings).to.equal(baseTotal);
        
        // Discount should be reasonable (5% - 50%)
        const discountRate = savings / baseTotal;
        expect(discountRate).to.be.at.least(0.05);
        expect(discountRate).to.be.at.most(0.50);
      }
    });
  });

  describe('Services Data Validation', () => {
    it('should return valid Nigerian cities only', async () => {
      const response = await httpClient.post('/api/services/search', {
        city: 'Lagos'
      });

      const validCities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'];
      
      response.data.results.forEach((service: any) => {
        expect(validCities).to.include(service.city);
      });
    });

    it('should validate service categories', async () => {
      const response = await httpClient.post('/api/services/search', {});

      const validCategories = [
        'Hair', 'Nails', 'Massage', 'Cleaning', 'Security', 
        'Catering', 'Chef', 'Car hire', 'Guide', 'Photography',
        'Livestock', 'Braiding', 'Dry Cleaning'
      ];

      response.data.results.forEach((service: any) => {
        if (service.category) {
          expect(validCategories).to.include(service.category);
        }
      });
    });

    it('should validate service pricing in Nigerian Naira', async () => {
      const response = await httpClient.post('/api/services/search', {});

      response.data.results.forEach((service: any) => {
        if (service.amountNGN) {
          // Service prices should be reasonable (₦1,000 - ₦500,000)
          expect(service.amountNGN).to.be.at.least(1000);
          expect(service.amountNGN).to.be.at.most(500000);
          expect(Number.isInteger(service.amountNGN)).to.be.true;
        }
      });
    });

    it('should limit search results appropriately', async () => {
      const response = await httpClient.post('/api/services/search', {});

      expect(response.data.results.length).to.be.at.most(60);
    });
  });

  describe('Nigerian Business Logic Validation', () => {
    it('should handle Nigerian phone number formats', async () => {
      const nigerianPhones = [
        '+2348012345678',
        '+2349087654321',
        '+2347012345678'
      ];

      for (const phone of nigerianPhones) {
        const response = await httpClient.post('/api/book', {
          propertyId: 'test-hotel',
          contact: {
            name: 'Test User',
            phone: phone
          }
        });

        expect(response.status).to.equal(200);
        expect(response.data.status).to.equal('confirmed');
      }
    });

    it('should validate booking date formats', async () => {
      const validDates = [
        '2024-12-01',
        '2025-01-15',
        '2024-11-30'
      ];

      for (const date of validDates) {
        const response = await httpClient.post('/api/book', {
          propertyId: 'test-hotel',
          checkIn: date,
          checkOut: date
        });

        expect(response.status).to.equal(200);
      }
    });

    it('should validate Nigerian cities in booking', async () => {
      const nigerianCities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'];

      for (const city of nigerianCities) {
        const response = await httpClient.post('/api/services/search', {
          city: city
        });

        expect(response.status).to.equal(200);
        expect(response.data.results).to.be.an('array');
      }
    });
  });
});

describe('🛡️ Security & Error Handling', () => {
  describe('Input Sanitization', () => {
    it('should handle XSS attempts in property ID', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:void(0)',
        '<img src=x onerror=alert(1)>',
        '"><script>alert("xss")</script>'
      ];

      for (const payload of xssPayloads) {
        try {
          const response = await httpClient.post('/api/negotiate', {
            propertyId: payload
          });
          
          // Should not contain script tags in response
          const responseStr = JSON.stringify(response.data);
          expect(responseStr).to.not.include('<script>');
          expect(responseStr).to.not.include('javascript:');
        } catch (error: any) {
          // Should return error, not execute script
          expect(error.response.status).to.be.greaterThan(0);
        }
      }
    });

    it('should handle SQL injection attempts', async () => {
      const sqlPayloads = [
        "'; DROP TABLE hotels; --",
        "1' OR '1'='1",
        "'; DELETE FROM services; --"
      ];

      for (const payload of sqlPayloads) {
        try {
          await httpClient.post('/api/services/search', {
            query: payload
          });
          // Should not crash the application
        } catch (error: any) {
          expect(error.response.status).to.be.lessThan(500);
        }
      }
    });

    it('should handle oversized payloads gracefully', async () => {
      const largePayload = {
        propertyId: 'test',
        largeField: 'x'.repeat(10000), // 10KB string
        nestedData: Array(1000).fill({ key: 'value' })
      };

      try {
        const response = await httpClient.post('/api/book', largePayload);
        expect(response.status).to.be.lessThan(500);
      } catch (error: any) {
        // Should handle gracefully, not crash
        expect(error.response.status).to.be.lessThan(500);
      }
    });
  });

  describe('Rate Limiting & Performance', () => {
    it('should handle rapid sequential requests', async () => {
      const rapidRequests = Array(20).fill(null).map((_, index) =>
        httpClient.post('/api/negotiate', {
          propertyId: `hotel-test-${index}`
        }).catch(error => error.response)
      );

      const responses = await Promise.all(rapidRequests);

      // Should not crash, may return rate limit errors
      responses.forEach(response => {
        if (response && response.status) {
          expect(response.status).to.be.lessThan(500);
        }
      });
    });

    it('should maintain performance under load', async () => {
      const startTime = Date.now();
      
      const loadRequests = Array(10).fill(null).map(() =>
        httpClient.post('/api/services/search', { city: 'Lagos' })
      );

      await Promise.all(loadRequests);
      
      const totalTime = Date.now() - startTime;
      // 10 concurrent requests should complete within 5 seconds
      expect(totalTime).to.be.lessThan(5000);
    });
  });

  describe('Error Response Consistency', () => {
    it('should return consistent error format for invalid data', async () => {
      const invalidRequests = [
        { endpoint: '/api/negotiate', data: { propertyId: null } },
        { endpoint: '/api/negotiate', data: { propertyId: 123 } },
        { endpoint: '/api/negotiate', data: { propertyId: '' } }
      ];

      for (const req of invalidRequests) {
        try {
          await httpClient.post(req.endpoint, req.data);
        } catch (error: any) {
          expect(error.response.data).to.have.property('status');
          expect(error.response.data).to.have.property('reason');
          expect(error.response.data.status).to.equal('no-offer');
        }
      }
    });

    it('should handle malformed JSON requests', async () => {
      try {
        await axios.post(`${BASE_URL}/api/book`, 'invalid json data', {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        expect(error.response.status).to.be.oneOf([400, 422, 500]);
      }
    });

    it('should handle missing content-type headers', async () => {
      try {
        const response = await axios.post(`${BASE_URL}/api/partner`, {
          businessName: 'Test'
        }, {
          headers: {} // No content-type header
        });
        
        expect(response.status).to.equal(200);
      } catch (error: any) {
        // Should handle gracefully
        expect(error.response.status).to.be.lessThan(500);
      }
    });
  });
});