import CryptoJS from 'crypto-js';

export function encrypt(password: string, salt: string | undefined = undefined) {
    const theSalt: string = salt ?? generateSalt(); //1
    const saltedHash = CryptoJS.SHA256(theSalt + password); // 2
    return theSalt + saltedHash;  
}

export default function checkPasswordCorrect(cipher: string, plain:string) {
    return encrypt(plain, cipher.substring(0,6)) === cipher;
}

/**
 * Generates a 6 character salt
 * @returns 
 */
export function generateSalt(): string {
    const seed = (Math.random()*100).toString();
    const salt = CryptoJS.SHA256(seed);
    return salt.toString(CryptoJS.enc.Hex).substring(0,6);
}
