import { initializeApp, getApp, getApps, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import serviceKey from "./service_key.json";

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceKey as ServiceAccount),
      })
    : getApp();

const adminDb = getFirestore(app);

export { app as adminApp, adminDb };
