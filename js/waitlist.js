/**
 * Waitlist → FormSubmit → hello@fretcue.com
 * First submission triggers an activation email to that inbox — confirm it once.
 * Docs: https://formsubmit.co/ajax-documentation
 */
const WAITLIST_ENDPOINT = 'https://formsubmit.co/ajax/hello@fretcue.com'

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
  const res = await fetch(WAITLIST_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      source: 'fretcue-landing',
      _subject: 'FretCue waitlist signup',
      _template: 'table',
      _captcha: 'false',
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === 'false' || data.error) {
    throw new Error(data.message || data.error || 'Submit failed')
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
