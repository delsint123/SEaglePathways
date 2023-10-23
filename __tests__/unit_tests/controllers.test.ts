import request from 'supertest';
import {describe, it, expect} from '@jest/globals';
import app from '../../server/index';

describe('Review Controller', () => {

    describe('submitReviewAsync', () => {
        it('should not allow certain fields of the review to be null', async () => {
            const mockRequest = {
                review: {
                    title: null,
                    userId: null,
                    company: "Google",
                    description: "This is a test",
                    startDate: '2023-10-23T04:00:00.000Z',
                    endDate: '2023-11-04T04:00:00.000Z',
                    gradeLevel: 'Junior'
                }
            };

            const response = await request(app).post('/review/submit').send(mockRequest);

            expect(response.status).toBe(400);
            expect(response.text).toBe('Review is not valid as some values are null. Please fill in those values and try again.');
        });

        it('should handle when company does not exist in database', async () => {
            const mockRequest = {
                review: {
                    title: "This is a test",
                    userId: null,
                    company: "This is a test company that should return false",
                    description: "This is a test",
                    startDate: '2023-10-23T04:00:00.000Z',
                    endDate: '2023-11-04T04:00:00.000Z',
                    gradeLevel: 'Junior'
                }
            };

            const response = await request(app).post('/review/submit').send(mockRequest);

            expect(response.status).toBe(400);
            expect(response.text).toBe('The company entered could not be retrieved');
        });
    });

    describe('getReviewsAsync', () => {
        it('should fetch all reviews', async () => {
            const response = await request(app).get('/review/allReviews');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        })
    })
})


describe('Company Controller', () => {

    describe('getAllCompaniesAsync', () => {
        it('should fetch all companies', async () => {
            const response = await request(app).get('/company/allCompanies');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        })
    })
})