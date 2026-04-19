const DEFAULT_ADMIN_EMAILS = ['victortamunoibuomi07@gmail.com']

const ADMIN_EMAILS = (
  import.meta.env.VITE_ADMIN_EMAILS?.split(',').map((value) => value.trim().toLowerCase()) ||
  DEFAULT_ADMIN_EMAILS
).filter(Boolean)

const PRIMARY_ADMIN_EMAIL = ADMIN_EMAILS[0] || DEFAULT_ADMIN_EMAILS[0]

function normalizeAdminEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

function isAllowedAdminEmail(email) {
  return ADMIN_EMAILS.includes(normalizeAdminEmail(email))
}

export { ADMIN_EMAILS, PRIMARY_ADMIN_EMAIL, isAllowedAdminEmail, normalizeAdminEmail }
