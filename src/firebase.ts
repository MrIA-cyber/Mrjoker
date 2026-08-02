import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBQPxTHJS82rgitqmpmULXasTKV4FSKnjg",
  authDomain: "afrinova-9fa1f.firebaseapp.com",
  projectId: "afrinova-9fa1f",
  storageBucket: "afrinova-9fa1f.firebasestorage.app",
  messagingSenderId: "889041510188",
  appId: "1:889041510188:web:8a1d388556223516209689",
  measurementId: "G-PWHQ99PWEL"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics safe fallback
  });
}

export { analytics };
export default app;
