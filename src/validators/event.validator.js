// validators/event.validator.js
import Joi from 'joi';

export const eventSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
    .messages({
      'string.empty': 'Event name is required',
      'string.min': 'Event name must be at least 3 characters',
      'string.max': 'Event name cannot exceed 100 characters'
    }),
  
  phoneNumber: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid phone number'
    }),
  
  dateTime: Joi.date().greater('now').optional()
    .messages({
      'date.greater': 'Event date must be in the future'
    }),
  
  location: Joi.string().max(200).optional(),
  
  costPerPerson: Joi.number().min(0).optional()
    .messages({
      'number.min': 'Cost cannot be negative'
    }),
  
  description: Joi.string().max(1000).optional(),
  
  capacity: Joi.number().integer().min(1).max(10000).optional()
    .messages({
      'number.min': 'Capacity must be at least 1',
      'number.max': 'Capacity cannot exceed 10,000'
    }),
  
  modules: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      config: Joi.object().optional()
    })
  ).optional(),
  
  photos: Joi.array().items(
    Joi.string().uri()
  ).optional(),
  
  links: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      url: Joi.string().uri().required()
    })
  ).optional(),
  
  status: Joi.string().valid('draft', 'published', 'cancelled', 'completed')
    .default('draft'),
  
  privacy: Joi.string().valid('public', 'private', 'invite-only')
    .default('public'),
  
  tags: Joi.array().items(Joi.string()).optional(),
  
  category: Joi.string().optional(),
  
  timezone: Joi.string().optional()
});

export const moduleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).optional(),
  code: Joi.string().required(),
  configSchema: Joi.object().required(),
  category: Joi.string().optional(),
  icon: Joi.string().optional(),
  version: Joi.string().optional()
});

export const updateEventSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  phoneNumber: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/).optional(),
  dateTime: Joi.date().greater('now').optional(),
  location: Joi.string().max(200).optional(),
  costPerPerson: Joi.number().min(0).optional(),
  description: Joi.string().max(1000).optional(),
  capacity: Joi.number().integer().min(1).max(10000).optional(),
  status: Joi.string().valid('draft', 'published', 'cancelled', 'completed').optional(),
  privacy: Joi.string().valid('public', 'private', 'invite-only').optional()
});

export const moduleConfigSchema = Joi.object({
  moduleId: Joi.string().required(),
  config: Joi.object().optional()
});

export const eventIdSchema = Joi.string().uuid().required();
export const moduleIdSchema = Joi.string().required();