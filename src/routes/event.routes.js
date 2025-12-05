// routes/event.routes.js
import express from 'express';
import {
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  publishEvent,
  getModules,
  addModuleToEvent,
  removeModuleFromEvent,
  updateModuleConfig,
  getEventPreview
} from '../controllers/event.controller.js';

const router = express.Router();

// ============= EVENT ROUTES =============
router.post('/events', createEvent);            // Create new event
router.get('/events', getAllEvents);           // Get all events (with filters)
router.get('/events/:id', getEvent);           // Get specific event
router.put('/events/:id', updateEvent);        // Update event
router.delete('/events/:id', deleteEvent);     // Delete (soft delete) event
router.post('/events/:id/publish', publishEvent); // Publish event

// ============= MODULE ROUTES =============
router.get('/modules', getModules);            // Get all available modules

// ============= EVENT-MODULE ROUTES =============
router.post('/events/:eventId/modules', addModuleToEvent);     // Add module to event
router.delete('/events/:eventId/modules/:moduleId', removeModuleFromEvent); // Remove module
router.put('/events/:eventId/modules/:moduleId', updateModuleConfig); // Update module config

// ============= UTILITY ROUTES =============
router.get('/events/:eventId/preview', getEventPreview); // Get event preview with modules

export default router;