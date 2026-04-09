import { AnimatePresence, motion as Motion } from 'framer-motion'
import { Check, Link2, Share2, Smartphone, Tag, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function Header() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [nativeSharing, setNativeSharing] = useState(false)
  const [referralCode, setReferralCode] = useState(getQueryReferralCode())
  const [showReferralInput, setShowReferralInput] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
        setShowReferralInput(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function buildShareUrl() {
    const base =
      typeof window !== 'undefined'
        ? window.location.href
        : 'https://ignite-five-gamma.vercel.app/'

    if (!referralCode.trim()) return base

    const url = new URL(base)
    url.searchParams.set('ref', referralCode.trim())
    return url.toString()
  }

  const shareUrl = buildShareUrl()
  const shareText =
    'Applications are open for TechTan Ignite-100, 3 months of intensive tech training. Apply now!'

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // no-op
    }
  }

  async function handleNativeShare() {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return

    setNativeSharing(true)

    try {
      await navigator.share({
        title: 'TechTan Ignite-100',
        text: shareText,
        url: shareUrl,
      })
      setOpen(false)
      setShowReferralInput(false)
    } catch {
      // user cancelled or unsupported
    } finally {
      setNativeSharing(false)
    }
  }

  function handleShareButtonClick() {
    if (typeof navigator !== 'undefined' && typeof window !== 'undefined' && window.innerWidth < 640) {
      setOpen(true)
    } else {
      setOpen((current) => !current)
    }
    setShowReferralInput(false)
  }

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    (typeof navigator.canShare !== 'function' ||
      navigator.canShare({
        title: 'TechTan Ignite-100',
        text: shareText,
        url: shareUrl,
      }))

  const shareChannels = [
    {
      label: 'WhatsApp',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      color: 'hover:bg-green-50 hover:text-green-700',
    },
    {
      label: 'Twitter / X',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(
        shareUrl,
      )}`,
      color: 'hover:bg-gray-100 hover:text-gray-900',
    },
    {
      label: 'LinkedIn',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        shareUrl,
      )}&title=${encodeURIComponent('TechTan Ignite-100')}&summary=${encodeURIComponent(
        shareText,
      )}`,
      color: 'hover:bg-blue-50 hover:text-blue-700',
    },
  ]

  return (
    <Motion.header
      className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-sm"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <img src="/logo2.jpg" alt="TechTan Logo" className="h-10 w-auto object-contain" />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={handleShareButtonClick}
            className={`group flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              open
                ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600'
            }`}
            aria-label="Share this page"
          >
            <Share2
              className={`h-4 w-4 transition-transform duration-200 ${open ? '' : 'group-hover:scale-110'}`}
            />
            <span>Share</span>
          </button>

          <AnimatePresence>
            {open && (
              <Motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-gray-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-900">
                      Share Ignite-100
                    </p>
                    <p className="mt-0.5 text-[11px] text-green-500">
                      Spread the word to your network
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setShowReferralInput(false)
                    }}
                    className="rounded-lg p-1 text-gray-900 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close share menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="border-b border-gray-50 px-3 pb-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowReferralInput((current) => !current)}
                    className="flex w-full items-center gap-2.5 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:border-orange-100 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <Tag className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-left text-xs">
                      {referralCode.trim()
                        ? `Referral: ${referralCode.trim()}`
                        : 'Add your referral code (optional)'}
                    </span>
                    <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-900">
                      {showReferralInput ? 'Hide' : 'Edit'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showReferralInput && (
                      <Motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-1 pb-1 pt-2">
                          <p className="mb-1.5 text-[11px] leading-snug text-gray-400">
                            Your referral code will be appended to the link. Anyone who registers
                            using your link will have your code pre-filled.
                          </p>
                          <input
                            type="text"
                            value={referralCode}
                            onChange={(event) => setReferralCode(event.target.value)}
                            placeholder="e.g. TECHTAN10, ORG-2024, john123..."
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
                            autoFocus
                          />
                          {referralCode.trim() && (
                            <p className="mt-1 truncate text-[10px] text-orange-500">
                              Link: ...?ref={referralCode.trim()}
                            </p>
                          )}
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-b border-gray-50 px-3 py-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      copied
                        ? 'border border-green-200 bg-green-50 text-green-700'
                        : 'border border-transparent bg-gray-50 text-gray-700 hover:border-orange-100 hover:bg-orange-50 hover:text-orange-700'
                    }`}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                    ) : (
                      <Link2 className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    )}
                    <span className="truncate text-xs">
                      {copied ? 'Link copied!' : shareUrl.replace(/^https?:\/\//, '')}
                    </span>
                    <span
                      className={`ml-auto flex-shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        copied ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {copied ? '✓' : 'Copy'}
                    </span>
                  </button>
                </div>

                <div className="space-y-1 px-3 py-3">
                  {canNativeShare && (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      disabled={nativeSharing}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 transition-all duration-150 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Smartphone className="h-4 w-4 flex-shrink-0" />
                      <span>{nativeSharing ? 'Opening share...' : 'Share from device'}</span>
                    </button>
                  )}

                  {shareChannels.map((channel) => (
                    <a
                      key={channel.label}
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 transition-all duration-150 ${channel.color}`}
                    >
                      <span className="flex-shrink-0">{channel.icon}</span>
                      <span>Share on {channel.label}</span>
                    </a>
                  ))}
                </div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Motion.header>
  )
}

function getQueryReferralCode() {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('ref')?.trim() ?? ''
}

export default Header
