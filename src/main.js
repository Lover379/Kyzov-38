// ============================================================
//  Kuzov-38 — интерактив и анимации
//  (стили подключены через <link> в index.html)
// ============================================================

// Утилита: есть ли поддержка анимаций (учитываем prefers-reduced-motion)
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Preloader ---------- */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => preloader?.classList.add('is-hidden'), 350);
});
// Страховка: скрыть прелоадер, если load не сработает (кэш/ошибки)
setTimeout(() => document.getElementById('preloader')?.classList.add('is-hidden'), 3000);

/* ---------- Header: состояние при скролле + кнопка "наверх" ---------- */
const header = document.getElementById('header');
const toTop = document.getElementById('toTop');
const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('is-scrolled', y > 30);
  toTop.classList.toggle('is-shown', y > 600);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

toTop.addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
);

/* ---------- Мобильное меню ---------- */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const closeMenu = () => {
  nav.classList.remove('is-open');
  burger.classList.remove('is-active');
  burger.setAttribute('aria-expanded', 'false');
};
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.classList.toggle('is-active', open);
  burger.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('.nav__link').forEach((l) => l.addEventListener('click', closeMenu));

/* ---------- Плавный скролл с учётом высоты шапки ---------- */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: offset, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});

/* ---------- Scroll-spy: активный пункт меню ---------- */
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav__link');
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((l) =>
        l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`)
      );
    });
  },
  { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
);
sections.forEach((s) => spy.observe(s));

/* ---------- Reveal по скроллу (со stagger внутри групп) ---------- */
const revealObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
);

// назначаем задержку соседним элементам для каскадного появления
document.querySelectorAll('.service__grid, .portfolio__grid, .blog__grid, .prices__grid, .hero__info').forEach((group) => {
  [...group.children].forEach((child, i) => {
    child.style.transitionDelay = `${Math.min(i, 8) * 70}ms`;
  });
});

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------- Анимация счётчиков ---------- */
const animateCount = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1600;
  const start = performance.now();
  const fmt = (n) => n.toLocaleString('ru-RU');
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    el.textContent = fmt(Math.round(target * eased)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const countObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      obs.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

/* ---------- Анимация полос навыков ---------- */
const skillObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const fill = entry.target.querySelector('.skill__bar span');
      if (fill) fill.style.width = entry.target.dataset.value + '%';
      obs.unobserve(entry.target);
    });
  },
  { threshold: 0.4 }
);
document.querySelectorAll('.skill').forEach((el) => skillObserver.observe(el));

/* ---------- 3D-наклон и курсор-свечение отключены (минимализм) ---------- */

/* ---------- Фильтры портфолио ---------- */
const filters = document.getElementById('filters');
const works = [...document.querySelectorAll('#portfolioGrid .work')];
filters.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter');
  if (!btn) return;
  filters.querySelector('.is-active')?.classList.remove('is-active');
  btn.classList.add('is-active');
  const f = btn.dataset.filter;
  works.forEach((w) => {
    const match = f === 'all' || w.dataset.cat.split(' ').includes(f);
    w.classList.toggle('is-hidden', !match);
    if (match) {
      w.classList.remove('is-pop');
      void w.offsetWidth; // перезапуск анимации
      w.classList.add('is-pop');
    }
  });
});

/* ---------- Lightbox ---------- */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightboxImg');
const lbCounter = document.getElementById('lightboxCounter');
let visibleWorks = works;
let currentIndex = 0;

const refreshVisible = () => (visibleWorks = works.filter((w) => !w.classList.contains('is-hidden')));

const showImage = (i) => {
  currentIndex = (i + visibleWorks.length) % visibleWorks.length;
  const img = visibleWorks[currentIndex].querySelector('img');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCounter.textContent = `${currentIndex + 1} / ${visibleWorks.length}`;
};
const openLightbox = (workEl) => {
  refreshVisible();
  showImage(visibleWorks.indexOf(workEl));
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};
const closeLightbox = () => {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

works.forEach((w) => w.addEventListener('click', () => openLightbox(w)));
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', () => showImage(currentIndex - 1));
document.getElementById('lightboxNext').addEventListener('click', () => showImage(currentIndex + 1));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
  if (e.key === 'ArrowRight') showImage(currentIndex + 1);
});

/* ---------- Форма заявки (демо-обработка) ---------- */
const form = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // Здесь могла бы быть реальная отправка на сервер / PHP-обработчик.
  const required = [...form.querySelectorAll('[required]')];
  let ok = true;
  required.forEach((f) => {
    if (!f.value.trim()) {
      ok = false;
      f.style.borderColor = '#ff5d5d';
    } else {
      f.style.borderColor = '';
    }
  });
  if (!ok) return;
  success.classList.add('is-shown');
  form.reset();
  setTimeout(() => success.classList.remove('is-shown'), 6000);
});
