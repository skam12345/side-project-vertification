import CryptoJS from "crypto-js";

const encryptionKey = 'AXEVBDASRFGRF';

export const encryptData = (plainText: string) => {
    const chiperText = CryptoJS.AES.encrypt(plainText, encryptionKey).toString();
    return chiperText;
}

export const decryptData = (cipherText: string) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, encryptionKey);
    const plainText = bytes.toString(CryptoJS.enc.Utf8); 
    return plainText;
}

