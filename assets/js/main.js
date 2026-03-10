(() => {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  const burger = document.querySelector(".burger");
  const mobileNav = document.getElementById("mobileNav");

  if (burger && mobileNav) {
    burger.addEventListener("click", () => {
      const isOpen = mobileNav.style.display === "block";
      mobileNav.style.display = isOpen ? "none" : "block";
      burger.setAttribute("aria-expanded", String(!isOpen));
    });

    mobileNav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        mobileNav.style.display = "none";
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }
})();

// Active navigation highlight on scroll
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = Array.from(document.querySelectorAll('.nav__link[href^="#"]'));
  if (!navLinks.length) return;

  const sections = navLinks
    .map(link => {
      const id = link.getAttribute('href');
      const el = document.querySelector(id);
      return el ? { link, el } : null;
    })
    .filter(Boolean);

  function setActive() {
    const scrollY = window.scrollY + 140;
    let current = sections[0] || null;

    sections.forEach(item => {
      if (item.el.offsetTop <= scrollY) current = item;
    });

    navLinks.forEach(link => link.classList.remove('is-active'));
    if (current) current.link.classList.add('is-active');
  }

  setActive();
  window.addEventListener('scroll', setActive, { passive: true });
});
