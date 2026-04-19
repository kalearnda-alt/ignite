import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Users,
} from 'lucide-react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getAuthErrorMessage, getFirestoreErrorMessage } from '../lib/firebase-errors'
import { auth, db } from '../lib/firebase'

const TRACK_OPTIONS = [
  { value: 'all', label: 'All tracks' },
  { value: 'web_development', label: 'Web Development' },
  { value: 'data_analytics', label: 'Data Analytics' },
  { value: 'product_design', label: 'Product Design' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'ai_automation', label: 'AI & Automation' },
]

const GENDER_OPTIONS = [
  { value: 'all', label: 'All genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All sources' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Twitter', label: 'Twitter' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Friend or Colleague', label: 'Friend or Colleague' },
  { value: 'School/University', label: 'School/University' },
  { value: 'Google Search', label: 'Google Search' },
  { value: 'Email Newsletter', label: 'Email Newsletter' },
  { value: 'Event or Conference', label: 'Event or Conference' },
  { value: 'Other', label: 'Other' },
]

const DATE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
]

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'applications', label: 'Applications', icon: TableProperties },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

function cardShell(extra = '') {
  return `rounded-[28px] border border-slate-900/10 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl ${extra}`.trim()
}

function inputClass() {
  return 'min-h-12 w-full rounded-[16px] border border-slate-900/10 bg-white/90 px-4 text-dark outline-none transition focus:border-accent/40 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.10)]'
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

async function getUserRole(uid) {
  const profileSnapshot = await getDoc(doc(db, 'users', uid))

  if (!profileSnapshot.exists()) {
    return { exists: false, role: '' }
  }

  return {
    exists: true,
    role: profileSnapshot.data()?.role || '',
  }
}

function getDateObject(value) {
  if (!value) return null
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (value?.toDate) {
    const date = value.toDate()
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

function formatDate(value) {
  const date = getDateObject(value)
  return date ? date.toLocaleString() : 'Pending'
}

function formatDateForCsv(value) {
  const date = getDateObject(value)
  return date ? date.toISOString() : ''
}

function formatTrack(value) {
  const labels = {
    web_development: 'Web Development',
    data_analytics: 'Data Analytics',
    product_design: 'Product Design',
    digital_marketing: 'Digital Marketing',
    ai_automation: 'AI & Automation',
  }

  return labels[value] || 'N/A'
}

function formatGender(value) {
  const labels = {
    male: 'Male',
    female: 'Female',
    prefer_not_to_say: 'Prefer not to say',
  }

  return labels[value] || 'N/A'
}

function formatAgeRange(value) {
  const labels = {
    under_18: 'Under 18',
    '18_25': '18 - 25',
    '26_30': '26 - 30',
    '31_35': '31 - 35',
    '36_plus': '36 and above',
  }

  return labels[value] || 'N/A'
}

function formatEducation(value) {
  const labels = {
    secondary: 'Secondary',
    undergraduate: 'Undergraduate',
    graduate: 'Graduate',
    postgraduate: 'Postgraduate',
    other: 'Other',
  }

  return labels[value] || 'N/A'
}

function formatValue(value, fallback = 'N/A') {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || fallback
  }

  return value ?? fallback
}

function matchesDateFilter(value, filter) {
  if (filter === 'all') return true

  const date = getDateObject(value)
  if (!date) return false

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (filter === 'today') {
    return date >= todayStart
  }

  const daysBack = filter === 'last_7_days' ? 7 : 30
  const cutoff = new Date(todayStart)
  cutoff.setDate(cutoff.getDate() - (daysBack - 1))
  return date >= cutoff
}

function escapeCsvValue(value) {
  const normalized = String(value ?? '')
  return `"${normalized.replace(/"/g, '""')}"`
}

function exportRegistrationsSheet(items) {
  if (typeof window === 'undefined' || items.length === 0) return

  const rows = [
    [
      'Full Name',
      'Email',
      'Phone',
      'Track',
      'Gender',
      'Age Range',
      'Education',
      'Institution',
      'Heard From',
      'Referral Code',
      'Submitted At',
      'Motivation',
    ],
    ...items.map((item) => [
      formatValue(item.fullName, ''),
      formatValue(item.email, ''),
      formatValue(item.phone, ''),
      formatTrack(item.stack),
      formatGender(item.gender),
      formatAgeRange(item.ageRange),
      formatEducation(item.educationLevel),
      formatValue(item.institution, ''),
      formatValue(item.heardFrom, ''),
      formatValue(item.referralCode, ''),
      formatDateForCsv(item.createdAt),
      formatValue(item.motivation, ''),
    ]),
  ]

  const csv = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)

  link.href = url
  link.download = `ignite-registrations-sheet-${stamp}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function AdminDashboard() {
  const authFlowRef = useRef('idle')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState('sign_in')
  const [authError, setAuthError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [dataError, setDataError] = useState('')
  const [submittingAuth, setSubmittingAuth] = useState(false)
  const [registrations, setRegistrations] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [trackFilter, setTrackFilter] = useState('all')
  const [genderFilter, setGenderFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedRegistrationId, setSelectedRegistrationId] = useState('')
  const [loginForm, setLoginForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    let isActive = true

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!isActive) return

      if (!nextUser) {
        setUser(null)
        authFlowRef.current = 'idle'
        setLoading(false)
        return
      }

      if (authFlowRef.current === 'sign_up') {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const profile = await getUserRole(nextUser.uid)

        if (!isActive) return

        if (profile.role === 'admin') {
          setUser(nextUser)
          setAuthError('')
          setSuccessMessage('')
          authFlowRef.current = 'idle'
        } else {
          setUser(null)
          setAuthError(
            profile.exists
              ? 'This account is signed up, but its role is still user. Update the Firestore users collection role to admin, then sign in again.'
              : 'This account does not have a users profile yet. Sign up here first, then update the role to admin when you are ready.',
          )
          authFlowRef.current = 'idle'
          await signOut(auth)
        }
      } catch (error) {
        if (!isActive) return
        setUser(null)
        authFlowRef.current = 'idle'
        setAuthError(getFirestoreErrorMessage(error, 'load'))
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setRegistrations([])
      setSelectedRegistrationId('')
      return undefined
    }

    const registrationsQuery = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'))

    return onSnapshot(
      registrationsQuery,
      (snapshot) => {
        setDataError('')
        setRegistrations(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })),
        )
      },
      (snapshotError) => {
        setDataError(getFirestoreErrorMessage(snapshotError, 'load'))
      },
    )
  }, [user])

  const filteredRegistrations = useMemo(() => {
    const queryText = searchQuery.trim().toLowerCase()

    return registrations.filter((item) => {
      const searchFields = [
        item.fullName,
        item.email,
        item.phone,
        item.institution,
        item.motivation,
        item.heardFrom,
        item.referralCode,
        formatTrack(item.stack),
        formatGender(item.gender),
        formatAgeRange(item.ageRange),
        formatEducation(item.educationLevel),
      ]

      const matchesSearch =
        !queryText ||
        searchFields.filter(Boolean).some((value) => String(value).toLowerCase().includes(queryText))

      const matchesTrack = trackFilter === 'all' || item.stack === trackFilter
      const matchesGender = genderFilter === 'all' || item.gender === genderFilter
      const matchesSource = sourceFilter === 'all' || item.heardFrom === sourceFilter
      const matchesDate = matchesDateFilter(item.createdAt, dateFilter)

      return matchesSearch && matchesTrack && matchesGender && matchesSource && matchesDate
    })
  }, [dateFilter, genderFilter, registrations, searchQuery, sourceFilter, trackFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, trackFilter, genderFilter, sourceFilter, dateFilter, pageSize])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredRegistrations.length / pageSize)),
    [filteredRegistrations.length, pageSize],
  )

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedRegistrations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredRegistrations.slice(startIndex, startIndex + pageSize)
  }, [currentPage, filteredRegistrations, pageSize])

  useEffect(() => {
    if (paginatedRegistrations.length === 0) {
      setSelectedRegistrationId('')
      return
    }

    setSelectedRegistrationId((current) =>
      paginatedRegistrations.some((item) => item.id === current) ? current : paginatedRegistrations[0].id,
    )
  }, [paginatedRegistrations])

  const selectedRegistration = useMemo(
    () => filteredRegistrations.find((item) => item.id === selectedRegistrationId) ?? paginatedRegistrations[0] ?? null,
    [filteredRegistrations, paginatedRegistrations, selectedRegistrationId],
  )

  const stats = useMemo(() => {
    const trackCounts = registrations.reduce((acc, item) => {
      const key = item.stack || 'unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    return [
      { label: 'Total registrations', value: registrations.length, tone: 'text-dark' },
      { label: 'Filtered results', value: filteredRegistrations.length, tone: 'text-slate-700' },
      { label: 'Web Development', value: trackCounts.web_development || 0, tone: 'text-orange-600' },
      { label: 'AI & Automation', value: trackCounts.ai_automation || 0, tone: 'text-sky-700' },
    ]
  }, [filteredRegistrations.length, registrations])

  const topTracks = useMemo(() => {
    const counts = registrations.reduce((acc, item) => {
      const label = formatTrack(item.stack)
      acc[label] = (acc[label] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .filter(([label]) => label !== 'N/A')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [registrations])

  const sourceBreakdown = useMemo(() => {
    const counts = registrations.reduce((acc, item) => {
      const key = formatValue(item.heardFrom, 'Unknown')
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [registrations])

  const genderBreakdown = useMemo(() => {
    const counts = registrations.reduce((acc, item) => {
      const key = formatGender(item.gender)
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .filter(([label]) => label !== 'N/A')
      .sort((a, b) => b[1] - a[1])
  }, [registrations])

  const latestRegistration = registrations[0] ?? null
  const pageStart = filteredRegistrations.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const pageEnd = filteredRegistrations.length === 0 ? 0 : Math.min(currentPage * pageSize, filteredRegistrations.length)

  function updateAuthField(field, value) {
    setLoginForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function resetFilters() {
    setSearchQuery('')
    setTrackFilter('all')
    setGenderFilter('all')
    setSourceFilter('all')
    setDateFilter('all')
  }

  function switchAuthMode(mode) {
    setAuthMode(mode)
    setAuthError('')
    setSuccessMessage('')
    setLoginForm((current) => ({
      ...current,
      password: '',
      confirmPassword: '',
    }))
  }

  async function handleLogin(event) {
    event.preventDefault()
    authFlowRef.current = 'sign_in'
    setSubmittingAuth(true)
    setAuthError('')
    setSuccessMessage('')

    try {
      await signInWithEmailAndPassword(auth, normalizeEmail(loginForm.email), loginForm.password)
    } catch (loginError) {
      authFlowRef.current = 'idle'
      setAuthError(getAuthErrorMessage(loginError, 'sign_in'))
    } finally {
      setSubmittingAuth(false)
    }
  }

  async function handleSignUp(event) {
    event.preventDefault()
    authFlowRef.current = 'sign_up'
    setSubmittingAuth(true)
    setAuthError('')
    setSuccessMessage('')

    const fullName = loginForm.fullName.trim()
    const email = normalizeEmail(loginForm.email)

    if (fullName.length < 2) {
      authFlowRef.current = 'idle'
      setAuthError('Enter your full name to create an account.')
      setSubmittingAuth(false)
      return
    }

    if (loginForm.password !== loginForm.confirmPassword) {
      authFlowRef.current = 'idle'
      setAuthError('Passwords do not match.')
      setSubmittingAuth(false)
      return
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, loginForm.password)

      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        fullName,
        email,
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await signOut(auth)
      authFlowRef.current = 'idle'

      setAuthMode('sign_in')
      setLoginForm({
        fullName: '',
        email,
        password: '',
        confirmPassword: '',
      })
      setSuccessMessage(
        'Account created successfully. The default role is user. Update this account to admin in the Firestore users collection, then sign in here.',
      )
    } catch (signUpError) {
      authFlowRef.current = 'idle'
      setAuthError(
        signUpError?.code?.startsWith('auth/')
          ? getAuthErrorMessage(signUpError, 'sign_up')
          : getFirestoreErrorMessage(signUpError, 'create_user_profile'),
      )
    } finally {
      setSubmittingAuth(false)
    }
  }

  async function handleLogout() {
    await signOut(auth)
    setLoginForm({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.18),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-[1180px]">
          <div className={cardShell('mx-auto max-w-[620px] p-8')}>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent-strong">
              Ignite-100 admin
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.6rem)] leading-[0.95] tracking-[-0.06em] text-dark">
              Preparing admin console
            </h1>
            <p className="mt-4 max-w-[48ch] text-sm leading-[1.8] text-slate-600">
              Checking your Firebase session and admin role.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.20),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#edf2f7_45%,#e5ebf3_100%)] px-4 py-6 md:px-8 md:py-10">
        <div className="mx-auto grid max-w-[1180px] gap-6">
          <section className="relative overflow-hidden rounded-[32px] border border-slate-900/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.9))] px-6 py-7 text-white shadow-[0_28px_90px_rgba(15,23,42,0.26)] md:px-8 md:py-9">
            <div className="absolute inset-y-0 right-[-6%] w-[42%] bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.32),transparent_58%)]" />
            <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-orange-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Firebase auth protected
                </div>
                <h1 className="mt-4 max-w-[11ch] font-display text-[clamp(2.4rem,7vw,5rem)] leading-[0.92] tracking-[-0.08em]">
                  Admin route access
                </h1>
                <p className="mt-4 max-w-[58ch] text-sm leading-[1.85] text-slate-200 md:text-[15px]">
                  Sign in here if you already have an account. If not, create one here first. New
                  accounts are created with the default <strong>user</strong> role, and you can
                  promote them later in the Firestore <strong>users</strong> collection.
                </p>
              </div>

              <div className="grid gap-3 rounded-[24px] border border-white/12 bg-white/8 p-4 backdrop-blur md:p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-400/18 text-orange-200">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-orange-200/90">
                      Role-based access
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{'users/{uid}.role = admin'}</p>
                  </div>
                </div>
                <p className="text-[13px] leading-[1.7] text-slate-200">
                  This route no longer depends on a hard-coded admin email. Access comes from the
                  Firestore user role instead.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)]">
            <article className={cardShell('p-6 md:p-7')}>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                <Sparkles className="h-3.5 w-3.5" />
                Access notes
              </div>
              <h2 className="mt-4 font-display text-[1.9rem] leading-[1] tracking-[-0.05em] text-dark">
                How this works now
              </h2>
              <div className="mt-5 grid gap-3 text-sm leading-[1.8] text-slate-600">
                <p>Use sign in if the Firebase Authentication account already exists.</p>
                <p>Use sign up here to create a new Firebase account and a matching users document.</p>
                <p>Every new account starts with the role set to user until you change it to admin in Firestore.</p>
                <p>Only accounts whose Firestore user role is admin can open the registrations dashboard.</p>
              </div>
            </article>

            <article className={cardShell('relative overflow-hidden p-6 md:p-7')}>
              <div className="absolute right-[-20px] top-[-20px] h-28 w-28 rounded-full bg-orange-400/12 blur-2xl" />
              <div className="relative z-10">
                <div className="inline-flex overflow-hidden rounded-full border border-slate-900/10 bg-slate-100 p-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-600">
                  <button
                    type="button"
                    className={`rounded-full px-4 py-2 transition ${authMode === 'sign_in' ? 'bg-white text-dark shadow-sm' : ''}`}
                    onClick={() => switchAuthMode('sign_in')}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-4 py-2 transition ${authMode === 'sign_up' ? 'bg-white text-dark shadow-sm' : ''}`}
                    onClick={() => switchAuthMode('sign_up')}
                  >
                    Sign up
                  </button>
                </div>

                <h2 className="mt-4 font-display text-[1.9rem] leading-[1] tracking-[-0.05em] text-dark">
                  {authMode === 'sign_in' ? 'Open dashboard' : 'Create account'}
                </h2>
                <p className="mt-3 text-sm leading-[1.8] text-slate-600">
                  {authMode === 'sign_in'
                    ? 'Sign in with your Firebase account. If your Firestore role is admin, the dashboard opens immediately.'
                    : 'Create a Firebase account here. It will be stored with the default role set to user.'}
                </p>

                <form className="mt-6 grid gap-4" onSubmit={authMode === 'sign_in' ? handleLogin : handleSignUp}>
                  {authMode === 'sign_up' && (
                    <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
                      Full name
                      <input
                        type="text"
                        value={loginForm.fullName}
                        onChange={(event) => updateAuthField('fullName', event.target.value)}
                        className={inputClass()}
                        placeholder="e.g. Adaeze Okafor"
                      />
                    </label>
                  )}

                  <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
                    Email
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(event) => updateAuthField('email', event.target.value)}
                      className={inputClass()}
                      placeholder="you@example.com"
                    />
                  </label>

                  <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
                    Password
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(event) => updateAuthField('password', event.target.value)}
                      className={inputClass()}
                      placeholder="Enter your password"
                    />
                  </label>

                  {authMode === 'sign_up' && (
                    <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
                      Confirm password
                      <input
                        type="password"
                        value={loginForm.confirmPassword}
                        onChange={(event) => updateAuthField('confirmPassword', event.target.value)}
                        className={inputClass()}
                        placeholder="Repeat your password"
                      />
                    </label>
                  )}

                  {successMessage && (
                    <div className="rounded-[18px] border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-[13px] leading-[1.6] text-emerald-700">
                      {successMessage}
                    </div>
                  )}

                  {authError && (
                    <div className="rounded-[18px] border border-red-500/20 bg-red-50 px-4 py-3 text-[13px] leading-[1.6] text-red-700">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center rounded-[16px] bg-dark px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={submittingAuth}
                  >
                    {submittingAuth
                      ? authMode === 'sign_in'
                        ? 'Signing in...'
                        : 'Creating account...'
                      : authMode === 'sign_in'
                        ? 'Sign in'
                        : 'Create account'}
                  </button>
                </form>

                <a className="mt-5 inline-flex text-[13px] font-semibold text-slate-500" href="/">
                  Back to public site
                </a>
              </div>
            </article>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.18),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_42%,#e5eaf3_100%)] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto grid max-w-[1380px] gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={cardShell('h-fit p-4 md:sticky md:top-6 md:p-5')}>
          <div className="overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.92))] p-5 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-orange-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Ignite-100 admin
            </div>
            <h1 className="mt-4 font-display text-[2.2rem] leading-[0.92] tracking-[-0.07em]">
              Dashboard
            </h1>
            <p className="mt-3 text-sm leading-[1.75] text-slate-200">
              A cleaner control room for registrations, filters, exports, and admin review.
            </p>
          </div>

          <div className="mt-4 rounded-[24px] border border-slate-900/8 bg-slate-50/80 p-3">
            <p className="px-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
              Navigation
            </p>
            <div className="mt-3 grid gap-2">
              {ADMIN_TABS.map((tab) => (
                <SidebarTab
                  key={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-emerald-500/15 bg-emerald-50 p-4 text-[13px] leading-[1.7] text-emerald-800">
            Firestore reads are available because this account is marked as <strong>admin</strong> in the users collection.
          </div>

          <div className="mt-4 rounded-[24px] border border-slate-900/8 bg-white/80 p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
              Session
            </p>
            <p className="mt-3 break-all text-sm font-semibold text-dark">{user.email}</p>
            <p className="mt-2 text-[13px] leading-[1.7] text-slate-600">
              Signed in with a Firestore user role of admin.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[16px] bg-slate-100 px-4 text-sm font-semibold text-dark transition hover:bg-slate-200"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="grid gap-6">
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <section className="relative overflow-hidden rounded-[32px] border border-slate-900/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.92))] px-6 py-7 text-white shadow-[0_28px_90px_rgba(15,23,42,0.24)] md:px-8 md:py-8">
              <div className="absolute left-[55%] top-[-18%] h-[220px] w-[220px] rounded-full bg-orange-400/20 blur-3xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-orange-200">
                  {activeTab === 'overview' ? <LayoutDashboard className="h-3.5 w-3.5" /> : activeTab === 'applications' ? <TableProperties className="h-3.5 w-3.5" /> : <BarChart3 className="h-3.5 w-3.5" />}
                  {activeTab === 'overview' ? 'Operations overview' : activeTab === 'applications' ? 'Applications workspace' : 'Analytics workspace'}
                </div>
                <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(2.3rem,5vw,4.5rem)] leading-[0.9] tracking-[-0.08em]">
                  {activeTab === 'overview' ? 'Registrations command center' : activeTab === 'applications' ? 'Applicant review desk' : 'Snapshot of demand'}
                </h2>
                <p className="mt-4 max-w-[62ch] text-sm leading-[1.85] text-slate-200 md:text-[15px]">
                  {activeTab === 'overview'
                    ? 'Start from the big picture, see what changed recently, and jump into the most important records.'
                    : activeTab === 'applications'
                      ? 'Use focused filters, browse the table, inspect full application details, and export exactly what you need.'
                      : 'Track where interest is coming from, which programs lead demand, and how your pipeline is distributed.'}
                </p>
              </div>
            </section>

            <section className={cardShell('grid gap-4 p-6 md:p-7')}>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                  At a glance
                </p>
                <h3 className="mt-2 font-display text-[1.7rem] leading-[1.02] tracking-[-0.05em] text-dark">
                  {latestRegistration ? formatValue(latestRegistration.fullName) : 'No applications yet'}
                </h3>
                <p className="mt-3 text-sm leading-[1.8] text-slate-600">
                  {latestRegistration
                    ? `Latest registration arrived ${formatDate(latestRegistration.createdAt)}.`
                    : 'Latest registration details will appear here once submissions start coming in.'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {stats.map((stat) => (
                  <StatCard key={stat.label} label={stat.label} value={stat.value} tone={stat.tone} />
                ))}
              </div>
            </section>
          </section>

          {activeTab === 'overview' && (
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(330px,0.8fr)]">
              <div className="grid gap-6">
                <section className={cardShell('p-5 md:p-6')}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                        Highlights
                      </p>
                      <h3 className="mt-2 font-display text-[1.7rem] leading-[1] tracking-[-0.05em] text-dark">
                        Quick admin summary
                      </h3>
                    </div>
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] bg-dark px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                      onClick={() => exportRegistrationsSheet(filteredRegistrations)}
                      disabled={filteredRegistrations.length === 0}
                    >
                      <Download className="h-4 w-4" />
                      Export filtered sheet
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-900/8 bg-slate-50/80 p-5">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                        Top tracks
                      </p>
                      <div className="mt-4 grid gap-3">
                        <InsightList items={topTracks} emptyText="Track analytics will appear once registrations are available." />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-900/8 bg-slate-50/80 p-5">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                        Top sources
                      </p>
                      <div className="mt-4 grid gap-3">
                        <InsightList items={sourceBreakdown} emptyText="Source analytics will appear once registrations are available." />
                      </div>
                    </div>
                  </div>
                </section>

                <section className={cardShell('overflow-hidden')}>
                  <div className="border-b border-slate-900/8 px-5 py-4 md:px-6">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                      Latest applications
                    </p>
                    <p className="mt-2 text-sm leading-[1.8] text-slate-600">
                      Your newest applicants are listed here for quick review before diving into the full table.
                    </p>
                  </div>

                  <div className="overflow-auto">
                    <table className="min-w-[820px] w-full border-collapse">
                      <thead>
                        <tr>
                          {['Name', 'Email', 'Track', 'Source', 'Submitted'].map((label) => (
                            <th
                              key={label}
                              className="bg-slate-50/90 px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-600"
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.slice(0, 6).map((item) => (
                          <tr
                            key={item.id}
                            className="cursor-pointer transition hover:bg-orange-50/45"
                            onClick={() => {
                              setActiveTab('applications')
                              setSelectedRegistrationId(item.id)
                            }}
                          >
                            <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] font-semibold text-dark">
                              {formatValue(item.fullName)}
                            </td>
                            <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                              {formatValue(item.email)}
                            </td>
                            <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                              {formatTrack(item.stack)}
                            </td>
                            <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                              {formatValue(item.heardFrom)}
                            </td>
                            <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                              {formatDate(item.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <aside className="grid h-fit gap-6">
                <section className={cardShell('p-5 md:p-6')}>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                    Record spotlight
                  </p>
                  <h3 className="mt-2 font-display text-[1.7rem] leading-[1] tracking-[-0.05em] text-dark">
                    {selectedRegistration ? formatValue(selectedRegistration.fullName) : 'No selection'}
                  </h3>

                  {selectedRegistration ? (
                    <div className="mt-6 grid gap-4">
                      <div className="grid gap-3">
                        <DetailItem label="Email" value={formatValue(selectedRegistration.email)} />
                        <DetailItem label="Phone" value={formatValue(selectedRegistration.phone)} />
                        <DetailItem label="Track" value={formatTrack(selectedRegistration.stack)} />
                        <DetailItem label="Submitted" value={formatDate(selectedRegistration.createdAt)} />
                      </div>
                      <div className="rounded-[22px] border border-slate-900/8 bg-slate-50/70 p-4">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                          Motivation
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-[14px] leading-[1.8] text-slate-700">
                          {formatValue(selectedRegistration.motivation)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-[22px] border border-dashed border-slate-900/10 bg-slate-50/80 px-4 py-8 text-center text-[14px] leading-[1.7] text-slate-500">
                      Select any registration to preview details here.
                    </div>
                  )}
                </section>
              </aside>
            </section>
          )}

          {activeTab === 'applications' && (
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.82fr)]">
              <div className="grid gap-6">
                <section className={cardShell('p-5 md:p-6')}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                        Directory
                      </p>
                      <h2 className="mt-2 font-display text-[1.7rem] leading-[1] tracking-[-0.05em] text-dark">
                        Registered users
                      </h2>
                      <p className="mt-3 text-sm leading-[1.8] text-slate-600">
                        Search by name, email, phone, source, school, or motivation text.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] border border-slate-900/10 bg-white px-4 text-sm font-semibold text-dark transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={() => exportRegistrationsSheet(paginatedRegistrations)}
                        disabled={paginatedRegistrations.length === 0}
                      >
                        <Download className="h-4 w-4" />
                        Export page
                      </button>
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] bg-dark px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={() => exportRegistrationsSheet(filteredRegistrations)}
                        disabled={filteredRegistrations.length === 0}
                      >
                        <Download className="h-4 w-4" />
                        Export filtered sheet
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700 md:col-span-2 xl:col-span-3">
                      Search records
                      <span className="relative block">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          className={`${inputClass()} pl-11`}
                          placeholder="Find by name, email, phone, source, institution, or track"
                        />
                      </span>
                    </label>

                    <FilterSelect label="Track" value={trackFilter} onChange={setTrackFilter} options={TRACK_OPTIONS} />
                    <FilterSelect label="Gender" value={genderFilter} onChange={setGenderFilter} options={GENDER_OPTIONS} />
                    <FilterSelect label="Source" value={sourceFilter} onChange={setSourceFilter} options={SOURCE_OPTIONS} />
                    <FilterSelect label="Submitted" value={dateFilter} onChange={setDateFilter} options={DATE_OPTIONS} />
                    <FilterSelect
                      label="Page size"
                      value={String(pageSize)}
                      onChange={(value) => setPageSize(Number(value))}
                      options={PAGE_SIZE_OPTIONS.map((value) => ({
                        value: String(value),
                        label: `${value} per page`,
                      }))}
                    />

                    <div className="grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
                      Actions
                      <button
                        type="button"
                        className="inline-flex min-h-12 items-center justify-center rounded-[16px] border border-slate-900/10 bg-slate-50 px-4 text-sm font-semibold normal-case tracking-normal text-dark transition hover:bg-slate-100"
                        onClick={resetFilters}
                      >
                        Reset filters
                      </button>
                    </div>
                  </div>
                </section>

                <section className={cardShell('overflow-hidden')}>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/8 px-5 py-4 text-[12px] text-slate-500 md:px-6">
                    <p>
                      Showing <strong className="text-dark">{pageStart}</strong> - <strong className="text-dark">{pageEnd}</strong> of{' '}
                      <strong className="text-dark">{filteredRegistrations.length}</strong> filtered registrations.
                    </p>
                    <p>Click any row to inspect the full application.</p>
                  </div>

                  {dataError && (
                    <div className="border-b border-red-500/12 bg-red-50 px-5 py-4 text-[13px] leading-[1.6] text-red-700 md:px-6">
                      {dataError}
                    </div>
                  )}

                  <div className="overflow-auto">
                    <table className="min-w-[980px] w-full border-collapse">
                      <thead>
                        <tr>
                          {['Name', 'Email', 'Phone', 'Track', 'Gender', 'Age', 'Submitted'].map((label) => (
                            <th
                              key={label}
                              className="bg-slate-50/90 px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-600"
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRegistrations.map((item) => (
                          <tr
                            key={item.id}
                            className={`cursor-pointer transition hover:bg-orange-50/45 ${
                              item.id === selectedRegistration?.id ? 'bg-orange-50/70' : ''
                            }`}
                            onClick={() => setSelectedRegistrationId(item.id)}
                          >
                            <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] font-semibold text-dark">
                              {formatValue(item.fullName)}
                            </td>
                            <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                              {formatValue(item.email)}
                            </td>
                            <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                              {formatValue(item.phone)}
                            </td>
                            <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                              {formatTrack(item.stack)}
                            </td>
                            <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                              {formatGender(item.gender)}
                            </td>
                            <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                              {formatAgeRange(item.ageRange)}
                            </td>
                            <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                              {formatDate(item.createdAt)}
                            </td>
                          </tr>
                        ))}

                        {paginatedRegistrations.length === 0 && (
                          <tr>
                            <td colSpan="7" className="px-5 py-10 text-center text-[14px] text-slate-500">
                              No registrations match the current search or filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-900/8 px-5 py-4 md:px-6">
                    <p className="text-[12px] text-slate-500">
                      Page <strong className="text-dark">{currentPage}</strong> of <strong className="text-dark">{totalPages}</strong>
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] border border-slate-900/10 bg-white px-3 text-sm font-semibold text-dark transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>

                      <button
                        type="button"
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] border border-slate-900/10 bg-white px-3 text-sm font-semibold text-dark transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="grid h-fit gap-6">
                <section className={cardShell('p-5 md:p-6')}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                        Record details
                      </p>
                      <h2 className="mt-2 font-display text-[1.7rem] leading-[1] tracking-[-0.05em] text-dark">
                        {selectedRegistration ? formatValue(selectedRegistration.fullName) : 'No selection'}
                      </h2>
                    </div>
                    {selectedRegistration && (
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-600">
                        Live
                      </span>
                    )}
                  </div>

                  {selectedRegistration ? (
                    <div className="mt-6 grid gap-4">
                      <div className="grid gap-3">
                        <DetailItem label="Email" value={formatValue(selectedRegistration.email)} />
                        <DetailItem label="Phone" value={formatValue(selectedRegistration.phone)} />
                        <DetailItem label="Track" value={formatTrack(selectedRegistration.stack)} />
                        <DetailItem label="Gender" value={formatGender(selectedRegistration.gender)} />
                        <DetailItem label="Age range" value={formatAgeRange(selectedRegistration.ageRange)} />
                        <DetailItem label="Education" value={formatEducation(selectedRegistration.educationLevel)} />
                        <DetailItem label="Institution" value={formatValue(selectedRegistration.institution)} />
                        <DetailItem label="Heard from" value={formatValue(selectedRegistration.heardFrom)} />
                        <DetailItem label="Referral" value={formatValue(selectedRegistration.referralCode, '-')} />
                        <DetailItem label="Submitted" value={formatDate(selectedRegistration.createdAt)} />
                      </div>

                      <div className="rounded-[22px] border border-slate-900/8 bg-slate-50/70 p-4">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                          Motivation
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-[14px] leading-[1.8] text-slate-700">
                          {formatValue(selectedRegistration.motivation)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-[22px] border border-dashed border-slate-900/10 bg-slate-50/80 px-4 py-8 text-center text-[14px] leading-[1.7] text-slate-500">
                      Select a registration from the table to view the full application details here.
                    </div>
                  )}
                </section>
              </aside>
            </section>
          )}

          {activeTab === 'analytics' && (
            <section className="grid gap-6 lg:grid-cols-2">
              <section className={cardShell('p-5 md:p-6')}>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                  Track breakdown
                </p>
                <div className="mt-5 grid gap-3">
                  <InsightList items={topTracks} emptyText="Track analytics will appear once registrations are available." />
                </div>
              </section>

              <section className={cardShell('p-5 md:p-6')}>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                  Source breakdown
                </p>
                <div className="mt-5 grid gap-3">
                  <InsightList items={sourceBreakdown} emptyText="Source analytics will appear once registrations are available." />
                </div>
              </section>

              <section className={cardShell('p-5 md:p-6')}>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                  Gender mix
                </p>
                <div className="mt-5 grid gap-3">
                  <InsightList items={genderBreakdown} emptyText="Gender analytics will appear once registrations are available." />
                </div>
              </section>

              <section className={cardShell('p-5 md:p-6')}>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                  Summary note
                </p>
                <div className="mt-5 rounded-[24px] border border-slate-900/8 bg-slate-50/80 p-5">
                  <p className="text-[14px] leading-[1.9] text-slate-700">
                    You currently have <strong>{registrations.length}</strong> total registrations and <strong>{filteredRegistrations.length}</strong> records matching the current filters. Use the Applications tab when you want to review individual entries in detail.
                  </p>
                </div>
              </section>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass()}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-[20px] border border-slate-900/8 bg-slate-50/70 p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-[14px] leading-[1.7] text-dark">{value}</p>
    </div>
  )
}

function SidebarTab({ label, icon: Icon, active, onClick }) {
  return (
    <button
      type="button"
      className={`flex min-h-12 items-center gap-3 rounded-[18px] px-4 text-left text-sm font-semibold transition ${
        active
          ? 'bg-dark text-white shadow-[0_18px_35px_rgba(15,23,42,0.18)]'
          : 'bg-white text-slate-700 hover:bg-slate-100'
      }`}
      onClick={onClick}
    >
      <Icon className={`h-4 w-4 ${active ? 'text-orange-300' : 'text-slate-400'}`} />
      {label}
    </button>
  )
}

function StatCard({ label, value, tone }) {
  return (
    <article className="rounded-[20px] border border-slate-900/8 bg-slate-50/80 p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <strong className={`font-display text-[2.1rem] leading-none tracking-[-0.08em] ${tone}`}>
          {value}
        </strong>
        <CheckCircle2 className="h-5 w-5 text-slate-300" />
      </div>
    </article>
  )
}

function InsightList({ items, emptyText }) {
  if (!items.length) {
    return (
      <div className="rounded-[20px] border border-dashed border-slate-900/10 bg-slate-50/80 px-4 py-6 text-sm text-slate-500">
        {emptyText}
      </div>
    )
  }

  return items.map(([label, count]) => (
    <div key={label} className="rounded-[20px] border border-slate-900/8 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-dark">{label}</p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-600">
          {count}
        </span>
      </div>
    </div>
  ))
}

export default AdminDashboard
