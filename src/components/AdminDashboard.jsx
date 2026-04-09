import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { Timestamp, collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { ADMIN_EMAIL } from '../lib/admin'
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

function cardShell(extra = '') {
  return `rounded-[24px] border border-slate-900/[0.08] bg-white/90 shadow-panel backdrop-blur ${extra}`.trim()
}

function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [registrations, setRegistrations] = useState([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser && nextUser.email === ADMIN_EMAIL) {
        setUser(nextUser)
        setError('')
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
      limit(100),
    )

    return onSnapshot(
      registrationsQuery,
      (snapshot) => {
        setRegistrations(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        )
      },
      (snapshotError) => {
        setError(snapshotError.message || 'Unable to load registrations.')
      },
    )
  }, [user])

  const stats = useMemo(() => {
    const stacks = registrations.reduce((acc, item) => {
      const key = item.stack || 'unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    return [
      { label: 'Submissions', value: registrations.length },
      { label: 'Web Dev', value: stacks.web_development || 0 },
      { label: 'Data', value: stacks.data_analytics || 0 },
      { label: 'Design', value: stacks.product_design || 0 },
    ]
  }, [registrations])

  async function handleLogin(event) {
    event.preventDefault()
    setSigningIn(true)
    setError('')

    try {
      const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth)
        setError('This account is not allowed to access the admin dashboard.')
      }
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in.')
    } finally {
      setSigningIn(false)
    }
  }

  async function handleLogout() {
    await signOut(auth)
    setCredentials({ email: '', password: '' })
  }

  if (loading) {
    return (
      <div className="mx-auto grid min-h-screen w-[min(100%,calc(100%-20px))] place-items-center py-[18px] md:w-[min(1120px,calc(100%-32px))] md:py-10">
        <div className={cardShell('w-full max-w-[540px] p-7')}>
          <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-accent-strong">
            Ignite-100 admin
          </p>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] text-dark">Loading dashboard</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto min-h-screen w-[min(100%,calc(100%-20px))] py-[18px] md:w-[min(1120px,calc(100%-32px))] md:py-10">
        <div className={cardShell('mx-auto grid w-full max-w-[540px] gap-4 p-7')}>
          <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-accent-strong">
            Ignite-100 admin
          </p>
          <h1 className="text-[clamp(1.6rem,3vw,2.2rem)] text-dark">Sign in to view submissions</h1>
          <p className="max-w-[56ch] leading-[1.7] text-muted">
            Use the Firebase auth account tied to <strong>{ADMIN_EMAIL}</strong>.
          </p>

          <form className="grid gap-3.5" onSubmit={handleLogin}>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-700">
              Email
              <input
                type="email"
                value={credentials.email}
                onChange={(event) =>
                  setCredentials((current) => ({ ...current, email: event.target.value }))
                }
                placeholder={ADMIN_EMAIL}
                className="min-h-12 rounded-[14px] border border-slate-900/[0.12] bg-white px-[14px] text-dark outline-none focus:border-accent/[0.35] focus:shadow-[0_0_0_4px_rgba(249,115,22,0.08)]"
              />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-700">
              Password
              <input
                type="password"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Your Firebase password"
                className="min-h-12 rounded-[14px] border border-slate-900/[0.12] bg-white px-[14px] text-dark outline-none focus:border-accent/[0.35] focus:shadow-[0_0_0_4px_rgba(249,115,22,0.08)]"
              />
            </label>

            {error && (
              <div className="rounded-[14px] border border-red-500/20 bg-red-50/90 px-[14px] py-3 text-[13px] leading-[1.5] text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-[14px] bg-accent px-[18px] text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
              disabled={signingIn}
            >
              {signingIn ? 'Signing in...' : 'Open dashboard'}
            </button>
          </form>

          <a className="justify-self-center text-[13px] font-semibold text-muted" href="/">
            Back to public site
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen w-[min(100%,calc(100%-20px))] py-[18px] md:w-[min(1120px,calc(100%-32px))] md:py-10">
      <div className="grid gap-[18px]">
        <header className={cardShell('flex flex-col items-stretch gap-4 p-[18px] md:flex-row md:items-start md:justify-between md:p-[22px_24px]')}>
          <div>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-accent-strong">
              Ignite-100 admin
            </p>
            <h1 className="text-[clamp(1.6rem,3vw,2.2rem)] text-dark">Registrations dashboard</h1>
            <p className="mt-2 max-w-[56ch] leading-[1.7] text-muted">
              Live Firestore submissions for the application form.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center rounded-[14px] bg-slate-900/[0.06] px-[18px] text-dark transition hover:bg-slate-900/10"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </header>

        <section className={cardShell('grid grid-cols-1 gap-3 p-[14px] md:grid-cols-2 md:p-[18px] lg:grid-cols-4')}>
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="grid gap-2 rounded-[18px] border border-slate-900/[0.06] bg-slate-50/95 p-4"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                {stat.label}
              </span>
              <strong className="text-[1.8rem] tracking-[-0.06em] text-dark">{stat.value}</strong>
            </article>
          ))}
        </section>

        {error && (
          <div className="rounded-[14px] border border-red-500/20 bg-red-50/92 px-[14px] py-3 text-[13px] leading-[1.5] text-red-700">
            {error}
          </div>
        )}

        <section className={cardShell('overflow-hidden')}>
          <div className="flex flex-col items-start gap-4 px-[18px] pb-0 pt-[18px] md:flex-row md:items-end md:justify-between md:px-[22px] md:pt-5">
            <h2 className="text-[1.1rem] text-dark">Recent submissions</h2>
            <p className="text-[13px] text-muted">{registrations.length} records loaded</p>
          </div>

          <div className="overflow-auto">
            <table className="min-w-[920px] w-full border-collapse">
              <thead>
                <tr>
                  {['Name', 'Email', 'Phone', 'Track', 'Heard From', 'Referral', 'Submitted'].map((head) => (
                    <th
                      key={head}
                      className="border-t-0 bg-slate-50/95 px-[18px] py-[14px] text-left text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registrations.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/[0.03]">
                    <td className="border-t border-slate-900/[0.06] px-[18px] py-[14px] text-[13px] align-top">
                      {item.fullName || 'N/A'}
                    </td>
                    <td className="border-t border-slate-900/[0.06] px-[18px] py-[14px] text-[13px] align-top">
                      {item.email || 'N/A'}
                    </td>
                    <td className="border-t border-slate-900/[0.06] px-[18px] py-[14px] text-[13px] align-top">
                      {item.phone || 'N/A'}
                    </td>
                    <td className="border-t border-slate-900/[0.06] px-[18px] py-[14px] text-[13px] align-top">
                      {item.stack || 'N/A'}
                    </td>
                    <td className="border-t border-slate-900/[0.06] px-[18px] py-[14px] text-[13px] align-top">
                      {item.heardFrom || 'N/A'}
                    </td>
                    <td className="border-t border-slate-900/[0.06] px-[18px] py-[14px] text-[13px] align-top">
                      {item.referralCode || '-'}
                    </td>
                    <td className="border-t border-slate-900/[0.06] px-[18px] py-[14px] text-[13px] align-top">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-[18px] py-7 text-center text-muted">
                      No registrations yet.
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
