// import { FirebaseError } from 'firebase/app'
// import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore'
// import {
//   AGE_RANGES,
//   EDUCATION_LEVELS,
//   GENDER_OPTIONS,
//   HEARD_FROM_OPTIONS,
//   STACKS,
//   STEP_FIELDS,
// } from '../constants/form-data'
// import { getFirestoreErrorMessage } from './firebase-errors'
// import { db } from './firebase'

// function getQueryReferralCode() {
//   if (typeof window === 'undefined') return ''
//   return new URLSearchParams(window.location.search).get('ref')?.trim() ?? ''
// }

// function isEmail(value) {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
// }

// function isPhone(value) {
//   const stripped = value.replace(/[^\d]/g, '')
//   return stripped.length >= 10 && stripped.length <= 15 && /^[0-9+\-\s()]+$/.test(value)
// }

// function trimValue(value) {
//   return typeof value === 'string' ? value.trim() : value
// }

// function normalizePhone(value) {
//   return trimValue(value).replace(/[^\d]/g, '')
// }

// function normalizeValues(values) {
//   return {
//     ...values,
//     fullName: trimValue(values.fullName),
//     email: trimValue(values.email).toLowerCase(),
//     phone: trimValue(values.phone),
//     institution: trimValue(values.institution),
//     motivation: trimValue(values.motivation),
//     heardFrom: trimValue(values.heardFrom),
//     referralCode: trimValue(values.referralCode),
//   }
// }

// async function hashValue(value) {
//   const encoded = new TextEncoder().encode(value)
//   const digest = await crypto.subtle.digest('SHA-256', encoded)
//   return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
// }

// async function createDuplicateKeys(values) {
//   const emailKey = await hashValue(`email:${values.email}`)
//   const phoneKey = await hashValue(`phone:${normalizePhone(values.phone)}`)
//   return { emailKey, phoneKey }
// }

// function validateRegistration(values) {
//   const errors = {}
//   const data = normalizeValues(values)

//   if (!data.fullName || data.fullName.length < 2) {
//     errors.fullName = 'Full name must be at least 2 characters'
//   } else if (data.fullName.length > 100) {
//     errors.fullName = 'Full name must be less than 100 characters'
//   }

//   if (!data.email || !isEmail(data.email)) {
//     errors.email = 'Please enter a valid email address'
//   }

//   if (!data.phone || !isPhone(data.phone)) {
//     errors.phone = 'Please enter a valid phone number'
//   }

//   if (!GENDER_OPTIONS.some((option) => option.value === data.gender)) {
//     errors.gender = 'Please select your gender'
//   }

//   if (!AGE_RANGES.some((option) => option.value === data.ageRange)) {
//     errors.ageRange = 'Please select your age range'
//   }

//   if (!EDUCATION_LEVELS.includes(data.educationLevel)) {
//     errors.educationLevel = 'Please select your education level'
//   }

//   if (!data.institution || data.institution.length < 2) {
//     errors.institution = 'Institution name must be at least 2 characters'
//   } else if (data.institution.length > 200) {
//     errors.institution = 'Institution name must be less than 200 characters'
//   }

//   if (!STACKS.some((option) => option.id === data.stack)) {
//     errors.stack = 'Please select a track'
//   }

//   if (!data.motivation || data.motivation.length < 50) {
//     errors.motivation = 'Please write at least 50 characters'
//   } else if (data.motivation.length > 1000) {
//     errors.motivation = 'Motivation must be less than 1000 characters'
//   }

//   if (!HEARD_FROM_OPTIONS.includes(data.heardFrom)) {
//     errors.heardFrom = 'Please tell us how you heard about us'
//   }

//   if (data.referralCode && data.referralCode.length > 100) {
//     errors.referralCode = 'Referral code must be less than 100 characters'
//   }

//   return errors
// }

// function getFirstInvalidStep(errors) {
//   if (STEP_FIELDS[1].some((field) => errors[field])) return 1
//   if (STEP_FIELDS[2].some((field) => errors[field])) return 2
//   return 3
// }

// async function submitRegistration(values) {
//   const data = normalizeValues(values)
//   const { _hp, ...registrationData } = data

//   if (_hp) {
//     return { success: true, honeypot: true }
//   }

//   try {
//     const registrationsRef = collection(db, 'registrations')
//     const registrationRef = doc(registrationsRef)
//     const { emailKey, phoneKey } = await createDuplicateKeys(data)
//     const emailLockRef = doc(db, 'registrationEmails', emailKey)
//     const phoneLockRef = doc(db, 'registrationPhones', phoneKey)
//     const batch = writeBatch(db)

//     batch.set(registrationRef, {
//       ...registrationData,
//       createdAt: serverTimestamp(),
//     })
//     batch.set(emailLockRef, {
//       registrationId: registrationRef.id,
//       createdAt: serverTimestamp(),
//     })
//     batch.set(phoneLockRef, {
//       registrationId: registrationRef.id,
//       createdAt: serverTimestamp(),
//     })

//     await batch.commit()

//     return { success: true }
//   } catch (error) {
//     if (error instanceof FirebaseError && error.code === 'permission-denied') {
//       return {
//         success: false,
//         status: 409,
//         error: getFirestoreErrorMessage(error, 'submit'),
//       }
//     }

//     console.error('Registration error:', error)
//     return {
//       success: false,
//       status: 500,
//       error: getFirestoreErrorMessage(error, 'submit'),
//     }
//   }
// }

