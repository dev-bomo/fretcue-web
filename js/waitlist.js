/**
 * Waitlist → Web3Forms → email set when the access key was created
 * (use hello@fretcue.com so Cloudflare Email Routing delivers to your inbox).
 *
 * Setup: https://web3forms.com → Create Access Key → paste below → redeploy.
 * Docs: https://docs.web3forms.com/
 * Free: 250 submissions / month.
 */
const WAITLIST_ENDPOINT = 'https://api.web3forms.com/submit'
/** Public by design (alias for the destination inbox). Not a secret server key. */
const WEB3FORMS_ACCESS_KEY = 'dbbb29d2-8332-4a30-ab0f-cd61e7d0bb46'

const STORAGE_KEY = 'fretcue-waitlist'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function saveLocal(email) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    if (!list.includes(email)) {
      list.push(email)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    }
  } catch {
    /* ignore */
  }
}

async function submitEmail(email) {
  if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY.startsWith('PASTE_')) {
    throw new Error('Web3Forms access key not configured')
  }

  const res = await fetch(WAITLIST_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      email,
      subject: 'FretCue waitlist signup',
      from_name: 'FretCue Waitlist',
      source: 'fretcue-landing',
      botcheck: false,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success !== true) {
    throw new Error(data.message || 'Submit failed')
  }

  // Keep a local copy as backup / analytics later
  saveLocal(email)
}

function setStatus(el, message, kind) {
  el.textContent = message
  el.classList.remove('is-success', 'is-error')
  if (kind) el.classList.add(kind)
}

function bindForm(form) {
  const input = form.querySelector('input[type="email"]')
  const button = form.querySelector('button[type="submit"]')
  const status = form.querySelector('.waitlist__status')
  if (!input || !button || !status) return

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const email = input.value.trim().toLowerCase()

    if (!isValidEmail(email)) {
      setStatus(status, 'Enter a valid email address.', 'is-error')
      input.focus()
      return
    }

    button.disabled = true
    setStatus(status, 'Joining…', null)

    try {
      await submitEmail(email)
      setStatus(status, 'You’re on the list. We’ll be in touch.', 'is-success')
      input.value = ''
      document.querySelectorAll('[data-waitlist] .waitlist__status').forEach((node) => {
        if (node !== status) {
          setStatus(node, 'You’re on the list. We’ll be in touch.', 'is-success')
        }
      })
    } catch {
      setStatus(status, 'Something went wrong. Try again in a moment.', 'is-error')
    } finally {
      button.disabled = false
    }
  })
}

document.querySelectorAll('[data-waitlist]').forEach(bindForm)
