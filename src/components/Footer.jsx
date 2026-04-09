function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-7 border-t border-slate-900/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,255,255,0.74)),radial-gradient(circle_at_top_center,rgba(249,115,22,0.08),transparent_34%)]">
      <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(249,115,22,0.6),transparent)]" />

      <div className="mx-auto w-[min(100%,calc(100%-20px))] text-center md:w-[min(1120px,calc(100%-32px))]">
        <div className="mx-auto flex max-w-[760px] flex-col items-center pt-8 md:pt-10">
          <h2 className="mx-auto mt-3 max-w-[15ch] text-center font-display text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.04] tracking-[-0.05em] text-dark">
            Designed for focused learners ready to do real work.
          </h2>
          <br />
          <p className="mx-auto mt-4 max-w-[46ch] text-center text-sm font-medium leading-[1.75] text-slate-700 md:text-[15px] md:leading-[1.8]">
            Empowering the next generation of African tech talents through world-class,
            industry-aligned training.
          </p>
        </div>

        <div className="mx-auto grid max-w-[760px] grid-cols-1 gap-[18px] py-[30px] md:grid-cols-2 md:gap-8 md:py-[34px]">
          <div className="grid justify-items-center gap-2.5 text-center">
            <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.16em] text-dark">
              Tracks
            </p>
            <ul className="grid list-none justify-items-center gap-2 p-0 text-[13px] font-semibold leading-[1.7] text-dark">
              <li>Web Development</li>
              <li>Data Analytics</li>
              <li>Product Design</li>
              <li>Digital Marketing</li>
              <li>AI & Automation</li>
            </ul>
          </div>

          <div className="grid justify-items-center gap-2.5 text-center">
            <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.16em] text-dark">
              Program
            </p>
            <ul className="grid list-none justify-items-center gap-2 p-0 text-[13px] font-semibold leading-[1.7] text-dark">
              <li>3 Months &bull; Intensive</li>
              <li>5 Specialisations</li>
              <li>Live Mentorship</li>
              <li>Certificate on Completion</li>
              <li>Alumni Network Access</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900/[0.08] py-[18px] pb-6 text-[13px] font-medium tracking-[-0.01em] text-dark">
          <p>
            &copy; {currentYear} <strong>TechTan</strong>. All rights reserved.
          </p>
        </div>
      </div>

      <div className="overflow-hidden px-0 pb-2 pt-2 text-center font-display text-[clamp(2.8rem,22vw,12rem)] font-black leading-[0.9] tracking-[-0.1em] text-slate-400/45 select-none md:text-[clamp(3.4rem,18vw,12rem)]">
        TECHTAN
      </div>
    </footer>
  )
}

export default Footer
