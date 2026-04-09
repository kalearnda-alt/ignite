import {
  ArrowRight,
  CheckCircle2,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { Timestamp, collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { ADMIN_EMAIL } from '../lib/admin'
import { getAuthErrorMessage, getFirestoreErrorMessage } from '../lib/firebase-errors'
import { auth, db } from '../lib/firebase'

function formatDate(value) {
  if (!value) return 'Pending'

  if (value instanceof Timestamp) {
    return value.toDate().toLocaleString()
  }

  if (typeof value === 'string' || value instanceof Date) {
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date.getTime()) ? 'Pending' : date.toLocaleString()
  }

  if (value?.toDate) {
    return value.toDate().toLocaleString()
  }

  return 'Pending'
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

function cardShell(extra = '') {
  return `rounded-[28px] border border-slate-900/10 bg-white/88 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl ${extra}`.trim()
}

function inputClass() {
  return 'min-h-12 w-full rounded-[16px] border border-slate-900/10 bg-white/90 px-4 text-dark outline-none transition focus:border-accent/40 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.10)]'
}

function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [dataError, setDataError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [signingUp, setSigningUp] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [signupNotice, setSignupNotice] = useState('')
  const [registrations, setRegistrations] = useState([])
  const [signupForm, setSignupForm] = useState({
    email: ADMIN_EMAIL,
    password: '',
    confirmPassword: '',
  })
  const [loginForm, setLoginForm] = useState({
    email: ADMIN_EMAIL,
    password: '',
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser && nextUser.email === ADMIN_EMAIL) {
        setUser(nextUser)
        setAuthError('')
      } else {
        if (nextUser) {
          await signOut(auth)
        }
        setUser(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) {
      setRegistrations([])
      return undefined
    }

    const registrationsQuery = query(
      collection(db, 'registrations'),
      orderBy('createdAt', 'desc'),
      limit(150),
    )

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

    if (!queryText) return registrations

    return registrations.filter((item) =>
      [item.fullName, item.email, item.phone, item.heardFrom, formatTrack(item.stack)]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(queryText)),
    )
  }, [registrations, searchQuery])

  const stats = useMemo(() => {
    const stackCounts = registrations.reduce((acc, item) => {
      const key = item.stack || 'unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    return [
      { label: 'Applications', value: registrations.length, tone: 'text-dark' },
      { label: 'Web Dev', value: stackCounts.web_development || 0, tone: 'text-orange-600' },
      { label: 'AI & Automation', value: stackCounts.ai_automation || 0, tone: 'text-sky-700' },
      { label: 'Design', value: stackCounts.product_design || 0, tone: 'text-emerald-700' },
    ]
  }, [registrations])

  async function handleSignup(event) {
    event.preventDefault()
    setSigningUp(true)
    setAuthError('')
    setSignupNotice('')

    if (signupForm.email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setAuthError(`Only ${ADMIN_EMAIL} can be used for admin signup.`)
      setSigningUp(false)
      return
    }

    if (signupForm.password.length < 6) {
      setAuthError('Admin password must be at least 6 characters.')
      setSigningUp(false)
      return
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setAuthError('Passwords do not match.')
      setSigningUp(false)
      return
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, signupForm.email.trim(), signupForm.password)

      if (result.user.email !== ADMIN_EMAIL) {
        await deleteUser(result.user)
        setAuthError('This account is not allowed to access the admin dashboard.')
        return
      }

      setSignupNotice('Admin account created. You are now signed in.')
      setLoginForm((current) => ({
        ...current,
        email: signupForm.email.trim(),
        password: '',
      }))
      setSignupForm((current) => ({
        ...current,
        password: '',
        confirmPassword: '',
      }))
    } catch (signupError) {
      setAuthError(getAuthErrorMessage(signupError, 'sign_up'))
    } finally {
      setSigningUp(false)
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setSigningIn(true)
    setAuthError('')
    setSignupNotice('')

    try {
      const result = await signInWithEmailAndPassword(auth, loginForm.email.trim(), loginForm.password)

      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth)
        setAuthError('This account is not allowed to access the admin dashboard.')
      }
    } catch (loginError) {
      setAuthError(getAuthErrorMessage(loginError, 'sign_in'))
    } finally {
      setSigningIn(false)
    }
  }

  async function handleLogout() {
    await signOut(auth)
    setLoginForm({ email: ADMIN_EMAIL, password: '' })
    setSignupNotice('')
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
              Checking authentication state and loading the submission monitor.
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
            <div className="relative z-10 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-orange-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure admin route
                </div>
                <h1 className="mt-4 max-w-[10ch] font-display text-[clamp(2.4rem,7vw,5rem)] leading-[0.92] tracking-[-0.08em]">
                  Ignite admin console
                </h1>
                <p className="mt-4 max-w-[58ch] text-sm leading-[1.85] text-slate-200 md:text-[15px]">
                  Visit <strong>/admin</strong> to create the authorized admin account, sign in,
                  and monitor registrations in one place.
                </p>
              </div>

              <div className="grid gap-3 rounded-[24px] border border-white/12 bg-white/8 p-4 backdrop-blur md:p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-400/18 text-orange-200">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-orange-200/90">
                      Authorized admin
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{ADMIN_EMAIL}</p>
                  </div>
                </div>
                <p className="text-[13px] leading-[1.7] text-slate-200">
                  Only this Firebase auth account can access submissions because Firestore rules
                  restrict reads to the approved admin email.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <article className={cardShell('relative overflow-hidden p-6 md:p-7')}>
              <div className="absolute right-[-20px] top-[-20px] h-28 w-28 rounded-full bg-orange-400/12 blur-2xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                  <UserPlus className="h-3.5 w-3.5" />
                  Admin signup
                </div>
                <h2 className="mt-4 font-display text-[1.9rem] leading-[1] tracking-[-0.05em] text-dark">
                  Create the admin account
                </h2>
                <p className="mt-3 max-w-[50ch] text-sm leading-[1.8] text-slate-600">
                  Use the approved admin email below. If the account already exists, skip this and
                  sign in with the login panel.
                </p>

                <form className="mt-6 grid gap-4" onSubmit={handleSignup}>
                  <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
                    Admin email
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(event) =>
                        setSignupForm((current) => ({ ...current, email: event.target.value }))
                      }
                      className={inputClass()}
                      placeholder={ADMIN_EMAIL}
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
                      Password
                      <input
                        type="password"
                        value={signupForm.password}
                        onChange={(event) =>
                          setSignupForm((current) => ({ ...current, password: event.target.value }))
                        }
                        className={inputClass()}
                        placeholder="Minimum 6 characters"
                      />
                    </label>

                    <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
                      Confirm password
                      <input
                        type="password"
                        value={signupForm.confirmPassword}
                        onChange={(event) =>
                          setSignupForm((current) => ({
                            ...current,
                            confirmPassword: event.target.value,
                          }))
                        }
                        className={inputClass()}
                        placeholder="Repeat password"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] bg-dark px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={signingUp}
                  >
                    {signingUp ? 'Creating account...' : 'Create admin account'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </article>

            <article className={cardShell('relative overflow-hidden p-6 md:p-7')}>
              <div className="absolute bottom-[-30px] right-[-10px] h-32 w-32 rounded-full bg-slate-900/6 blur-2xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-dark">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Login
                </div>
                <h2 className="mt-4 font-display text-[1.9rem] leading-[1] tracking-[-0.05em] text-dark">
                  Sign in to the dashboard
                </h2>
                <p className="mt-3 max-w-[50ch] text-sm leading-[1.8] text-slate-600">
                  After login, the route stays on <strong>/admin</strong> and opens the
                  submissions board.
                </p>

                <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
                  <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
                    Email
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((current) => ({ ...current, email: event.target.value }))
                      }
                      className={inputClass()}
                      placeholder={ADMIN_EMAIL}
                    />
                  </label>

                  <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
                    Password
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((current) => ({ ...current, password: event.target.value }))
                      }
                      className={inputClass()}
                      placeholder="Your Firebase password"
                    />
                  </label>

                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={signingIn}
                  >
                    {signingIn ? 'Signing in...' : 'Open dashboard'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                {signupNotice && (
                  <div className="mt-4 rounded-[18px] border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-[13px] leading-[1.6] text-emerald-700">
                    {signupNotice}
                  </div>
                )}

                {authError && (
                  <div className="mt-4 rounded-[18px] border border-red-500/20 bg-red-50 px-4 py-3 text-[13px] leading-[1.6] text-red-700">
                    {authError}
                  </div>
                )}

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
      <div className="mx-auto grid max-w-[1240px] gap-6">
        <header className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="relative overflow-hidden rounded-[32px] border border-slate-900/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.92))] px-6 py-7 text-white shadow-[0_28px_90px_rgba(15,23,42,0.24)] md:px-8 md:py-8">
            <div className="absolute left-[55%] top-[-18%] h-[220px] w-[220px] rounded-full bg-orange-400/20 blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-orange-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Ignite-100 admin
              </div>
              <h1 className="mt-4 max-w-[12ch] font-display text-[clamp(2.5rem,6vw,4.8rem)] leading-[0.9] tracking-[-0.08em]">
                Registrations command center
              </h1>
              <p className="mt-4 max-w-[60ch] text-sm leading-[1.85] text-slate-200 md:text-[15px]">
                Live Firestore submissions with quick visibility into total applications and the
                top tracks people are selecting.
              </p>
            </div>
          </section>

          <section className={cardShell('grid gap-4 p-6 md:p-7')}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                  Session
                </p>
                <h2 className="mt-2 font-display text-[1.7rem] leading-[1] tracking-[-0.05em] text-dark">
                  {user.email}
                </h2>
                <p className="mt-3 text-sm leading-[1.8] text-slate-600">
                  Signed in and authorized to review submissions.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] bg-slate-100 px-4 text-sm font-semibold text-dark transition hover:bg-slate-200"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>

            <div className="rounded-[20px] border border-emerald-500/15 bg-emerald-50 px-4 py-4 text-[13px] leading-[1.7] text-emerald-800">
              Firestore access is currently restricted to <strong>{ADMIN_EMAIL}</strong>.
            </div>
          </section>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className={cardShell('p-5 md:p-6')}>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                {stat.label}
              </p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <strong className={`font-display text-[2.35rem] leading-none tracking-[-0.08em] ${stat.tone}`}>
                  {stat.value}
                </strong>
                <CheckCircle2 className="h-5 w-5 text-slate-300" />
              </div>
            </article>
          ))}
        </section>

        <section className={cardShell('overflow-hidden')}>
          <div className="grid gap-4 border-b border-slate-900/8 px-5 py-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-strong">
                Directory
              </p>
              <h2 className="mt-2 font-display text-[1.7rem] leading-[1] tracking-[-0.05em] text-dark">
                Applicant list
              </h2>
              <p className="mt-3 text-sm leading-[1.8] text-slate-600">
                Search by name, email, phone, source, or track.
              </p>
            </div>

            <label className="grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
              Search records
              <span className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className={`${inputClass()} pl-11`}
                  placeholder="Find a candidate"
                />
              </span>
            </label>
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
                  {['Name', 'Email', 'Phone', 'Track', 'Heard From', 'Referral', 'Submitted'].map((label) => (
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
                {filteredRegistrations.map((item) => (
                  <tr key={item.id} className="transition hover:bg-orange-50/45">
                    <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] font-semibold text-dark">
                      {item.fullName || 'N/A'}
                    </td>
                    <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                      {item.email || 'N/A'}
                    </td>
                    <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                      {item.phone || 'N/A'}
                    </td>
                    <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                      {formatTrack(item.stack)}
                    </td>
                    <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                      {item.heardFrom || 'N/A'}
                    </td>
                    <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                      {item.referralCode || '-'}
                    </td>
                    <td className="border-t border-slate-900/8 px-5 py-4 text-[13px] text-slate-700">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}

                {filteredRegistrations.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-5 py-10 text-center text-[14px] text-slate-500">
                      No registrations match the current search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminDashboard
