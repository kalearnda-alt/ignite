import { FirebaseError } from 'firebase/app'

function getAuthErrorMessage(error, action = 'sign_in') {
  if (!(error instanceof FirebaseError)) {
    return action === 'sign_up'
      ? 'Unable to create your account right now. Please try again.'
      : 'Unable to sign in right now. Please try again.'
  }

  const authMessages = {
    'auth/email-already-in-use': 'This account already exists. Sign in instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/user-not-found': 'No account was found for these credentials.',
    'auth/wrong-password': 'The email or password is incorrect.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/operation-not-allowed': 'Email and password sign-in is not enabled in Firebase Authentication.',
    'auth/weak-password': 'Use a stronger password with at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts detected. Please wait and try again.',
    'auth/network-request-failed': 'Network issue detected. Check your connection and try again.',
  }

  const fallback =
    action === 'sign_up'
      ? 'Unable to create your account right now. Please try again.'
      : 'Unable to sign in right now. Please try again.'

  return authMessages[error.code] || fallback
}

function getFirestoreErrorMessage(error, action = 'load') {
  if (!(error instanceof FirebaseError)) {
    if (action === 'submit') {
      return 'Something went wrong while sending your application. Please try again.'
    }

    if (action === 'create_user_profile') {
      return 'Unable to save your user profile right now. Please try again.'
    }

    return 'Unable to load registrations right now.'
  }

  const firestoreMessages = {
    'permission-denied':
      action === 'submit'
        ? 'This email address or phone number has already been used to apply.'
        : action === 'create_user_profile'
          ? 'Firestore rules blocked the user profile from being created. Deploy the latest rules, then try again.'
          : 'You do not have permission to access this data.',
    'unavailable':
      action === 'submit'
        ? 'Submission service is temporarily unavailable. Please try again.'
        : action === 'create_user_profile'
          ? 'Unable to save your user profile right now. Please try again in a moment.'
          : 'Registrations are temporarily unavailable. Please refresh in a moment.',
    'deadline-exceeded':
      action === 'submit'
        ? 'Submission timed out. Please try again.'
        : action === 'create_user_profile'
          ? 'Saving your user profile took too long. Please try again.'
          : 'Loading registrations took too long. Please try again.',
  }

  return (
    firestoreMessages[error.code] ||
    (action === 'submit'
      ? 'Something went wrong while sending your application. Please try again.'
      : action === 'create_user_profile'
        ? 'Unable to save your user profile right now. Please try again.'
        : 'Unable to load registrations right now.')
  )
}

export { getAuthErrorMessage, getFirestoreErrorMessage }
