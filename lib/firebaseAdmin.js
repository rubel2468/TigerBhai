import admin from 'firebase-admin'

function buildCredentialFromEnv() {
  // Option A: single JSON env var
  const json = process.env.FIREBASE_ADMIN_CREDENTIALS
  if (json) {
    try {
      const obj = JSON.parse(json)
      if (typeof obj.project_id !== 'string' || typeof obj.client_email !== 'string' || typeof obj.private_key !== 'string') {
        throw new Error('FIREBASE_ADMIN_CREDENTIALS is missing required fields')
      }
      return {
        projectId: obj.project_id,
        clientEmail: obj.client_email,
        privateKey: obj.private_key.replace(/\\n/g, '\n'),
      }
    } catch (e) {
      throw new Error(`Invalid FIREBASE_ADMIN_CREDENTIALS JSON: ${e.message}`)
    }
  }

  // Option B: individual env vars
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY
  const privateKey = privateKeyRaw?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials envs: projectId/clientEmail/privateKey')
  }
  return { projectId, clientEmail, privateKey }
}

export function getAdminApp() {
  if (!admin.apps.length) {
    const creds = buildCredentialFromEnv()
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: creds.projectId,
        clientEmail: creds.clientEmail,
        privateKey: creds.privateKey,
      }),
    })
  }
  return admin.app()
}

export function getAdminFirestore() {
  return getAdminApp().firestore()
}


