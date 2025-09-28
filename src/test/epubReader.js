// epubReader.js
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const xml2js = require('xml2js');

class EpubReader {
    constructor(filePath) {
        this.filePath = filePath;
        this.zip = new AdmZip(filePath);
    }

    async getMetadata() {
        const containerXml = this.zip.readAsText('META-INF/container.xml');
        const parser = new xml2js.Parser();
        const container = await parser.parseStringPromise(containerXml);
        
        const opfPath = container.container.rootfiles[0].rootfile[0].$['full-path'];
        const opfContent = this.zip.readAsText(opfPath);
        const opf = await parser.parseStringPromise(opfContent);
        
        return opf.package.metadata[0];
    }

    async getTableOfContents() {
        // Implementar lógica para obtener el índice
    }

    async getChapterContent(chapterPath) {
        const content = this.zip.readAsText(chapterPath);
        return content;
    }
}

module.exports = EpubReader;