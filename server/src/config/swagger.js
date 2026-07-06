import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Apna Bazaar APIs',
      version: '1.0.0',
      description: `
Apna Bazaar Backend API provides a comprehensive set of RESTful endpoints for managing products, categories, orders, customers, authentication, and administrative operations.

This documentation serves as a complete reference for developers to integrate with the Apna Bazaar platform, enabling seamless access to inventory management, order processing, user authentication, and business operations.

Use the "Authorize" button to authenticate protected endpoints with a valid JWT token.
`,
      // description: 'API Documentation for Apna Bazaar Backend',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },

      schemas: {
        Product: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '6850f17f0ef76a1f5b2d1234',
            },
            name: {
              type: 'string',
              example: 'Fresh Tomato',
            },
            description: {
              type: 'string',
              example: 'Organic red tomatoes',
            },
            price: {
              type: 'number',
              example: 50,
            },
            stock: {
              type: 'number',
              example: 100,
            },
            isFeatured: {
              type: 'boolean',
              example: true,
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
          },
        },
      },
    },
  },

  apis: ['./src/swagger/*.js'],
};

export default swaggerJsdoc(options);