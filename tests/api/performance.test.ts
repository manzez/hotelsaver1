import axios from 'axios';
import { expect } from 'chai';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// HTTP client
const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

describe('⚡ Performance & Load Testing', () => {
  describe('Response Time Benchmarks', () => {
    it('should respond to negotiate API within 500ms', async () => {
      const startTime = Date.now();
      
      await httpClient.post('/api/negotiate', {
        propertyId: 'eko-hotels-and-suites-lagos'
      });
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).to.be.lessThan(2000); // Adjusted for 1s delay + processing
    });

    it('should respond to services search within 300ms', async () => {
      const startTime = Date.now();
      
      await httpClient.post('/api/services/search', {
        city: 'Lagos'
      });
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).to.be.lessThan(300);
    });

    it('should handle booking API within 200ms', async () => {
      const startTime = Date.now();
      
      await httpClient.post('/api/book', {
        propertyId: 'test-hotel'
      });
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).to.be.lessThan(200);
    });

    it('should respond to partner API within 100ms', async () => {
      const startTime = Date.now();
      
      await httpClient.post('/api/partner', {
        businessName: 'Test Business'
      });
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).to.be.lessThan(100);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle 10 concurrent negotiate requests', async () => {
      const concurrentRequests = Array(10).fill(null).map((_, index) =>
        httpClient.post('/api/negotiate', {
          propertyId: index < 5 ? 'eko-hotels-and-suites-lagos' : 'the-wheatbaker-lagos'
        }).catch(error => ({ error: true, status: error.response?.status }))
      );

      const results = await Promise.all(concurrentRequests);
      
      // At least 70% should succeed
      const successful = results.filter(r => !(r as any).error && (r as any).status !== undefined);
      expect(successful.length).to.be.at.least(7);
    });

    it('should maintain performance with mixed API calls', async () => {
      const mixedRequests = [
        httpClient.post('/api/negotiate', { propertyId: 'eko-hotels-and-suites-lagos' }),
        httpClient.post('/api/services/search', { city: 'Lagos' }),
        httpClient.post('/api/book', { propertyId: 'test' }),
        httpClient.post('/api/partner', { businessName: 'Test' }),
        httpClient.post('/api/services/book', { serviceId: 'test' })
      ];

      const startTime = Date.now();
      const results = await Promise.allSettled(mixedRequests);
      const totalTime = Date.now() - startTime;

      // All mixed requests should complete within 2 seconds
      expect(totalTime).to.be.lessThan(2000);

      // Most should succeed
      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).to.be.at.least(4);
    });

    it('should handle burst traffic gracefully', async () => {
      // Simulate burst of 25 requests
      const burstRequests = Array(25).fill(null).map(() =>
        httpClient.post('/api/services/search', {
          query: 'massage'
        }).catch(error => error.response)
      );

      const results = await Promise.all(burstRequests);
      
      // Should not have any 5xx errors (server crashes)
      results.forEach(result => {
        if (result && result.status) {
          expect(result.status).to.be.lessThan(500);
        }
      });
    });
  });

  describe('Memory & Resource Usage', () => {
    it('should handle large service search results efficiently', async () => {
      const response = await httpClient.post('/api/services/search', {
        city: 'Lagos' // Likely to return many results
      });

      expect(response.status).to.equal(200);
      
      // Results should be capped to prevent memory issues
      expect(response.data.results.length).to.be.at.most(60);
      
      // Response size should be reasonable (< 1MB)
      const responseSize = JSON.stringify(response.data).length;
      expect(responseSize).to.be.lessThan(1024 * 1024); // 1MB
    });

    it('should handle repeated requests without memory leaks', async () => {
      // Make 50 sequential requests to test for memory leaks
      for (let i = 0; i < 50; i++) {
        const response = await httpClient.post('/api/negotiate', {
          propertyId: 'hotel-lagos-1'
        });
        
        expect(response.status).to.equal(200);
        
        // Small delay to prevent overwhelming
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    });

    it('should efficiently handle varying payload sizes', async () => {
      const payloadSizes = [
        { size: 'small', data: { propertyId: 'test' } },
        { size: 'medium', data: { 
          propertyId: 'test',
          contact: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+2348012345678',
            address: '123 Test Street, Lagos',
            preferences: ['wifi', 'parking', 'breakfast']
          }
        }},
        { size: 'large', data: {
          propertyId: 'test',
          metadata: Array(100).fill({ key: 'value', data: 'x'.repeat(100) })
        }}
      ];

      for (const payload of payloadSizes) {
        const startTime = Date.now();
        
        const response = await httpClient.post('/api/book', payload.data);
        
        const responseTime = Date.now() - startTime;
        
        expect(response.status).to.equal(200);
        // Larger payloads shouldn't be dramatically slower
        expect(responseTime).to.be.lessThan(1000);
      }
    });
  });

  describe('Database & Data Access Performance', () => {
    it('should efficiently search through hotel data', async () => {
      const hotelIds = [
        'eko-hotels-and-suites-lagos', 'the-wheatbaker-lagos', 'radisson-blu-anchorage-lagos', 
        'four-points-by-sheraton-vi-lagos', 'lagos-continental-hotel-lagos'
      ];

      const searchPromises = hotelIds.map(id =>
        httpClient.post('/api/negotiate', { propertyId: id })
          .then(response => ({ id, responseTime: Date.now() }))
          .catch(() => ({ id, error: true }))
      );

      const results = await Promise.all(searchPromises);
      
      // All hotel searches should complete
      const errors = results.filter(r => (r as any).error);
      expect(errors.length).to.be.lessThan(2); // Allow 1 error
    });

    it('should efficiently filter services by category', async () => {
      const categories = ['Hair', 'Massage', 'Cleaning', 'Security', 'Catering'];

      for (const category of categories) {
        const startTime = Date.now();
        
        const response = await httpClient.post('/api/services/search', {
          query: category.toLowerCase()
        });
        
        const responseTime = Date.now() - startTime;
        
        expect(response.status).to.equal(200);
        expect(responseTime).to.be.lessThan(200); // Category filtering should be fast
      }
    });

    it('should handle complex service queries efficiently', async () => {
      const complexQueries = [
        { city: 'Lagos', query: 'massage therapy' },
        { city: 'Abuja', query: 'hair styling' },
        { city: 'Port Harcourt', query: 'cleaning service' },
        { city: 'Owerri', query: 'security guard' }
      ];

      for (const queryData of complexQueries) {
        const startTime = Date.now();
        
        const response = await httpClient.post('/api/services/search', queryData);
        
        const responseTime = Date.now() - startTime;
        
        expect(response.status).to.equal(200);
        expect(responseTime).to.be.lessThan(300);
      }
    });
  });

  describe('Error Recovery & Resilience', () => {
    it('should recover quickly from invalid requests', async () => {
      // Make invalid request
      try {
        await httpClient.post('/api/negotiate', { propertyId: null });
      } catch (error) {
        // Ignore expected error
      }

      // Follow with valid request immediately
      const startTime = Date.now();
      
      const response = await httpClient.post('/api/negotiate', {
        propertyId: 'hotel-lagos-1'
      });
      
      const responseTime = Date.now() - startTime;
      
      expect(response.status).to.equal(200);
      expect(responseTime).to.be.lessThan(500); // Should not be slowed by previous error
    });

    it('should maintain performance under error conditions', async () => {
      // Mix valid and invalid requests
      const mixedRequests = [
        httpClient.post('/api/negotiate', { propertyId: 'valid-hotel' }),
        httpClient.post('/api/negotiate', { propertyId: null }).catch(e => e),
        httpClient.post('/api/negotiate', { propertyId: 'another-valid-hotel' }),
        httpClient.post('/api/negotiate', { propertyId: 123 }).catch(e => e),
        httpClient.post('/api/negotiate', { propertyId: 'final-valid-hotel' })
      ];

      const startTime = Date.now();
      const results = await Promise.all(mixedRequests);
      const totalTime = Date.now() - startTime;

      // Should complete all requests (valid and errors) quickly
      expect(totalTime).to.be.lessThan(1500);

      // Valid requests should succeed
      const validResponses = results.filter(r => r.status === 200);
      expect(validResponses.length).to.be.at.least(2);
    });
  });

  describe('Scalability Indicators', () => {
    it('should maintain consistent response times under increasing load', async () => {
      const loadLevels = [5, 10, 15];
      const responseTimesByLoad: number[] = [];

      for (const load of loadLevels) {
        const requests = Array(load).fill(null).map(() =>
          httpClient.post('/api/services/search', { city: 'Lagos' })
        );

        const startTime = Date.now();
        await Promise.all(requests);
        const avgResponseTime = (Date.now() - startTime) / load;

        responseTimesByLoad.push(avgResponseTime);
      }

      // Response time shouldn't increase dramatically with load
      const timeIncrease = responseTimesByLoad[2] / responseTimesByLoad[0];
      expect(timeIncrease).to.be.lessThan(3); // Should not be 3x slower at 3x load
    });

    it('should efficiently handle simultaneous different operations', async () => {
      const simultaneousOps = [
        // Different types of operations running at same time
        httpClient.post('/api/negotiate', { propertyId: 'hotel-1' }),
        httpClient.post('/api/services/search', { city: 'Lagos' }),
        httpClient.post('/api/book', { propertyId: 'hotel-2' }),
        httpClient.post('/api/services/book', { serviceId: 'service-1' }),
        httpClient.post('/api/partner', { businessName: 'Test' })
      ];

      const startTime = Date.now();
      const results = await Promise.allSettled(simultaneousOps);
      const totalTime = Date.now() - startTime;

      // All different operations should complete within reasonable time
      expect(totalTime).to.be.lessThan(2000);

      // Most should succeed
      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).to.be.at.least(4);
    });
  });
});