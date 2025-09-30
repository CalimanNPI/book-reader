// scripts/test-cdn.js
const CDNService = require('../src/config/cdn');
const cdn = new CDNService();

async function testCDN() {
    try {
        console.log('Testing CDN configuration...');
        
        // Test de conexión
        const testFile = './test-file.txt';
        const fs = require('fs');
        fs.writeFileSync(testFile, 'Test content for CDN');
        
        const result = await cdn.uploadFile(testFile, 'test-file.txt', 'text/plain');
        console.log('✅ File uploaded to CDN:', result.url);
        
        // Cleanup
        fs.unlinkSync(testFile);
        await cdn.deleteFile('uploads/test-file.txt');
        console.log('✅ Test completed successfully');
        
    } catch (error) {
        console.error('❌ CDN test failed:', error.message);
    }
}

testCDN();