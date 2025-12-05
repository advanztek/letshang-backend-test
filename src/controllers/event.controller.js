// controllers/event.controller.js
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import {
  eventSchema,
  updateEventSchema,
  moduleConfigSchema,
  eventIdSchema,
  moduleIdSchema
} from '../validators/event.validator.js';
import { mockDatabase } from '../utils/mock.data.js';
import { errorResponse, successResponse, validateSchema } from '../utils/functions.js';

// ============= EVENT APIs =============

/**
 * @api {post} /api/events Create Event
 * @apiName CreateEvent
 * @apiGroup Events
 */
const createEvent = async (req, res) => {
  try {
    const validatedData = validateSchema(req.body, eventSchema);
    
    const newEvent = {
      id: uuidv4(),
      userId: req.user?.id || 'anonymous', // In real app, get from auth middleware
      ...validatedData,
      modules: validatedData.modules || [],
      photos: validatedData.photos || [],
      links: validatedData.links || [],
      tags: validatedData.tags || [],
      views: 0,
      attendees: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    mockDatabase.events.push(newEvent);
    
    // In Recoil implementation:
    // eventState.set(newEvent);
    
    res.status(201).json(successResponse(newEvent, 'Event created successfully'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
};

/**
 * @api {get} /api/events/:id Get Event
 * @apiName GetEvent
 * @apiGroup Events
 */
const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    validateSchema({ id }, eventIdSchema);
    
    const event = mockDatabase.events.find(e => e.id === id);
    
    if (!event) {
      return res.status(404).json(errorResponse('Event not found', 404));
    }
    
    res.status(200).json(successResponse(event));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
};

/**
 * @api {put} /api/events/:id Update Event
 * @apiName UpdateEvent
 * @apiGroup Events
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    validateSchema({ id }, eventIdSchema);
    
    const validatedData = validateSchema(req.body, updateEventSchema);
    
    const eventIndex = mockDatabase.events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      return res.status(404).json(errorResponse('Event not found', 404));
    }
    
    // Check ownership (in real app)
    // if (mockDatabase.events[eventIndex].userId !== req.user.id) {
    //   return res.status(403).json(errorResponse('Not authorized', 403));
    // }
    
    const updatedEvent = {
      ...mockDatabase.events[eventIndex],
      ...validatedData,
      updatedAt: new Date().toISOString(),
      version: mockDatabase.events[eventIndex].version + 1
    };
    
    mockDatabase.events[eventIndex] = updatedEvent;
    
    // In Recoil:
    // eventState.set(updatedEvent);
    
    res.status(200).json(successResponse(updatedEvent, 'Event updated successfully'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
};

/**
 * @api {delete} /api/events/:id Delete Event
 * @apiName DeleteEvent
 * @apiGroup Events
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    validateSchema({ id }, eventIdSchema);
    
    const eventIndex = mockDatabase.events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) {
      return res.status(404).json(errorResponse('Event not found', 404));
    }
    
    // Soft delete
    mockDatabase.events[eventIndex].status = 'deleted';
    mockDatabase.events[eventIndex].deletedAt = new Date().toISOString();
    mockDatabase.events[eventIndex].updatedAt = new Date().toISOString();
    
    res.status(200).json(successResponse(null, 'Event deleted successfully'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
};

/**
 * @api {get} /api/events Get All Events
 * @apiName GetAllEvents
 * @apiGroup Events
 */
const getAllEvents = async (req, res) => {
  try {
    const { status, userId, limit = 20, page = 1 } = req.query;
    
    let filteredEvents = mockDatabase.events;
    
    // Filter by status
    if (status) {
      filteredEvents = filteredEvents.filter(e => e.status === status);
    }
    
    // Filter by user (in real app)
    if (userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === userId);
    }
    
    // Filter out deleted events
    filteredEvents = filteredEvents.filter(e => e.status !== 'deleted');
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + parseInt(limit));
    
    res.status(200).json(successResponse({
      events: paginatedEvents,
      pagination: {
        total: filteredEvents.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(filteredEvents.length / limit)
      }
    }));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
};

// ============= MODULE APIs =============

/**
 * @api {get} /api/modules Get All Modules
 * @apiName GetAllModules
 * @apiGroup Modules
 */
const getModules = async (req, res) => {
  try {
    const { category, includeCode = false, activeOnly = true } = req.query;
    
    let modules = mockDatabase.modules;
    
    // Filter by category
    if (category) {
      modules = modules.filter(m => m.category === category);
    }
    
    // Filter by active status
    if (activeOnly === 'true') {
      modules = modules.filter(m => m.isActive === true);
    }
    
    // Remove code if not requested (for security/performance)
    const responseModules = modules.map(module => {
      const { code, ...rest } = module;
      
      if (includeCode === 'true') {
        return module;
      }
      
      return rest;
    });
    
    res.status(200).json(successResponse({
      modules: responseModules,
      count: responseModules.length
    }));
  } catch (error) {
    res.status(500).json(errorResponse('Failed to fetch modules'));
  }
};

// ============= EVENT-MODULE INTERACTION APIs =============

/**
 * @api {post} /api/events/:eventId/modules Add Module to Event
 * @apiName AddModuleToEvent
 * @apiGroup Events
 */
const addModuleToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const moduleData = validateSchema(req.body, moduleConfigSchema);
    
    // Validate event exists
    validateSchema({ id: eventId }, eventIdSchema);
    const event = mockDatabase.events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json(errorResponse('Event not found', 404));
    }
    
    // Validate module exists
    const module = mockDatabase.modules.find(m => m.id === moduleData.moduleId && m.isActive);
    
    if (!module) {
      return res.status(404).json(errorResponse('Module not found or inactive', 404));
    }
    
    // Check if module already exists in event
    const existingModuleIndex = event.modules.findIndex(m => m.id === moduleData.moduleId);
    
    if (existingModuleIndex > -1) {
      // Update existing module config
      event.modules[existingModuleIndex].config = {
        ...event.modules[existingModuleIndex].config,
        ...moduleData.config
      };
    } else {
      // Add new module
      event.modules.push({
        id: moduleData.moduleId,
        config: moduleData.config || {},
        addedAt: new Date().toISOString(),
        order: event.modules.length
      });
    }
    
    event.updatedAt = new Date().toISOString();
    
    res.status(200).json(successResponse(event, 'Module added to event successfully'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
};

/**
 * @api {delete} /api/events/:eventId/modules/:moduleId Remove Module from Event
 * @apiName RemoveModuleFromEvent
 * @apiGroup Events
 */
const removeModuleFromEvent = async (req, res) => {
  try {
    const { eventId, moduleId } = req.params;
    
    validateSchema({ id: eventId }, eventIdSchema);
    validateSchema({ id: moduleId }, moduleIdSchema);
    
    const event = mockDatabase.events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json(errorResponse('Event not found', 404));
    }
    
    const moduleIndex = event.modules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex === -1) {
      return res.status(404).json(errorResponse('Module not found in event', 404));
    }
    
    // Remove module
    event.modules.splice(moduleIndex, 1);
    
    // Reorder remaining modules
    event.modules.forEach((module, index) => {
      module.order = index;
    });
    
    event.updatedAt = new Date().toISOString();
    
    res.status(200).json(successResponse(event, 'Module removed from event successfully'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
};

/**
 * @api {put} /api/events/:eventId/modules/:moduleId Update Module Config
 * @apiName UpdateModuleConfig
 * @apiGroup Events
 */
const updateModuleConfig = async (req, res) => {
  try {
    const { eventId, moduleId } = req.params;
    
    validateSchema({ id: eventId }, eventIdSchema);
    validateSchema({ id: moduleId }, moduleIdSchema);
    
    const config = validateSchema(req.body, Joi.object());
    
    const event = mockDatabase.events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json(errorResponse('Event not found', 404));
    }
    
    const module = event.modules.find(m => m.id === moduleId);
    
    if (!module) {
      return res.status(404).json(errorResponse('Module not found in event', 404));
    }
    
    // Update config
    module.config = {
      ...module.config,
      ...config
    };
    
    module.updatedAt = new Date().toISOString();
    event.updatedAt = new Date().toISOString();
    
    res.status(200).json(successResponse(event, 'Module config updated successfully'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
};

// ============= UTILITY APIs =============

/**
 * @api {get} /api/events/:eventId/preview Get Event Preview
 * @apiName GetEventPreview
 * @apiGroup Events
 */
const getEventPreview = async (req, res) => {
  try {
    const { eventId } = req.params;
    validateSchema({ id: eventId }, eventIdSchema);
    
    const event = mockDatabase.events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json(errorResponse('Event not found', 404));
    }
    
    // Get module codes for rendering
    const modulesWithCode = await Promise.all(
      event.modules.map(async (module) => {
        const moduleDefinition = mockDatabase.modules.find(m => m.id === module.id);
        return {
          ...module,
          code: moduleDefinition?.code || '',
          name: moduleDefinition?.name || module.id
        };
      })
    );
    
    res.status(200).json(successResponse({
      event,
      modules: modulesWithCode
    }));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
};

/**
 * @api {post} /api/events/:eventId/publish Publish Event
 * @apiName PublishEvent
 * @apiGroup Events
 */
const publishEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    validateSchema({ id: eventId }, eventIdSchema);
    
    const event = mockDatabase.events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json(errorResponse('Event not found', 404));
    }
    
    // Validate event can be published
    if (!event.name || !event.dateTime) {
      return res.status(400).json(errorResponse(
        'Event must have a name and date/time to be published', 
        400
      ));
    }
    
    event.status = 'published';
    event.publishedAt = new Date().toISOString();
    event.updatedAt = new Date().toISOString();
    
    res.status(200).json(successResponse(event, 'Event published successfully'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message, 400));
  }
};

// ============= EXPORT ALL APIs =============

export {
  // Event APIs
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  publishEvent,
  
  // Module APIs
  getModules,
  
  // Event-Module Interaction APIs
  addModuleToEvent,
  removeModuleFromEvent,
  updateModuleConfig,
  
  // Utility APIs
  getEventPreview
};