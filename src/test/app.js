// src/app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const staticWithCDN = require('./middleware/staticWithCDN');
const uploadRoutes = require('./routes/uploads');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración del CDN para archivos estáticos
app.use('/uploads', staticWithCDN({
    localFallback: process.env.NODE_ENV !== 'production',
    cacheControl: 'public, max-age=31536000, immutable'
}));

// Servir archivos locales como fallback (solo desarrollo)
if (process.env.NODE_ENV !== 'production') {
    app.use('/uploads/local', express.static(path.join(__dirname, '../uploads')));
}

// Rutas
app.use('/api', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        cdn: process.env.CDN_DOMAIN ? 'enabled' : 'disabled',
        environment: process.env.NODE_ENV 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CDN enabled: ${process.env.CDN_DOMAIN ? 'Yes' : 'No'}`);
});