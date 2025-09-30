// src/routes/uploads.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const CDNService = require('../config/cdn');
const router = express.Router();

const cdnService = new CDNService();

// Configuración de multer para uploads locales temporales
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/temp/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB límite
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /epub|pdf|cbz|cbr|jpg|jpeg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    }
});

// Subir archivo y enviar a CDN
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Subir a CDN
        const cdnResult = await cdnService.uploadFile(
            req.file.path,
            req.file.originalname,
            req.file.mimetype
        );

        // Limpiar archivo temporal local
        const fs = require('fs');
        fs.unlinkSync(req.file.path);

        res.json({
            message: 'File uploaded successfully',
            cdnUrl: cdnResult.url,
            fileInfo: {
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Obtener URL de archivo
router.get('/file/:filename', async (req, res) => {
    try {
        const fileKey = `uploads/${req.params.filename}`;
        const url = cdnService.getPublicUrl(fileKey);
        
        res.json({ url });
    } catch (error) {
        res.status(404).json({ error: 'File not found' });
    }
});

module.exports = router;