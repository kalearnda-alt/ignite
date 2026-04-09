function FormHeader() {
  return (
    <div className="relative min-h-[152px] overflow-hidden">
      <img src="/techtan-banner-form.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.76))]" />
      <div className="relative z-10 px-6 py-7 text-center">
        <h2 className="font-display text-[1.35rem] tracking-[-0.04em] text-white">
          Apply for Ignite-100
        </h2>
      </div>
    </div>
  )
}

export default FormHeader
