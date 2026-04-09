import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function Dropdown({ value, options, placeholder, onChange, hasError }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const label = options.find((option) => option.value === value)?.label || ''

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-[14px] border bg-white px-[14px] text-left text-dark transition outline-none ${
          hasError
            ? 'border-red-300 bg-red-50/90'
            : 'border-slate-900/[0.12] focus:border-accent/[0.35] focus:shadow-[0_0_0_4px_rgba(249,115,22,0.08)]'
        } ${!value ? 'text-slate-400' : ''}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {label || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-10 max-h-60 overflow-auto rounded-[18px] border border-slate-900/[0.08] bg-white/[0.99] p-2 shadow-[0_22px_40px_rgba(15,23,42,0.12)]"
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`w-full rounded-xl px-3 py-[11px] text-left text-sm transition ${
                option.value === value
                  ? 'bg-accent/[0.08] text-dark'
                  : 'text-slate-700 hover:bg-accent/[0.08] hover:text-dark'
              }`}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
