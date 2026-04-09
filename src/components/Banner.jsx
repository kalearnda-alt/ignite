import { motion as Motion } from 'framer-motion'
import { ArrowLeft, Flame } from 'lucide-react'

function Banner() {
  function scrollToForm() {
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative z-0 mb-10 min-h-[340px] overflow-hidden rounded-3xl sm:min-h-[420px] lg:min-h-[380px]">
      <Motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <img
          src="/girl-smiling.jpg"
          alt="TechTan Ignite-100 Banner"
          className="h-full w-full object-cover object-[60%_20%] sm:object-[65%_15%] lg:object-[70%_10%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/92 via-gray-900/70 to-gray-900/70 lg:to-gray-900/40" />
      </Motion.div>

      <div className="relative z-10 flex h-full min-h-[340px] items-center px-6 sm:min-h-[420px] sm:px-10 lg:min-h-[380px]">
        <div className="max-w-lg flex-1">
          <Motion.div
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 font-bold uppercase tracking-widest text-white text-xs"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            TechTan Presents
          </Motion.div>

          <Motion.h1
            className="mb-4 font-black leading-[1.05] tracking-tight text-4xl text-white sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
          >
            Ignite
            <span className="text-green-400">-100</span>
          </Motion.h1>

          <Motion.p
            className="max-w-md text-base leading-relaxed text-gray-200 sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            A 3-month intensive tech training program designed to transform beginners and
            intermediates into industry-ready professionals.
          </Motion.p>

          <Motion.div
            className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.5 }}
          >
            <button
              type="button"
              onClick={scrollToForm}
              className="group inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:bg-green-600 active:scale-95"
            >
              Apply Here
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
              <p className="text-xs font-medium text-gray-300">Limited spots available</p>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  )
}

export default Banner
