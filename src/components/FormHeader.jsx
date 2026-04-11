function FormHeader() {
  return (
    <div className="relative min-h-[160px] overflow-hidden rounded-t-[28px]">
      <img
        src="/techtan-banner-form.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.78))]" />
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8 text-center">
        <h2 className="font-display text-[1.35rem] tracking-[-0.04em] text-white">
          Apply for Ignite-100
        </h2>
        <p className="mt-2 text-[13px] text-white/55">
          3 months · 5 tracks · Industry-ready skills
        </p>
      </div>
    </div>
  )
}

export default FormHeader
