import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  AGE_RANGES,
  GENDER_OPTIONS,
  HEARD_FROM_OPTIONS,
  INITIAL_VALUES,
  STACKS,
} from '../constants/form-data'
import { getFirstInvalidStep, submitRegistration, validateRegistration } from '../lib/form'
import Dropdown from './Dropdown'

const fieldGridClass = 'grid grid-cols-1 gap-3.5 md:grid-cols-2'
const inputClass =
  'w-full rounded-[14px] border border-slate-900/[0.12] bg-white px-[14px] text-dark transition outline-none focus:border-accent/[0.35] focus:shadow-[0_0_0_4px_rgba(249,115,22,0.08)]'
const buttonBaseClass =
  'inline-flex min-h-12 items-center justify-center gap-2.5 rounded-2xl px-[18px] transition'
const primaryButtonClass = `${buttonBaseClass} bg-dark text-white`
const accentButtonClass = `${buttonBaseClass} bg-accent text-white`
const secondaryButtonClass = `${buttonBaseClass} border border-slate-900/[0.12] bg-white text-dark`

function RegistrationForm({ initialReferralCode }) {
  const successRef = useRef(null)
  const [values, setValues] = useState({
    ...INITIAL_VALUES,
    referralCode: initialReferralCode || '',
  })
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submittedName, setSubmittedName] = useState('')

  useEffect(() => {
    if (initialReferralCode) {
      setValues((current) => ({
        ...current,
        referralCode: initialReferralCode,
      }))
    }
  }, [initialReferralCode])

  useEffect(() => {
    if (!submitted || !successRef.current) return

    const frame = window.requestAnimationFrame(() => {
      successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [submitted])

  function updateField(field, value) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }))
  }

  function validateCurrentStep(step) {
    const nextErrors = validateRegistration(values)
    const stepErrors = {}

    if (step === 1) {
      ;['fullName', 'email', 'phone', 'gender', 'ageRange'].forEach((field) => {
        if (nextErrors[field]) stepErrors[field] = nextErrors[field]
      })
    }

    if (step === 2 && nextErrors.stack) {
      stepErrors.stack = nextErrors.stack
    }

    if (step === 3) {
      ;['motivation', 'heardFrom', 'referralCode'].forEach((field) => {
        if (nextErrors[field]) stepErrors[field] = nextErrors[field]
      })
    }

    setErrors((current) => ({
      ...current,
      ...stepErrors,
    }))

    return Object.keys(stepErrors).length === 0
  }

  function goNext() {
    if (validateCurrentStep(currentStep)) {
      setCurrentStep((current) => Math.min(current + 1, 3))
    }
  }

  function goBack() {
    setCurrentStep((current) => Math.max(current - 1, 1))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateRegistration(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      setCurrentStep(getFirstInvalidStep(validationErrors))
      return
    }

    setIsSubmitting(true)
    setServerError('')

    try {
      const result = await submitRegistration(values)

      if (result?.success) {
        setSubmittedName(values.fullName.split(/\s+/)[0])
        setSubmitted(true)
        return
      }

      setServerError(result?.error || 'Something went wrong. Please try again.')
    } catch {
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return <SuccessScreen name={submittedName} containerRef={successRef} />
  }

  return (
    <form className="relative grid gap-[18px]" onSubmit={handleSubmit}>
      <input
        type="text"
        value={values._hp}
        onChange={(event) => updateField('_hp', event.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
      />

      <StepProgress currentStep={currentStep} />

      {currentStep === 1 && (
        <StepPersonal values={values} errors={errors} updateField={updateField} />
      )}
      {currentStep === 2 && <StepTrack values={values} errors={errors} updateField={updateField} />}
      {currentStep === 3 && (
        <StepGoals
          values={values}
          errors={errors}
          updateField={updateField}
          serverError={serverError}
        />
      )}

      <div className="flex flex-col gap-3 pt-0.5 md:flex-row">
        {currentStep > 1 && (
          <button type="button" className={`${secondaryButtonClass} w-full md:w-auto`} onClick={goBack}>
            <span aria-hidden="true">&larr;</span> Back
          </button>
        )}

        {currentStep < 3 ? (
          <button type="button" className={`${primaryButtonClass} w-full flex-1`} onClick={goNext}>
            Continue <span aria-hidden="true">&rarr;</span>
          </button>
        ) : (
          <button
            type="submit"
            className={`${accentButtonClass} w-full flex-1 disabled:cursor-not-allowed disabled:opacity-70`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
            <span aria-hidden="true">{isSubmitting ? '...' : '->'}</span>
          </button>
        )}
      </div>
    </form>
  )
}

function StepProgress({ currentStep }) {
  const steps = [
    { id: 1, label: 'Personal' },
    { id: 2, label: 'Track' },
    { id: 3, label: 'Goals' },
  ]

  return (
    <div className="flex items-start justify-between gap-1.5 sm:gap-2" aria-label="Application progress">
      {steps.map((step, index) => {
        const isDone = step.id < currentStep
        const isActive = step.id === currentStep

        return (
          <div key={step.id} className="relative flex flex-1 items-start justify-center gap-1.5 sm:gap-2">
            <div className="grid justify-items-center gap-1.5 md:gap-2">
              <div
                className={`grid h-[34px] w-[34px] place-items-center rounded-full border text-[11px] font-extrabold md:h-[38px] md:w-[38px] md:text-xs ${
                  isActive
                    ? 'border-slate-900/[0.1] bg-dark text-white shadow-[0_0_0_5px_rgba(15,23,42,0.08)]'
                    : isDone
                      ? 'border-transparent bg-[#fb923c] text-white'
                      : 'border-transparent bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={`text-center text-[8px] font-extrabold uppercase tracking-[0.1em] md:text-[10px] md:tracking-[0.14em] ${
                  isActive ? 'text-dark' : isDone ? 'text-accent-strong' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mt-[17px] h-px w-[18px] md:mt-[19px] md:w-[34px] ${
                  step.id < currentStep ? 'bg-accent/50' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, required, error, hint, children }) {
  return (
    <div className="grid gap-2">
      <label className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text', hasError = false }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${inputClass} min-h-12 ${hasError ? 'border-red-300 bg-red-50/90' : ''}`}
    />
  )
}

function StepPersonal({ values, errors, updateField }) {
  return (
    <section className="grid gap-[18px]">
      <div>
        <h3 className="font-display text-[18px] tracking-[-0.04em] text-dark">Personal Information</h3>
        <p className="mt-1.5 text-xs text-muted">Tell us a bit about yourself</p>
      </div>

      <div className={fieldGridClass}>
        <Field label="Full Name" required error={errors.fullName}>
          <TextInput
            value={values.fullName}
            onChange={(event) => updateField('fullName', event.target.value)}
            placeholder="e.g. Adaeze Okafor"
            hasError={Boolean(errors.fullName)}
          />
        </Field>

        <Field label="Email Address" required error={errors.email}>
          <TextInput
            type="email"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="adaeze@example.com"
            hasError={Boolean(errors.email)}
          />
        </Field>
      </div>

      <div className={fieldGridClass}>
        <Field label="Phone Number" required error={errors.phone}>
          <TextInput
            value={values.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="08012345678"
            hasError={Boolean(errors.phone)}
          />
        </Field>

        <Field label="Gender" required error={errors.gender}>
          <Dropdown
            value={values.gender}
            options={GENDER_OPTIONS}
            placeholder="Choose your gender"
            onChange={(value) => updateField('gender', value)}
            hasError={Boolean(errors.gender)}
          />
        </Field>
      </div>

      <Field label="Age Range" required error={errors.ageRange}>
        <Dropdown
          value={values.ageRange}
          options={AGE_RANGES}
          placeholder="Select your age range"
          onChange={(value) => updateField('ageRange', value)}
          hasError={Boolean(errors.ageRange)}
        />
      </Field>
    </section>
  )
}

function StepTrack({ values, errors, updateField }) {
  return (
    <section className="grid gap-[18px]">
      <div>
        <h3 className="font-display text-[18px] tracking-[-0.04em] text-dark">Choose Your Track</h3>
        <p className="mt-1.5 text-xs text-muted">Pick the skill you want to master over 3 months</p>
      </div>

      {errors.stack && <p className="-mt-2 text-[11px] text-red-600">{errors.stack}</p>}

      <div className="grid gap-2.5">
        {STACKS.map((stack) => {
          const active = values.stack === stack.id
          const tones = {
            blue: 'bg-blue-500',
            green: 'bg-emerald-500',
            violet: 'bg-violet-500',
            orange: 'bg-orange-500',
            indigo: 'bg-indigo-500',
          }

          return (
            <button
              key={stack.id}
              type="button"
              className={`flex items-center gap-3 rounded-[18px] border p-4 text-left transition ${
                active
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-900/[0.1] bg-white hover:-translate-y-px hover:border-accent/25 hover:shadow-[0_14px_28px_rgba(15,23,42,0.06)]'
              }`}
              onClick={() => updateField('stack', stack.id)}
            >
              <div className={`h-[14px] w-[14px] flex-none rounded-full ${tones[stack.tone]}`} />
              <div className="min-w-0 flex-1">
                <strong className="block text-[13px] leading-[1.25] md:text-sm">{stack.label}</strong>
                <span className={`mt-1 block text-[11px] leading-[1.5] ${active ? 'text-slate-200' : 'text-slate-500'}`}>
                  {stack.description}
                </span>
              </div>
              <div
                className={`grid h-[22px] w-[22px] flex-none place-items-center rounded-full border text-xs ${
                  active
                    ? 'border-orange-300/40 bg-orange-300/10 text-orange-300'
                    : 'border-slate-900/10 text-transparent'
                }`}
              >
                {active ? '✓' : ''}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function StepGoals({ values, errors, updateField, serverError }) {
  return (
    <section className="grid gap-[18px]">
      <div>
        <h3 className="font-display text-[18px] tracking-[-0.04em] text-dark">Your Goals</h3>
        <p className="mt-1.5 text-xs text-muted">Help us understand what drives you</p>
      </div>

      <Field
        label="Why do you want to join Ignite-100?"
        required
        error={errors.motivation}
        hint={`${values.motivation.length}/1000 characters, minimum 50`}
      >
        <textarea
          value={values.motivation}
          onChange={(event) => updateField('motivation', event.target.value)}
          rows={5}
          placeholder="Share your goals, what you hope to learn, and how this program fits into your journey..."
          className={`${inputClass} min-h-[140px] resize-y p-[14px] ${errors.motivation ? 'border-red-300 bg-red-50/90' : ''}`}
        />
      </Field>

      <Field label="How did you hear about Ignite-100?" required error={errors.heardFrom}>
        <Dropdown
          value={values.heardFrom}
          options={HEARD_FROM_OPTIONS.map((value) => ({ value, label: value }))}
          placeholder="Select an option"
          onChange={(value) => updateField('heardFrom', value)}
          hasError={Boolean(errors.heardFrom)}
        />
      </Field>

      <Field
        label="Referral Code"
        error={errors.referralCode}
        hint="If someone shared a code with you, enter it here (optional)"
      >
        <TextInput
          value={values.referralCode}
          onChange={(event) => updateField('referralCode', event.target.value)}
          placeholder="e.g. TECHTAN10, ORG-2024, john123"
          hasError={Boolean(errors.referralCode)}
        />
      </Field>

      <input type="hidden" value={values.educationLevel} readOnly />
      <input type="hidden" value={values.institution} readOnly />

      {serverError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-50/90 px-4 py-3.5 text-[13px] leading-[1.6] text-red-700">
          {serverError}
        </div>
      )}
    </section>
  )
}

function SuccessScreen({ name, containerRef }) {
  return (
    <div ref={containerRef} className="grid gap-[18px] px-0 py-[18px] text-centeritems-center justify-center ">
      <div className="mx-auto grid h-[72px] w-[72px] place-items-center rounded-full border border-emerald-500/20 bg-emerald-500/12 text-[32px] text-emerald-500">
        <Check className='h-5 w-5' />
      </div>
      <h2 className="font-display text-[1.8rem] tracking-[-0.05em] text-dark">You're in, {name}!</h2>
      <p className="mx-auto max-w-[380px] text-center leading-[1.7] text-gray-900">
        Your application for <strong>Ignite-100</strong> has been received. Expect a response
        within 48 hours.
      </p>

      <div className="mx-auto mt-2 max-w-[420px] rounded-[22px] bg-slate-900 p-5 text-white">
        <h3 className="text-xs uppercase tracking-[0.16em]">What happens next</h3>
        <ul className="mt-[14px] grid list-none gap-2.5 p-0">
          <li className="text-xs text-white/90">Check your email for confirmation</li>
          <li className="text-xs text-white/90">Join our WhatsApp community</li>
          <li className="text-xs text-white/90">Attend the orientation session</li>
        </ul>
      </div>
    </div>
  )
}

export default RegistrationForm
