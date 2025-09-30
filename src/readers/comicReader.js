// comicReader.js
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const sharp = require('sharp');

class ComicReader {
    constructor(filePath) {
        this.filePath = filePath;
        this.extension = path.extname(filePath).toLowerCase();
    }

    async getPages() {
        if (this.extension === '.cbz') {
            const zip = new AdmZip(this.filePath);
            const entries = zip.getEntries();
            
            return entries
                .filter(entry => {
                    const ext = path.extname(entry.entryName).toLowerCase();
                    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
                })
                .sort((a, b) => a.entryName.localeCompare(b.entryName))
                .map(entry => ({
                    name: entry.entryName,
                    data: zip.readFile(entry)
                }));
        }
        // Para CBR (RAR) necesitarías una librería adicional
    }

    async getPageAsBase64(pageData, maxWidth = 800) {
        const buffer = await sharp(pageData)
            .resize(maxWidth)
            .jpeg({ quality: 80 })
            .toBuffer();
            
        return `data:image/jpeg;base64,${buffer.toString('base64')}`;
    }
}

module.exports = ComicReader;