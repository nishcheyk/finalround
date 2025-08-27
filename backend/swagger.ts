import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Booking API',
      version: '1.0.0',
      description: 'A comprehensive API for event booking and management',
      contact: {
        name: 'API Support',
        email: 'support@eventbooking.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.eventbooking.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name',
              minLength: 2,
              maxLength: 50
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            phone: {
              type: 'string',
              description: 'User phone number'
            },
            isAdmin: {
              type: 'boolean',
              description: 'Whether user is admin'
            }
          },
          required: ['name', 'email']
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              description: 'User password',
              minLength: 1
            }
          },
          required: ['email', 'password']
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'User full name',
              minLength: 2,
              maxLength: 50
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              description: 'User password',
              minLength: 8,
              maxLength: 128
            },
            phone: {
              type: 'string',
              description: 'User phone number'
            }
          },
          required: ['name', 'email', 'password']
        },
        OTPRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email to send OTP to'
            }
          },
          required: ['email']
        },
        VerifyOTPRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address'
            },
            otp: {
              type: 'string',
              description: '6-digit OTP code',
              minLength: 6,
              maxLength: 6
            }
          },
          required: ['email', 'otp']
        },
        ResetPasswordRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              description: 'New password',
              minLength: 8,
              maxLength: 128
            }
          },
          required: ['email', 'password']
        },
        RefreshTokenRequest: {
          type: 'object',
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Refresh token'
            }
          },
          required: ['refreshToken']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            status: {
              type: 'number',
              example: 400
            },
            message: {
              type: 'string',
              example: 'Validation failed'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    }
  },
  apis: ['./app/**/*.ts', './app/**/*.js']
};

export const specs = swaggerJsdoc(options);
