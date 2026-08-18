// Client-side AES-GCM Encryption / Decryption utility for sensitive document scans

const ENCRYPTION_SALT = 'pathway_ai_secure_doc_v1';

async function getDerivedKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(ENCRYPTION_SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptBase64Data(
  base64Data: string,
  userKeySecret: string = 'user_doc_vault_key'
): Promise<{ encryptedString: string; iv: string }> {
  try {
    if (!crypto?.subtle) {
      return {
        encryptedString: `ENC_V1_${btoa(base64Data)}`,
        iv: 'fallback_iv'
      };
    }
    const key = await getDerivedKey(userKeySecret);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encryptedArrayBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(base64Data)
    );

    const encryptedBytes = new Uint8Array(encryptedArrayBuffer);
    let binary = '';
    for (let i = 0; i < encryptedBytes.length; i++) {
      binary += String.fromCharCode(encryptedBytes[i]);
    }
    const encryptedString = btoa(binary);

    let ivBinary = '';
    for (let i = 0; i < iv.length; i++) {
      ivBinary += String.fromCharCode(iv[i]);
    }
    const ivString = btoa(ivBinary);

    return { encryptedString, iv: ivString };
  } catch (err) {
    console.error('Encryption error:', err);
    return {
      encryptedString: `ENC_V1_${btoa(base64Data)}`,
      iv: 'fallback_iv'
    };
  }
}

export async function decryptBase64Data(
  encryptedString: string,
  ivString: string,
  userKeySecret: string = 'user_doc_vault_key'
): Promise<string> {
  try {
    if (encryptedString.startsWith('ENC_V1_')) {
      return atob(encryptedString.replace('ENC_V1_', ''));
    }
    if (!crypto?.subtle || ivString === 'fallback_iv') {
      return encryptedString;
    }
    const key = await getDerivedKey(userKeySecret);

    const ivBinary = atob(ivString);
    const iv = new Uint8Array(ivBinary.length);
    for (let i = 0; i < ivBinary.length; i++) {
      iv[i] = ivBinary.charCodeAt(i);
    }

    const encryptedBinary = atob(encryptedString);
    const encryptedBytes = new Uint8Array(encryptedBinary.length);
    for (let i = 0; i < encryptedBinary.length; i++) {
      encryptedBytes[i] = encryptedBinary.charCodeAt(i);
    }

    const decryptedArrayBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedBytes
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedArrayBuffer);
  } catch (err) {
    console.error('Decryption error:', err);
    if (encryptedString.startsWith('data:image')) return encryptedString;
    return '';
  }
}
