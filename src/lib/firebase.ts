import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// These should ideally be in env vars, but using public placeholders as requested for firebase studio
const firebaseConfig = {
  apiKey: "placeholder-api-key",
  authDomain: "fairgreeter.firebaseapp.com",
  databaseURL: "https://fairgreeter-default-rtdb.firebaseio.com",
  projectId: "fairgreeter",
  storageBucket: "fairgreeter.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const database = getDatabase(app);