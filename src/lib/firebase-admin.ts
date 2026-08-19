import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export const adminAuth = {
  verifyIdToken: async (idToken: string) => {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (privateKey) {
      // Remove wrapping double quotes if present in the env value
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (!getApps().length) {
      if (projectId && clientEmail && privateKey) {
        try {
          initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
        } catch (error) {
          console.error('Firebase Admin SDK initialization error:', error);
          throw error;
        }
      } else {
        throw new Error('Firebase Admin environment variables are missing. Cannot verify token.');
      }
    }

    return getAuth().verifyIdToken(idToken);
  },
};
