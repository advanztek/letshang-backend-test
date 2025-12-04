// Enhanced src/index.js with better logging
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import http from 'http';

// Routes
import router from './routes/index.js';

const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);

app.set('trust proxy', 1);
app.use(helmet());

// Rate limiter setup
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000 // limit each IP to 5000 requests per window
});

// Parse ALLOWED_ORIGINS safely
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// REQUEST LOGGING MIDDLEWARE - Add this before your routes
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;

    console.log(`🌐 [${timestamp}] ${method} ${url} - IP: ${ip}`);

    // Log request body for POST/PUT requests (be careful with sensitive data)
    if ((method === 'POST' || method === 'PUT') && req.body && Object.keys(req.body).length > 0) {
        console.log(`📝 Request body:`, JSON.stringify(req.body, null, 2));
    }

    next();
});

// Configure body parsing
const requestSizeLimit = process.env.REQUEST_SIZE_LIMIT || '5';
app.use(bodyParser.json({ limit: `${requestSizeLimit}mb` }));
app.use(bodyParser.urlencoded({ limit: `${requestSizeLimit}mb`, extended: true }));

app.use(limiter);

// Serve static files from the 'uploads' directory
app.use('/public', express.static('./public'));

app.use(`/`, router);

// Root Route
app.get('/', async (req, res) => {
    try {
        console.log('🏠 Root route accessed');
        res.json({ message: `Server running on port ${port}.`, url: `http://localhost:${port}/` });
    } catch (error) {
        console.error('❌ Error processing root request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    console.log('💚 Health check endpoint accessed');
    res.status(200).json({ message: 'Server is running.' });
});

// Start server function
const startServer = async () => {
    server.listen(port, () => {
        console.log(`🚀 Server running on port ${port}. | http://localhost:${port}/`);
    });
};

startServer();