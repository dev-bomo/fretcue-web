const steps = document.querySelectorAll('.steps li')
if (steps.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.25, rootMargin: '0px 0px -8% 0px' },
  )
  steps.forEach((el, i) => {
    el.style.transitionDelay = `${i * 90}ms`
    io.observe(el)
  })
} else {
  steps.forEach((el) => el.classList.add('is-in'))
}
