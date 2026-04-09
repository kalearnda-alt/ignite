import { motion as Motion, useReducedMotion } from 'framer-motion'

const stats = [
  {
    value: '3',
    unit: 'Months',
    label: 'Program Duration',
    description: 'Full-time intensive training from fundamentals to industry-ready skills.',
    accent: 'bg-[linear-gradient(90deg,#f97316,#fb923c)]',
    glow: '#f97316',
    stroke: '#fdba74',
  },
  {
    value: '5',
    unit: 'Tracks',
    label: 'Specialisations',
    description: 'Web Dev, Data Analytics, Product Design, Digital Marketing, or AI & Automation.',
    accent: 'bg-[linear-gradient(90deg,#0f172a,#334155)]',
    glow: '#1e293b',
    stroke: '#94a3b8',
  },
  {
    value: '100%',
    unit: '',
    label: 'Hands-on Learning',
    description: 'Every lesson tied to real projects, live mentorship, and portfolio-worthy output.',
    accent: 'bg-[linear-gradient(90deg,#f97316,#fb923c)]',
    glow: '#fb923c',
    stroke: '#fed7aa',
  },
]

function Stats() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3 lg:items-stretch"
      aria-label="Program highlights"
    >
      {stats.map((stat, index) => (
        <Motion.article
          key={stat.label}
          className="h-full rounded-[20px] border border-[#eceef2] bg-[#f3f4f6] p-2 shadow-none md:rounded-[24px] md:border-slate-900/[0.1] md:bg-white/90 md:p-5 md:shadow-[0_16px_34px_rgba(15,23,42,0.06)] md:backdrop-blur-[12px] lg:p-6"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{
            duration: 0.42,
            delay: reduceMotion ? 0 : index * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={reduceMotion ? undefined : { y: -3 }}
        >
          <div className="relative flex h-full flex-col overflow-hidden rounded-[17px] border border-slate-900/[0.05] bg-white px-5 pb-5 pt-[22px] shadow-[0_2px_10px_rgba(15,23,42,0.05)] md:rounded-none md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:shadow-none">
            <div className={`absolute inset-x-0 top-0 h-[3px] rounded-full md:h-1 ${stat.accent}`} />
            <svg
              aria-hidden="true"
              viewBox="0 0 320 180"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
              preserveAspectRatio="none"
            >
              <defs>
                <radialGradient id={`stats-glow-${index}`} cx="75%" cy="22%" r="55%">
                  <stop offset="0%" stopColor={stat.glow} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={stat.glow} stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect x="0" y="0" width="320" height="180" fill={`url(#stats-glow-${index})`} />
              <path
                d="M208 24C244 18 284 32 320 60V0H188C188 8 194 15 208 24Z"
                fill={stat.glow}
                fillOpacity="0.07"
              />
              <path
                d="M-6 154C38 122 89 124 128 156"
                fill="none"
                stroke={stat.stroke}
                strokeOpacity="0.3"
                strokeWidth="2"
              />
              <path
                d="M174 53C205 32 247 29 288 41"
                fill="none"
                stroke={stat.stroke}
                strokeOpacity="0.32"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M196 76C226 61 262 61 295 74"
                fill="none"
                stroke={stat.stroke}
                strokeOpacity="0.2"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="258" cy="126" r="34" fill={stat.glow} fillOpacity="0.05" />
              <circle cx="258" cy="126" r="22" fill="none" stroke={stat.stroke} strokeOpacity="0.18" />
            </svg>

            <div className="relative z-10 flex items-baseline gap-2.5 pt-2.5 md:pt-1.5">
              <strong className="font-display text-[2.15rem] leading-none tracking-[-0.08em] text-dark md:text-[2.35rem] lg:text-[2.6rem]">
                {stat.value}
              </strong>
              {stat.unit && (
                <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-dark md:text-[12px]">
                  {stat.unit}
                </span>
              )}
            </div>

            <h2 className="relative z-10 mt-5 font-display text-base font-extrabold leading-[1.2] tracking-[-0.03em] text-dark md:mt-4 md:text-[18px] lg:text-[1.2rem]">
              {stat.label}
            </h2>
            <p className="relative z-10 mt-10 max-w-[24ch] text-[13px] leading-[1.65] text-slate-800 md:max-w-none md:text-sm font-medium md:leading-[1.75] lg:mt-3 lg:text-[15px]">
              {stat.description}
            </p>
          </div>
        </Motion.article>
      ))}
    </section>
  )
}

export default Stats
