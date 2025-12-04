import express from 'express';

const APP_VERSION = 'V1';

// Routes
import eventRoutes from './event.routes.js';

const router = express.Router();

router.use(`/${APP_VERSION}/api`, eventRoutes);

export default router;