    // ===== Mobile hamburger =====
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu when a link is tapped
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // ===== News dropdown =====
    const dropdownBtns = document.querySelectorAll('.has-dropdown > button');

    dropdownBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const parent = btn.parentElement;
        const isOpen = parent.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
        document.querySelectorAll('.has-dropdown.open').forEach(d => {
          if (d !== parent) {
            d.classList.remove('open');
            d.querySelector('button').setAttribute('aria-expanded', 'false');
          }
        });
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', e => {
      if (!e.target.closest('.has-dropdown')) {
        document.querySelectorAll('.has-dropdown.open').forEach(d => {
          d.classList.remove('open');
          d.querySelector('button').setAttribute('aria-expanded', 'false');
        });
      }
    });

    // ===== Scroll progress + navbar state + back-to-top =====
    const progressBar = document.getElementById('progressBar');
    const navbar = document.getElementById('navbar');
    const backTop = document.getElementById('backTop');

    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      progressBar.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + '%';
      navbar.classList.toggle('scrolled', doc.scrollTop > 8);
      backTop.classList.toggle('show', doc.scrollTop > 600);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== Active nav link highlighting (only for in-page anchor navs) =====
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

    if (navAnchors.length) {
      const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navAnchors.forEach(a => {
              a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
            });
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px' });

      document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));
    }

    // ===== Duplicate ticker content for seamless loop =====
    const tickerTrack = document.getElementById('tickerTrack');
    if (tickerTrack) {
      tickerTrack.innerHTML += tickerTrack.innerHTML;
    }

    // ===== Language select (hook up translations here) =====
    document.getElementById('langSelect').addEventListener('change', e => {
      // TODO: wire to your language-switching logic
      console.log('Language selected:', e.target.value);
    });

    // ===== Scroll reveal =====
    const revealEls = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => revealObserver.observe(el));

    // ===== Animated counters =====
    const counters = document.querySelectorAll('.counter');

    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    function animateCounter(el) {
      const target = parseFloat(el.dataset.target) || 0;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    counters.forEach(c => counterObserver.observe(c));

    // ===== International phone input (intl-tel-input) =====
    const phoneInputEl = document.getElementById('phone');

    if (phoneInputEl && window.intlTelInput) {
      window.intlTelInput(phoneInputEl, {
        separateDialCode: true,
        countrySearch: true,
        initialCountry: 'gb',
        geoIpLookup: function (success) {
          fetch('https://ipapi.co/json/')
            .then(function (res) { return res.json(); })
            .then(function (data) { success(data.country_code); })
            .catch(function () { success('gb'); });
        }
      });
    }

    // ===== Blog category filter =====
    const filterChips = document.querySelectorAll('.f-chip');
    const postCards = document.querySelectorAll('.post-card[data-cat]');

    if (filterChips.length) {
      filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
          filterChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const cat = chip.dataset.cat;
          postCards.forEach(card => {
            card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
          });
        });
      });
    }

    // ===== Signup form (demo) =====
    const form = document.getElementById('signupForm');
    const formSuccess = document.getElementById('formSuccess');

    if (form && formSuccess) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        // TODO: replace with your real registration endpoint
        formSuccess.classList.add('visible');
        form.reset();
        setTimeout(() => formSuccess.classList.remove('visible'), 5000);
      });
    }
  