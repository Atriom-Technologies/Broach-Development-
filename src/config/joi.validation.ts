import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  BCRYPT_SALT_ROUNDS: Joi.number().required(),
  JWT_SECRET: Joi.string().trim().required(),
  JWT_EXPIRATION: Joi.string().trim().default('60min').optional(),
  REFRESH_TOKEN_TTL: Joi.number().default(604800000),
  REDIS_URL: Joi.string()
    .trim()
    .uri({ scheme: ['redis', 'rediss'] })
    .required(),
});
