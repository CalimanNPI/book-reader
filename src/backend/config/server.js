const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/archivos', express.static(path.join(__dirname, 'archivos')));

// Rutas del archivo JSON
const DATA_FILE = path.join(__dirname, 'data', 'folders.json');
const ARCHIVOS_DIR = path.join(__dirname, 'archivos');

// Función para cargar carpetas desde JSON
async function cargarCarpetas() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Si el archivo no existe, crear uno con estructura inicial
        if (error.code === 'ENOENT') {
            const estructuraInicial = {
                carpetas: [],
                ultimaActualizacion: new Date().toISOString()
            };
            await guardarCarpetas(estructuraInicial);
            return estructuraInicial;
        }
        throw error;
    }
}

// Función para guardar carpetas en JSON
async function guardarCarpetas(datos) {
    try {
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        await fs.writeFile(DATA_FILE, JSON.stringify(datos, null, 2));
        return true;
    } catch (error) {
        console.error('Error guardando carpetas:', error);
        return false;
    }
}

// Función para escanear archivos en una carpeta
async function escanearArchivos(carpetaPath) {
    try {
        const archivos = await fs.readdir(carpetaPath);
        const resultado = [];
        
        for (const archivo of archivos) {
            const archivoPath = path.join(carpetaPath, archivo);
            const stats = await fs.stat(archivoPath);
            
            resultado.push({
                nombre: archivo,
                ruta: archivoPath,
                esDirectorio: stats.isDirectory(),
                tamaño: stats.size,
                modificado: stats.mtime.toISOString(),
                url: `/archivos/${archivo}`
            });
        }
        
        return resultado;
    } catch (error) {
        console.error('Error escaneando archivos:', error);
        return [];
    }
}

// API Routes

// Obtener todas las carpetas
app.get('/api/carpetas', async (req, res) => {
    try {
        const datos = await cargarCarpetas();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: 'Error cargando carpetas' });
    }
});

// Agregar nueva carpeta
app.post('/api/carpetas', async (req, res) => {
    try {
        const { nombre, ruta, descripcion } = req.body;
        const datos = await cargarCarpetas();
        
        const nuevaCarpeta = {
            id: Date.now().toString(),
            nombre,
            ruta,
            descripcion: descripcion || '',
            fechaCreacion: new Date().toISOString(),
            archivos: []
        };
        
        datos.carpetas.push(nuevaCarpeta);
        datos.ultimaActualizacion = new Date().toISOString();
        
        const guardado = await guardarCarpetas(datos);
        
        if (guardado) {
            res.json({ success: true, carpeta: nuevaCarpeta });
        } else {
            res.status(500).json({ error: 'Error guardando carpeta' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error agregando carpeta' });
    }
});

// Escanear archivos de una carpeta
app.get('/api/carpetas/:id/archivos', async (req, res) => {
    try {
        const { id } = req.params;
        const datos = await cargarCarpetas();
        const carpeta = datos.carpetas.find(c => c.id === id);
        
        if (!carpeta) {
            return res.status(404).json({ error: 'Carpeta no encontrada' });
        }
        
        const archivos = await escanearArchivos(carpeta.ruta);
        carpeta.archivos = archivos;
        carpeta.ultimoEscaneo = new Date().toISOString();
        
        // Actualizar en JSON
        await guardarCarpetas(datos);
        
        res.json({ archivos, carpeta });
    } catch (error) {
        res.status(500).json({ error: 'Error escaneando archivos' });
    }
});

// Eliminar carpeta
app.delete('/api/carpetas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datos = await cargarCarpetas();
        
        datos.carpetas = datos.carpetas.filter(c => c.id !== id);
        datos.ultimaActualizacion = new Date().toISOString();
        
        const guardado = await guardarCarpetas(datos);
        
        if (guardado) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Error eliminando carpeta' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando carpeta' });
    }
});

// Servir archivos estáticos
app.get('/api/archivo/:nombre', (req, res) => {
    const { nombre } = req.params;
    const archivoPath = path.join(ARCHIVOS_DIR, nombre);
    
    res.sendFile(archivoPath, (err) => {
        if (err) {
            res.status(404).json({ error: 'Archivo no encontrado' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});