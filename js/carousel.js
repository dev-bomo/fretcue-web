const AUTOPLAY_MS = 4500

for (const root of document.querySelectorAll('.carousel')) {
  const track = root.querySelector('.carousel__track')
  const slides = [...root.querySelectorAll('.carousel__slide')]
  const dotsEl = root.querySelector('.carousel__dots')
  const caption = root.querySelector('.carousel__caption')
  let index = 0

  const dots = slides.map((_, i) => {
    const dot = document.createElement('button')
    dot.type = 'button'
    dot.className = 'carousel__dot'
    dot.setAttribute('aria-label', `Show screen ${i + 1}`)
    dot.addEventListener('click', () => {
      stopAutoplay()
      goTo(i)
    })
    dotsEl.append(dot)
    return dot
  })

  function goTo(i) {
    const next = (i + slides.length) % slides.length
    track.scrollTo({ left: next * track.clientWidth })
  }

  function setActive(i) {
    index = i
    dots.forEach((dot, d) =>
      d === i ? dot.setAttribute('aria-current', 'true') : dot.removeAttribute('aria-current'),
    )
    caption.textContent = slides[i].dataset.caption ?? ''
  }

  let scrollFrame = 0
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame)
    scrollFrame = requestAnimationFrame(() => {
      const i = Math.round(track.scrollLeft / track.clientWidth)
      if (i !== index) setActive(i)
    })
  })

  for (const arrow of root.querySelectorAll('.carousel__arrow')) {
    arrow.addEventListener('click', () => {
      stopAutoplay()
      goTo(index + Number(arrow.dataset.dir))
    })
  }

  track.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    stopAutoplay()
    goTo(index + (e.key === 'ArrowRight' ? 1 : -1))
  })

  let timer = 0
  function stopAutoplay() {
    clearInterval(timer)
    timer = 0
  }

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion && 'IntersectionObserver' in window) {
    root.addEventListener('pointerdown', () => {
      root.dataset.touched = '1'
      stopAutoplay()
    })
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && timer === 0 && !root.dataset.touched) {
          timer = setInterval(() => goTo(index + 1), AUTOPLAY_MS)
        } else if (!entry.isIntersecting) {
          stopAutoplay()
        }
      },
      { threshold: 0.5 },
    ).observe(root)
  }

  setActive(0)
}
