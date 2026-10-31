/* ============================================================
   Sri Durga HariHara Enterprises — interactions
   Vanilla JavaScript. No dependencies.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (selector, scope) { return (scope || document).querySelector(selector); };
  var $$ = function (selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); };
  var config = window.SITE_CONFIG || {};

  /* ---------- Safe storage ---------- */
  function readStore(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeStore(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) {}
  }

  /* ---------- Colour theme + light/dark mode ---------- */
  var themeButtons = $$('[data-set-theme]');
  var modeToggle = $('#mode-toggle');
  var themeColorMeta = $('meta[name="theme-color"]');

  function syncThemeControls() {
    var currentTheme = root.getAttribute('data-theme') || 'espresso';
    themeButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-set-theme') === currentTheme));
    });

    var mode = root.getAttribute('data-mode') || 'light';
    if (modeToggle) {
      var label = mode === 'dark' ? 'Light' : 'Dark';
      var action = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      var labelNode = $('[data-mode-label]', modeToggle);
      if (labelNode) { labelNode.textContent = label; }
      modeToggle.setAttribute('aria-label', action);
      modeToggle.setAttribute('title', action);
    }

    if (themeColorMeta) {
      var deep = window.getComputedStyle(root).getPropertyValue('--deep-2').trim();
      if (deep) { themeColorMeta.setAttribute('content', deep); }
    }
  }

  function applyTheme(theme, remember) {
    if (['espresso', 'cherry', 'estate'].indexOf(theme) === -1) { return; }
    root.classList.add('theme-transition');
    root.setAttribute('data-theme', theme);
    if (remember) { writeStore('sdhhe-theme', theme); }
    syncThemeControls();
    window.setTimeout(function () { root.classList.remove('theme-transition'); }, 340);
  }

  function applyMode(mode, remember) {
    if (mode !== 'light' && mode !== 'dark') { return; }
    root.classList.add('theme-transition');
    root.setAttribute('data-mode', mode);
    if (remember) { writeStore('sdhhe-mode', mode); }
    syncThemeControls();
    window.setTimeout(function () { root.classList.remove('theme-transition'); }, 340);
  }

  themeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      applyTheme(button.getAttribute('data-set-theme'), true);
    });
  });

  if (modeToggle) {
    modeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-mode') === 'dark' ? 'light' : 'dark';
      applyMode(next, true);
    });
  }

  // Synchronise after the head script has restored a saved choice.
  syncThemeControls();

  /* ---------- Header scroll state ---------- */
  var header = $('#site-header');
  var ticking = false;

  function updateHeader() {
    if (!header) { return; }
    header.classList.toggle('is-scrolled', window.scrollY > 10);
    updateActiveNav();
    ticking = false;
  }

  function requestHeaderUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateHeader);
    }
  }

  window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
  window.addEventListener('resize', requestHeaderUpdate);

  /* ---------- Active section marker ---------- */
  var navLinks = $$('.nav__links a[href^="#"]');
  var navSections = navLinks.map(function (link) {
    var id = link.getAttribute('href').slice(1);
    return { link: link, section: document.getElementById(id) };
  }).filter(function (item) { return item.section; });

  function updateActiveNav() {
    if (!navSections.length) { return; }
    var threshold = (header ? header.offsetHeight : 80) + 96;
    var activeId = null;

    navSections.forEach(function (item) {
      var rect = item.section.getBoundingClientRect();
      if (rect.top <= threshold) { activeId = item.section.id; }
    });

    // Clear the marker when the opening section is still in view.
    var hero = $('.hero');
    if (hero) {
      var heroRect = hero.getBoundingClientRect();
      if (heroRect.bottom > threshold) { activeId = null; }
    }

    // The enquiry and footer sit outside the primary navigation.
    var enquiry = $('#enquiry');
    if (enquiry && enquiry.getBoundingClientRect().top <= threshold) { activeId = null; }

    navSections.forEach(function (item) {
      var active = item.section.id === activeId;
      item.link.classList.toggle('is-active', active);
      if (active) {
        item.link.setAttribute('aria-current', 'location');
      } else {
        item.link.removeAttribute('aria-current');
      }
    });
  }

  /* ---------- Mobile navigation ---------- */
  var menuToggle = $('#menu-toggle');
  var mobileNav = $('#mobile-nav');

  function closeMobileNav(returnFocus) {
    if (!menuToggle || !mobileNav || mobileNav.hidden) { return; }
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    if (returnFocus) { menuToggle.focus(); }
  }

  if (menuToggle && mobileNav) {
    menuToggle.setAttribute('aria-label', 'Open menu');
    menuToggle.addEventListener('click', function () {
      var isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileNav(false);
      } else {
        mobileNav.hidden = false;
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Close menu');
      }
    });

    $$('a', mobileNav).forEach(function (link) {
      link.addEventListener('click', function () { closeMobileNav(false); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !mobileNav.hidden) {
        closeMobileNav(true);
      }
    });

    document.addEventListener('click', function (event) {
      if (!mobileNav.hidden && !mobileNav.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMobileNav(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) { closeMobileNav(false); }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealItems = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  /* ---------- Flavour finder tabs ---------- */
  var flavourData = {
    chocolate: {
      title: 'Cocoa, hazelnut, brown sugar',
      note: 'A comforting, rounded cup with gentle acidity. Excellent with milk, and just as good black.',
      origins: 'Brazil, Colombia, Chikmagalur',
      process: 'Natural or pulped natural',
      brew: 'Espresso, French press'
    },
    fruity: {
      title: 'Citrus, berries, jasmine',
      note: 'A lifted, tea-like cup with a clean finish. Best enjoyed black, where the origin can speak.',
      origins: 'Ethiopia, Kenya, Araku Valley',
      process: 'Washed',
      brew: 'Pour-over, filter'
    },
    earthy: {
      title: 'Earth, tobacco, warm spice',
      note: 'A grounded, low-acid cup with a long, savoury finish. The old-world character of Monsooned Malabar.',
      origins: 'Monsooned Malabar, Wayanad',
      process: 'Monsooned or natural',
      brew: 'South Indian filter, French press'
    },
    strong: {
      title: 'Dark chocolate, roasted nuts, molasses',
      note: 'A deep, full-bodied cup with weight and intensity. Made for a little milk or a short, strong shot.',
      origins: 'Wayanad Robusta, Vietnam',
      process: 'Natural',
      brew: 'Moka pot, espresso'
    },
    caramel: {
      title: 'Caramel, orange, cocoa',
      note: 'A balanced, rounded cup with a soft sweetness — the everyday cup that is easy to love.',
      origins: 'Chikmagalur & Coorg, Colombia',
      process: 'Washed or natural',
      brew: 'Filter, espresso'
    }
  };

  var flavourTabs = $$('.flavour-tab');
  var flavourPanel = $('#flavour-panel');

  function setFlavour(key, focusTab) {
    var data = flavourData[key];
    if (!data || !flavourPanel) { return; }

    flavourTabs.forEach(function (tab) {
      var isSelected = tab.getAttribute('data-flavour') === key;
      tab.setAttribute('aria-selected', String(isSelected));
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
      if (isSelected) {
        flavourPanel.setAttribute('aria-labelledby', tab.id);
        if (focusTab) { tab.focus(); }
      }
    });

    $('[data-flavour-title]', flavourPanel).textContent = data.title;
    $('[data-flavour-note]', flavourPanel).textContent = data.note;
    $('[data-flavour-origins]', flavourPanel).textContent = data.origins;
    $('[data-flavour-process]', flavourPanel).textContent = data.process;
    $('[data-flavour-brew]', flavourPanel).textContent = data.brew;
  }

  flavourTabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      setFlavour(tab.getAttribute('data-flavour'), false);
    });

    tab.addEventListener('keydown', function (event) {
      var targetIndex = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        targetIndex = (index + 1) % flavourTabs.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        targetIndex = (index - 1 + flavourTabs.length) % flavourTabs.length;
      } else if (event.key === 'Home') {
        targetIndex = 0;
      } else if (event.key === 'End') {
        targetIndex = flavourTabs.length - 1;
      }
      if (targetIndex !== null) {
        event.preventDefault();
        var nextTab = flavourTabs[targetIndex];
        setFlavour(nextTab.getAttribute('data-flavour'), true);
      }
    });
  });

  /* ---------- Brew ratio calculator ---------- */
  var brewMethod = $('#brew-method');
  var coffeeInput = $('#coffee-grams');
  var coffeeRange = $('#coffee-grams-range');
  var waterOutput = $('[data-water-output]');
  var ratioOutput = $('[data-ratio-output]');
  var coffeeOutput = $('[data-coffee-output]');
  var waterLabel = $('.ratio-result .mono-label');

  function formatNumber(value) {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value);
  }

  function updateRatio() {
    if (!brewMethod || !coffeeInput) { return; }
    var grams = parseFloat(coffeeInput.value);
    if (!isFinite(grams) || grams <= 0) { return; }
    grams = Math.min(200, Math.max(1, grams));
    var selected = brewMethod.options[brewMethod.selectedIndex];
    var ratio = parseFloat(selected.getAttribute('data-ratio')) || 16;
    var water = Math.round(grams * ratio);

    if (waterOutput) { waterOutput.textContent = formatNumber(water); }
    if (ratioOutput) { ratioOutput.textContent = 'Ratio 1:' + ratio; }
    if (coffeeOutput) { coffeeOutput.textContent = formatNumber(grams) + ' g coffee'; }
    if (waterLabel) { waterLabel.textContent = brewMethod.value === 'espresso' ? 'Espresso yield' : 'Water needed'; }
    if (coffeeRange && document.activeElement !== coffeeRange) { coffeeRange.value = String(Math.min(parseFloat(coffeeRange.max) || 200, grams)); }

    $$('[data-brew-row]').forEach(function (row) {
      row.classList.toggle('is-active', row.getAttribute('data-brew-row') === brewMethod.value);
    });
  }

  if (brewMethod && coffeeInput) {
    var initialRatio = brewMethod.options[brewMethod.selectedIndex].getAttribute('data-ratio');
    if (coffeeRange) {
      coffeeRange.max = '200';
      coffeeRange.value = coffeeInput.value || '18';
    }
    if (ratioOutput) { ratioOutput.textContent = 'Ratio 1:' + (initialRatio || '16'); }
    updateRatio();

    brewMethod.addEventListener('change', updateRatio);

    coffeeInput.addEventListener('input', function () {
      var value = parseFloat(coffeeInput.value);
      if (coffeeRange && isFinite(value)) {
        coffeeRange.value = String(Math.min(200, Math.max(1, value)));
      }
      updateRatio();
    });

    coffeeInput.addEventListener('blur', function () {
      var value = parseFloat(coffeeInput.value);
      if (!isFinite(value) || value < 1) { coffeeInput.value = '1'; }
      if (value > 200) { coffeeInput.value = '200'; }
      updateRatio();
    });

    if (coffeeRange) {
      coffeeRange.addEventListener('input', function () {
        coffeeInput.value = coffeeRange.value;
        updateRatio();
      });
    }
  }

  /* ---------- Contact details from site-config.js ---------- */
  function populateContactDetails() {
    if (!config || !config.email) { return; }

    var values = {
      address: config.address,
      email: config.email,
      phone: config.phoneDisplay,
      gstin: config.gstin,
      iec: config.iec
    };

    Object.keys(values).forEach(function (key) {
      if (!values[key]) { return; }
      $$('[data-contact="' + key + '"]').forEach(function (node) {
        node.textContent = values[key];
      });
    });

    $$('[data-contact-link="email"]').forEach(function (link) {
      link.setAttribute('href', 'mailto:' + config.email);
    });
    $$('[data-contact-link="phone"]').forEach(function (link) {
      if (config.phoneE164) { link.setAttribute('href', 'tel:' + config.phoneE164); }
    });
    $$('[data-contact-link="whatsapp"]').forEach(function (link) {
      var number = String(config.whatsapp || '').replace(/\D/g, '');
      if (number) { link.setAttribute('href', 'https://wa.me/' + number); }
    });

    var form = $('#enquiry-form');
    if (form) {
      if (config.form && config.form.fallbackEndpoint) {
        form.setAttribute('action', config.form.fallbackEndpoint);
      }
      var subject = $('input[name="_subject"]', form);
      if (subject && config.form && config.form.subject) {
        subject.value = config.form.subject;
      }
    }
  }
  populateContactDetails();

  /* ---------- Product links prefill the enquiry form ---------- */
  var productInput = $('#enquiry-product');
  $$('[data-product]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (productInput) {
        productInput.value = link.getAttribute('data-product');
      }
    });
  });

  /* ---------- Enquiry form ---------- */
  var enquiryForm = $('#enquiry-form');
  var submitButton = $('#submit-button');
  var formStatus = $('#form-status');

  function getSubmitLabel() {
    return submitButton ? $('span', submitButton) : null;
  }

  function setFormStatus(message, type, withEmailLink) {
    if (!formStatus) { return; }
    formStatus.textContent = '';
    formStatus.classList.remove('is-success', 'is-error');
    if (type) { formStatus.classList.add(type); }
    formStatus.append(document.createTextNode(message));
    if (withEmailLink && config.email) {
      var link = document.createElement('a');
      link.href = 'mailto:' + config.email;
      link.textContent = config.email;
      formStatus.append(document.createTextNode(' '));
      formStatus.append(link);
      formStatus.append(document.createTextNode('.'));
    }
  }

  function buildMailto() {
    if (!enquiryForm || !config.email) { return 'mailto:' + (config.email || ''); }
    var fields = [
      ['Name', 'name'],
      ['Company', 'company'],
      ['Country', 'country'],
      ['Email', 'email'],
      ['Enquiry type', 'enquiry_type'],
      ['Quantity', 'quantity'],
      ['Product of interest', 'product'],
      ['Message', 'message']
    ];
    var lines = fields.map(function (pair) {
      var field = enquiryForm.elements[pair[1]];
      var value = field && field.value ? field.value.trim() : '';
      return value ? pair[0] + ': ' + value : null;
    }).filter(Boolean);
    lines.unshift('Trade enquiry — Sri Durga HariHara Enterprises', '');
    lines.push('', 'Sent from the website enquiry form.');
    var subject = (config.form && config.form.subject) || 'Trade enquiry';
    return 'mailto:' + config.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function setSending(isSending) {
    if (!submitButton) { return; }
    submitButton.disabled = isSending;
    submitButton.setAttribute('aria-busy', String(isSending));
    var label = getSubmitLabel();
    if (label) {
      if (!submitButton.getAttribute('data-label')) {
        submitButton.setAttribute('data-label', label.textContent);
      }
      label.textContent = isSending ? 'Sending enquiry…' : submitButton.getAttribute('data-label');
    }
  }

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', async function (event) {
      if (!window.fetch) { return; }
      event.preventDefault();

      var honey = enquiryForm.elements['_honey'];
      if (honey && honey.value) { return; }

      if (!enquiryForm.reportValidity()) { return; }

      // If no form service has been configured, let the visitor email directly.
      if (!config.form || !config.form.ajaxEndpoint) {
        setFormStatus('The form service is not configured yet. Please email your enquiry directly to', 'is-error', true);
        return;
      }

      setSending(true);
      if (formStatus) {
        formStatus.textContent = 'Sending your enquiry…';
        formStatus.classList.remove('is-success', 'is-error');
      }

      try {
        var response = await fetch(config.form.ajaxEndpoint, {
          method: 'POST',
          body: new FormData(enquiryForm),
          headers: { Accept: 'application/json' }
        });

        var result = null;
        try { result = await response.json(); } catch (e) {}

        var failed = !response.ok || (result && (result.success === false || result.success === 'false'));
        if (failed) {
          var reason = result && result.message ? result.message : 'The form service did not accept the enquiry.';
          throw new Error(reason);
        }

        setFormStatus('Thank you. Your enquiry has been sent. We aim to reply within two working days.', 'is-success', false);
        enquiryForm.reset();
        if (productInput) { productInput.value = ''; }
      } catch (error) {
        var mailto = buildMailto();
        if (formStatus) {
          formStatus.textContent = 'Your enquiry could not be sent just now. Please send it by email instead: ';
          formStatus.classList.remove('is-success');
          formStatus.classList.add('is-error');
          var directLink = document.createElement('a');
          directLink.href = mailto;
          directLink.textContent = 'open the prepared email';
          formStatus.append(directLink);
          formStatus.append(document.createTextNode('.'));
        }
      } finally {
        setSending(false);
      }
    });
  }
})();
