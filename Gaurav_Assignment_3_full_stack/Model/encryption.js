const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = Buffer.from("6f8c8d8e9b8c8b8c8d8e9b8c8d8e9b8c8d8e9b8c8d8e9b8c8d8e9b8c8d8e9b8c", 'hex');
const iv = Buffer.from("1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d", 'hex'); 

function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(text) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encrypt, decrypt };