/**
 * Waitlist form handler.
 *
 * Set WAITLIST_ENDPOINT to a Formspree / Loops / Getform URL when ready.
 * Until then, validated emails are stored in localStorage so the UI works end-to-end.
 */
const WAITLIST_ENDPOINT = '' // e.g. 'https://formspree.io/f/xxxxxx'

const STORAGE_KEY = 'fretcue-waitlist'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function readLocalList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocal(email) {
  const list = readLocalList()
  if (!list.includes(email)) {
    list.push(email)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }
}

async function submitEmail(email) {
  if (WAITLIST_ENDPOINT) {
    const res = await fetch(WAITLIST_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, source: 'fretcue-landing' }),
    })
    if (!res.ok) {
      throw new Error('Submit failed')
    }
    return
  }

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
      // Keep sibling forms in sync messaging
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
