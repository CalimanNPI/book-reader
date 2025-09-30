// src/config/cdn.js
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

class CDNService {
    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        
        this.bucketName = process.env.S3_BUCKET_NAME;
        this.cdnDomain = process.env.CDN_DOMAIN;
    }

    // Subir archivo al CDN
    async uploadFile(filePath, fileName, contentType) {
        const fileContent = fs.readFileSync(filePath);

        const params = {
            Bucket: this.bucketName,
            Key: `uploads/${fileName}`,
            Body: fileContent,
            ContentType: contentType,
            ACL: 'public-read' // O 'private' según necesites
        };

        try {
            const data = await this.s3.upload(params).promise();
            return {
                url: `https://${this.cdnDomain}/${data.Key}`,
                key: data.Key,
                location: data.Location
            };
        } catch (error) {
            console.error('Error uploading to CDN:', error);
            throw error;
        }
    }

    // Generar URL firmada (para archivos privados)
    async getSignedUrl(fileKey, expires = 3600) {
        const params = {
            Bucket: this.bucketName,
            Key: fileKey,
            Expires: expires
        };

        return this.s3.getSignedUrl('getObject', params);
    }

    // Eliminar archivo del CDN
    async deleteFile(fileKey) {
        const params = {
            Bucket: this.bucketName,
            Key: fileKey
        };

        try {
            await this.s3.deleteObject(params).promise();
            return true;
        } catch (error) {
            console.error('Error deleting from CDN:', error);
            throw error;
        }
    }

    // Obtener URL pública
    getPublicUrl(fileKey) {
        return `https://${this.cdnDomain}/${fileKey}`;
    }
}

// Alternativa para otros CDN (Cloudflare, Google Cloud, etc.)
class CloudStorageService {
    constructor(provider) {
        this.provider = provider;
        // Configuración específica para cada provider
    }

    // Métodos similares adaptados para diferentes providers
}

module.exports = CDNService;