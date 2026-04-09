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
    <div className="min-h-screen" id="top">
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
  )
}

export default App
