// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rutas para diferentes tipos de archivos
app.post('/upload', upload.single('file'), (req, res) => {
    // Lógica para procesar el archivo subido
});

app.get('/epub/:filename', (req, res) => {
    // Servir contenido EPUB
});

app.get('/pdf/:filename', (req, res) => {
    // Servir contenido PDF
});

app.get('/comic/:filename', (req, res) => {
    // Servir cómics (CBZ, CBR)
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});