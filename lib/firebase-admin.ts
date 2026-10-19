
import "server-only";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "__session";

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is missing.");
  }

  let account: {
    project_id: string;
    client_email: string;
    private_key: string;
  };

  try {
    account = JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON.");
  }

  return initializeApp({
    credential: cert({
      projectId: account.project_id,
      clientEmail: account.client_email,
      privateKey: account.private_key,
    }),
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export async function getCurrentFirebaseUser(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionCookie) return null;

  try {
    return await getFirebaseAdminAuth().verifySessionCookie(
      sessionCookie,
      true
    );
  } catch {
    return null;
  }
}