// export { getFirstInvalidStep, getQueryReferralCode, normalizeValues, submitRegistration, validateRegistration }



import { FirebaseError } from 'firebase/app'
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import {
  AGE_RANGES,
  EDUCATION_LEVELS,
  GENDER_OPTIONS,
  HEARD_FROM_OPTIONS,
  STACKS,
  STEP_FIELDS,
} from '../constants/form-data'
import { db } from './firebase'

function getQueryReferralCode() {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('ref')?.trim() ?? ''
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isPhone(value) {
  const stripped = value.replace(/[^\d]/g, '')
  return stripped.length >= 10 && stripped.length <= 15 && /^[0-9+\-\s()]+$/.test(value)
}

function trimValue(value) {
  return typeof value === 'string' ? value.trim() : value
}

function normalizePhone(value) {
  return trimValue(value).replace(/[^\d]/g, '')
}

function normalizeValues(values) {
  return {
    ...values,
    fullName: trimValue(values.fullName),
    email: trimValue(values.email).toLowerCase(),
    phone: trimValue(values.phone),
    institution: trimValue(values.institution),
    motivation: trimValue(values.motivation),
    heardFrom: trimValue(values.heardFrom),
    referralCode: trimValue(values.referralCode),
  }
}

async function hashValue(value) {
  const encoded = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

function validateRegistration(values) {
  const errors = {}
  const data = normalizeValues(values)

  if (!data.fullName || data.fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters'
  } else if (data.fullName.length > 100) {
    errors.fullName = 'Full name must be less than 100 characters'
  }

  if (!data.email || !isEmail(data.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!data.phone || !isPhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }

  if (!GENDER_OPTIONS.some((o) => o.value === data.gender)) {
    errors.gender = 'Please select your gender'
  }

  if (!AGE_RANGES.some((o) => o.value === data.ageRange)) {
    errors.ageRange = 'Please select your age range'
  }

  if (!EDUCATION_LEVELS.includes(data.educationLevel)) {
    errors.educationLevel = 'Please select your education level'
  }

  if (!data.institution || data.institution.length < 2) {
    errors.institution = 'Institution name must be at least 2 characters'
  } else if (data.institution.length > 200) {
    errors.institution = 'Institution name must be less than 200 characters'
  }

  if (!STACKS.some((o) => o.id === data.stack)) {
    errors.stack = 'Please select a track'
  }

  if (!data.motivation || data.motivation.length < 50) {
    errors.motivation = 'Please write at least 50 characters'
  } else if (data.motivation.length > 1000) {
    errors.motivation = 'Motivation must be less than 1000 characters'
  }

  if (!HEARD_FROM_OPTIONS.includes(data.heardFrom)) {
    errors.heardFrom = 'Please tell us how you heard about us'
  }

  if (data.referralCode && data.referralCode.length > 100) {
    errors.referralCode = 'Referral code must be less than 100 characters'
  }

  return errors
}

function getFirstInvalidStep(errors) {
  if (STEP_FIELDS[1].some((field) => errors[field])) return 1
  if (STEP_FIELDS[2].some((field) => errors[field])) return 2
  return 3
}

async function submitRegistration(values) {
  const data = normalizeValues(values)
  const { _hp, ...registrationData } = data

  // Honeypot check
  if (_hp) {
    return { success: true, honeypot: true }
  }

  try {
    // Step 1: Try to claim the email lock (fails if already taken)
    const emailKey = await hashValue(`email:${data.email}`)
    const phoneKey = await hashValue(`phone:${normalizePhone(data.phone)}`)

    const emailLockRef = doc(db, 'registrationEmails', emailKey)
    const phoneLockRef = doc(db, 'registrationPhones', phoneKey)

    // addDoc the registration first to get an ID
    const registrationRef = await addDoc(collection(db, 'registrations'), {
      ...registrationData,
      createdAt: serverTimestamp(),
    })

    // Now write the lock docs — if either already exists this will throw
    // permission-denied (rules block create if doc already exists via the
    // lock collections having no update/delete allowed, so a second create
    // attempt on the same key will be denied by Firestore's uniqueness)
    try {
      await setDoc(emailLockRef, {
        registrationId: registrationRef.id,
        createdAt: serverTimestamp(),
      })
    } catch (lockError) {
      if (
        lockError instanceof FirebaseError &&
        lockError.code === 'permission-denied'
      ) {
        return {
          success: false,
          status: 409,
          error: 'This email address has already been used to apply.',
        }
      }
      throw lockError
    }

    try {
      await setDoc(phoneLockRef, {
        registrationId: registrationRef.id,
        createdAt: serverTimestamp(),
      })
    } catch (lockError) {
      if (
        lockError instanceof FirebaseError &&
        lockError.code === 'permission-denied'
      ) {
        return {
          success: false,
          status: 409,
          error: 'This phone number has already been used to apply.',
        }
      }
      throw lockError
    }

    return { success: true }
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      error.code === 'permission-denied'
    ) {
      return {
        success: false,
        status: 409,
        error: 'This email or phone number has already been used to apply.',
      }
    }

    console.error('Registration error:', error)
    return {
      success: false,
      status: 500,
      error: 'Something went wrong. Please try again later.',
    }
  }
}

export {
  getFirstInvalidStep,
  getQueryReferralCode,
  normalizeValues,
  submitRegistration,
  validateRegistration,
}