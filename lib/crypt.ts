import CryptoJS from 'crypto-js';

export function encrypt(password: string, salt: string | undefined = undefined) {
    let theSalt: string;

    if (!salt) {
        theSalt = generateSalt(); //1
    } else {
        theSalt = salt;
    }

    const saltedHash = CryptoJS.SHA256(theSalt + password); // 2
    const encrypted = theSalt! + saltedHash;
    
    console.log('plain: ' + password);
    console.log('encrypted: ' + encrypted.toString());  
    return encrypted;  
}

export function check(cipher: string, plain:string) {
    const salt = cipher.substring(0,6);
    const theRest = cipher.substring(6);
    const e = encrypt(plain, salt);
    console.log('enc password: ' + cipher);
    console.log('new enc pswd: ' + e);
}

/**
 * Generates a 6 character salt
 * @returns 
 */
export function generateSalt(): string {
    const seed = (Math.random()*100).toString();
    // console.log('seed: ' + seed);
    const salt = CryptoJS.SHA256(seed);
    // console.log('salt: ' + salt);
    return salt.toString(CryptoJS.enc.Hex).substring(0,6);
}
