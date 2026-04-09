import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyD9SMIIk9LH6zzNd6zdrhTv9wcDi4DdYDQ',
  authDomain: 'ignite-100.firebaseapp.com',
  projectId: 'ignite-100',
  storageBucket: 'ignite-100.firebasestorage.app',
  messagingSenderId: '308193075693',
  appId: '1:308193075693:web:9fc5a116ab2ead1b6387e4',
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { app, auth, db }
