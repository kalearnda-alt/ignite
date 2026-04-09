import { motion as Motion, useReducedMotion } from 'framer-motion'
import { Suspense, lazy, useEffect, useMemo } from 'react'
import Banner from './components/Banner'
import Footer from './components/Footer'
import FormHeader from './components/FormHeader'
import Header from './components/Header'
import RegistrationForm from './components/RegistrationForm'
import Stats from './components/Stats'
import { getQueryReferralCode } from './lib/form'

const AdminDashboard = lazy(() => import('./components/AdminDashboard'))

function App() {
  const reduceMotion = useReducedMotion()
  const referralCode = useMemo(() => getQueryReferralCode(), [])
  const isAdminRoute = useMemo(() => {
    if (typeof window === 'undefined') return false
    const path = window.location.pathname.replace(/\/+$/, '') || '/'
    return path === '/admin'
  }, [])

  useEffect(() => {
    document.title = isAdminRoute ? 'Ignite-100 Admin | TechTan' : 'Apply for Ignite-100 | TechTan'

    const description =
      isAdminRoute
        ? 'Ignite-100 admin route for secure registration monitoring and admin authentication.'
        : 'Join the Ignite-100 tech training program. 3 months of intensive, hands-on training in Web Development, Data Analytics, Product Design, Digital Marketing, or AI & Automation.'

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
  }, [isAdminRoute])

  if (isAdminRoute) {
    return (
      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.18),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-8">
            <div className="w-full max-w-[540px] rounded-[24px] border border-slate-900/[0.1] bg-white/90 p-7 shadow-panel backdrop-blur">
              <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-accent-strong">
                Ignite-100 admin
              </p>
              <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] text-dark">Opening admin route</h1>
            </div>
          </div>
        }
      >
        <AdminDashboard />
      </Suspense>
    )
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fffaf5_0%,#f8fafc_26%,#eef2f7_62%,#f8fafc_100%)]"
      id="top"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <svg viewBox="0 0 1440 1600" className="h-full w-full opacity-[0.95]" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="home-glow-top" cx="22%" cy="10%" r="36%">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="home-glow-bottom" cx="82%" cy="66%" r="34%">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="home-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          <rect width="1440" height="1600" fill="url(#home-glow-top)" />
          <rect width="1440" height="1600" fill="url(#home-glow-bottom)" />

          <circle cx="1186" cy="245" r="198" fill="#ffffff" fillOpacity="0.56" />
          <circle cx="1186" cy="245" r="138" fill="none" stroke="url(#home-stroke)" strokeWidth="1.2" />

          <path
            d="M-120 312C78 210 262 228 404 328C533 418 671 456 844 406C1023 354 1184 383 1513 518"
            fill="none"
            stroke="url(#home-stroke)"
            strokeWidth="2"
          />
          <path
            d="M-66 1020C149 886 332 881 495 968C655 1054 814 1080 1007 1026C1178 978 1310 991 1501 1092"
            fill="none"
            stroke="url(#home-stroke)"
            strokeWidth="1.6"
          />
          <path
            d="M968 86C1053 57 1142 67 1226 112"
            fill="none"
            stroke="#fdba74"
            strokeOpacity="0.45"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M924 132C1028 102 1137 109 1243 161"
            fill="none"
            stroke="#cbd5e1"
            strokeOpacity="0.4"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          <g opacity="0.5">
            <circle cx="182" cy="186" r="4" fill="#fb923c" />
            <circle cx="254" cy="224" r="6" fill="#0f172a" fillOpacity="0.18" />
            <circle cx="1098" cy="576" r="5" fill="#fb923c" fillOpacity="0.65" />
            <circle cx="1202" cy="1048" r="4" fill="#0f172a" fillOpacity="0.18" />
            <circle cx="286" cy="1244" r="5" fill="#fb923c" fillOpacity="0.5" />
          </g>
        </svg>
      </div>

      <div className="relative z-10">
        <Header />
        <main className="mx-auto w-[min(100%,calc(100%-20px))] pt-6 md:w-[min(1120px,calc(100%-32px))]">
          <Banner />

          <section className="mt-[18px] lg:mt-7">
            <Stats />
          </section>

          <Motion.div
            id="application-form"
            className="relative mt-5 scroll-mt-[100px] lg:mx-auto lg:mt-7 lg:max-w-[760px]"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="overflow-hidden rounded-[28px] border border-slate-900/[0.1] bg-white/95 shadow-panel">
              <FormHeader />
              <div className="px-[14px] pb-[18px] pt-4 md:px-[22px] md:pb-6 md:pt-[22px]">
                <RegistrationForm initialReferralCode={referralCode} />
              </div>
            </div>

            <p className="mt-[14px] px-3 text-center text-[13px] text-muted">
              By applying you agree to our Terms of Service and Privacy Policy
            </p>
          </Motion.div>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
