// src/middleware/staticWithCDN.js
const CDNService = require('../config/cdn');
const cdnService = new CDNService();

const staticWithCDN = (options = {}) => {
    return async (req, res, next) => {
        const { localFallback = true, cacheControl = 'public, max-age=31536000' } = options;

        // Si es un archivo estático
        if (req.path.startsWith('/uploads/')) {
            const fileKey = req.path.substring(1); // Remover el slash inicial

            try {
                // Redirigir al CDN
                const cdnUrl = cdnService.getPublicUrl(fileKey);
                
                res.setHeader('Cache-Control', cacheControl);
                res.setHeader('X-CDN-Provider', 'AWS S3');
                res.redirect(302, cdnUrl);
                return;
            } catch (error) {
                if (localFallback) {
                    // Fallback al servidor local si el CDN falla
                    console.warn('CDN fallback to local:', error.message);
                    next();
                } else {
                    res.status(500).json({ error: 'CDN service unavailable' });
                }
            }
        } else {
            next();
        }
    };
};

module.exports = staticWithCDN;