import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-secret-key-change-me';

export const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decrypt = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const encryptObject = (obj: any): string => {
  return encrypt(JSON.stringify(obj));
};

export const decryptObject = (encryptedData: string): any => {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted);
};
