/* ============================================================
   Chamundi · coffee trade desk assistant
   Sri Durga HariHara Enterprises, Bengaluru
   Plain JavaScript. No dependencies. Theme-aware.
   ============================================================ */

(function () {
  "use strict";

  if (window.__chamundiLoaded) return;
  window.__chamundiLoaded = true;

  var GREETING = "Namaskara. I'm Chamundi from Sri Durga HariHara Enterprises. Shall we talk coffee — brewing, beans, or finding the right cup for you?";
  var THANK_YOU = "Thank you. Our team will reply within one business day.";
  var MAX_INPUT = 2000;
  var MAX_HISTORY = 40;
  var STORE_HISTORY = "chamundi.history.v1";
  var STORE_SESSION = "chamundi.session.v1";
  var STORE_PASS = "chamundi.pass.v1";
  var STORE_LEAD = "chamundi.lead.v1";

  var TRISHUL_PATHS = [
    "M50 14 L50 88",
    "M50 14 L45 26 M50 14 L55 26",
    "M28 24 C28 42 37 50 50 50 C63 50 72 42 72 24",
    "M28 24 L24 32 M28 24 L33 31 M72 24 L76 32 M72 24 L67 31",
    "M43 58 L57 58 M44 64 L56 64"
  ];

  function line(x1, y1, x2, y2) {
    return { tag: "line", x1: x1, y1: y1, x2: x2, y2: y2 };
  }

  function lotusBody() {
    var body = [];
    [0, 45, 90, 135, 180, 225, 270, 315].forEach(function (angle) {
      var ellipse = { tag: "ellipse", cx: "50", cy: "24", rx: "8", ry: "17" };
      if (angle) ellipse.transform = "rotate(" + angle + " 50 50)";
      body.push(ellipse);
    });
    body.push({ tag: "circle", cx: "50", cy: "50", r: "9" });
    return body;
  }

  function yantraBody() {
    var body = [
      { tag: "rect", x: "6", y: "6", width: "88", height: "88" },
      { tag: "circle", cx: "50", cy: "50", r: "38" }
    ];
    [0, 45, 90, 135, 180, 225, 270, 315].forEach(function (angle) {
      body.push({
        tag: "ellipse",
        cx: "50",
        cy: "17",
        rx: "5",
        ry: "9",
        transform: "rotate(" + angle + " 50 50)"
      });
    });
    body.push({ tag: "circle", cx: "50", cy: "50", r: "28" });
    body.push({ tag: "path", d: "M50 26 L71 63 L29 63 Z" });
    body.push({ tag: "path", d: "M50 74 L71 37 L29 37 Z" });
    body.push({ tag: "path", d: "M50 36 L62 57 L38 57 Z" });
    body.push({ tag: "circle", cx: "50", cy: "50", r: "2", fill: "currentColor" });
    return body;
  }

  var SYMBOLS = [
    {
      name: "SHATKONA · SHIVA–SHAKTI",
      aria: "Shatkona",
      body: [
        { tag: "path", d: "M50 8 L86.4 71 L13.6 71 Z" },
        { tag: "path", d: "M50 92 L86.4 29 L13.6 29 Z" }
      ],
      trishul: { transform: "translate(31 31) scale(.38)" }
    },
    {
      name: "SURYA · EIGHT-RAY SUN",
      aria: "Surya",
      body: [
        { tag: "circle", cx: "50", cy: "50", r: "26" },
        line("50", "19", "50", "3"),
        line("61.9", "21.4", "65.3", "13"),
        line("71.9", "28.1", "83.2", "16.8"),
        line("78.6", "38.1", "87", "34.7"),
        line("81", "50", "97", "50"),
        line("78.6", "61.9", "87", "65.3"),
        line("71.9", "71.9", "83.2", "83.2"),
        line("61.9", "78.6", "65.3", "87"),
        line("50", "81", "50", "97"),
        line("38.1", "78.6", "34.7", "87"),
        line("28.1", "71.9", "16.8", "83.2"),
        line("21.4", "61.9", "13", "65.3"),
        line("19", "50", "3", "50"),
        line("21.4", "38.1", "13", "34.7"),
        line("28.1", "28.1", "16.8", "16.8"),
        line("38.1", "21.4", "34.7", "13")
      ],
      trishul: { transform: "translate(29 29) scale(.42)" }
    },
    {
      name: "ASHTAKONA · EIGHT-POINTED STAR",
      aria: "Ashtakona",
      body: [
        { tag: "rect", x: "22", y: "22", width: "56", height: "56" },
        { tag: "rect", x: "22", y: "22", width: "56", height: "56", transform: "rotate(45 50 50)" },
        { tag: "circle", cx: "50", cy: "50", r: "18" }
      ],
      trishul: { transform: "translate(34 34) scale(.32)" }
    },
    {
      name: "LOTUS · EIGHT PETALS",
      aria: "Lotus",
      body: lotusBody(),
      trishul: null
    },
    {
      name: "DURGA YANTRA · SACRED GEOMETRY",
      aria: "Durga Yantra",
      body: yantraBody(),
      trishul: null
    },
    {
      name: "TRISHUL · SHAKTI",
      aria: "Trishul",
      body: [],
      trishul: { transform: "" }
    }
  ];

  var symbolIndex = 0;
  var symbolTimer = null;
  var symbolPaused = false;
  var hoverPaused = false;
  var patternLayer = "a";
  var reducedMotionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  var BUYER_LABELS = {
    roaster: "Roaster",
    distributor: "Distributor",
    cafe: "Café / coffee bar",
    retailer: "Retailer",
    importer: "Importer",
    other: "Other"
  };

  var FORM_LABELS = {
    green: "Green beans",
    roasted: "Roasted beans",
    ground: "Ground coffee",
    mixed: "Green and roasted"
  };

  var config = readConfig();
  var state = {
    sessionId: getSessionId(),
    messages: loadHistory(),
    sessionPass: loadPass(),
    leadCard: loadLeadCard(),
    streaming: false,
    blocked: false,
    pendingSend: null,
    pendingUser: null,
    pendingLead: null,
    nearBottom: true,
    lastFocused: null
  };

  var ui = {};
  var streamState = null;
  var renderQueued = false;
  var turnstilePromise = null;
  var turnstileWidgetId = null;
  var turnstileToken = "";
  var turnstileRendering = false;
  var leadSequence = 0;
  var mobileQuery = window.matchMedia ? window.matchMedia("(max-width: 599px)") : null;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  /* ============================================================
     Boot
     ============================================================ */

  function init() {
    ensureStylesheet();
    buildUI();
    wireEvents();
    initSymbolScreen();

    addMessage("assistant", GREETING);
    state.messages.forEach(function (message) {
      addMessage(message.role, message.content);
    });

    if (state.leadCard) {
      renderLeadCard(state.leadCard);
    }

    if (state.messages.length === 0 && !state.leadCard) {
      addChips();
    }

    updateComposer();
    scrollToBottom(false);
    updateJumpButton();
  }

  function readConfig() {
    var script = document.currentScript || document.querySelector('script[src*="chamundi.js"]');
    var rawKey = script ? (script.getAttribute("data-turnstile-key") || "").trim() : "";
    var turnstileKey = /^[A-Za-z0-9_-]{10,}$/.test(rawKey) && !/replace|your_/i.test(rawKey) ? rawKey : "";
    var whatsapp = script ? (script.getAttribute("data-whatsapp") || "") : "";
    if (!whatsapp && window.SITE_CONFIG && window.SITE_CONFIG.whatsapp) {
      whatsapp = window.SITE_CONFIG.whatsapp;
    }
    whatsapp = String(whatsapp || "").replace(/\D/g, "");
    if (whatsapp.length < 8) whatsapp = "";

    var scriptSrc = script && script.src ? script.src : window.location.href;
    var css = script ? (script.getAttribute("data-css") || "") : "";
    var cssHref = css ? new URL(css, window.location.href).href : new URL("chamundi.css", scriptSrc).href;

    return {
      turnstileKey: turnstileKey,
      whatsapp: whatsapp,
      chatEndpoint: (script && script.getAttribute("data-chat-endpoint")) || "/api/chat",
      leadEndpoint: (script && script.getAttribute("data-lead-endpoint")) || "/api/lead",
      enquiry: (script && script.getAttribute("data-enquiry")) || "#enquiry",
      cssHref: cssHref,
      scriptSrc: scriptSrc
    };
  }

  function ensureStylesheet() {
    if (document.querySelector('link[data-chamundi-css="true"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = config.cssHref;
    link.setAttribute("data-chamundi-css", "true");
    document.head.appendChild(link);
  }

  /* ============================================================
     DOM
     ============================================================ */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function svgEl(tag, attrs) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs || {}).forEach(function (key) {
      node.setAttribute(key, attrs[key]);
    });
    return node;
  }

  function ensureTrishulDefs() {
    if (document.getElementById("cm-trishul")) return;
    var sprite = svgEl("svg", {
      width: "0",
      height: "0",
      "aria-hidden": "true",
      focusable: "false"
    });
    sprite.setAttribute("class", "chamundi-symbol-sprite");
    var defs = svgEl("defs");
    var group = svgEl("g", { id: "cm-trishul", "stroke-width": "3" });
    TRISHUL_PATHS.forEach(function (d) {
      group.appendChild(svgEl("path", { d: d }));
    });
    defs.appendChild(group);
    sprite.appendChild(defs);
    document.body.appendChild(sprite);
  }

  function createPrimitive(primitive) {
    var attrs = {};
    Object.keys(primitive).forEach(function (key) {
      if (key !== "tag") attrs[key] = primitive[key];
    });
    return svgEl(primitive.tag, attrs);
  }

  function buildSymbol(symbol, className) {
    var svg = svgEl("svg", {
      viewBox: "0 0 100 100",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2.4",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      focusable: "false"
    });
    svg.setAttribute("class", className || "cm-symbol");

    var body = svgEl("g", { class: "cm-symbol__body" });
    symbol.body.forEach(function (primitive) {
      body.appendChild(createPrimitive(primitive));
    });
    svg.appendChild(body);

    if (symbol.trishul) {
      var trishul = svgEl("g", {
        class: "cm-symbol__trishul",
        "stroke-width": "3"
      });
      if (symbol.trishul.transform) {
        trishul.setAttribute("transform", symbol.trishul.transform);
      }
      trishul.appendChild(svgEl("use", { href: "#cm-trishul" }));
      svg.appendChild(trishul);
    }

    return svg;
  }

  function buildSymbolStack(modifier) {
    var stack = el("div", "cm-symbol-stack " + modifier);
    SYMBOLS.forEach(function (symbol, index) {
      var svg = buildSymbol(symbol, "cm-symbol");
      if (index === 0) svg.classList.add("is-active");
      stack.appendChild(svg);
    });
    return stack;
  }

  function buildSymbolDots() {
    var wrap = el("div", "chamundi-symbol-dots");
    SYMBOLS.forEach(function (symbol, index) {
      var dot = el("button", "chamundi-symbol-dot");
      dot.type = "button";
      dot.setAttribute("aria-label", "Show " + symbol.aria + " symbol");
      dot.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      if (index === 0) dot.classList.add("is-active");
      dot.addEventListener("click", function () {
        jumpSymbol(index);
      });
      wrap.appendChild(dot);
    });
    return wrap;
  }

  function primitiveToMarkup(primitive) {
    var attrs = [];
    Object.keys(primitive).forEach(function (key) {
      if (key === "tag") return;
      var value = primitive[key];
      if (key === "fill" && value === "currentColor") value = "white";
      attrs.push(key + "='" + value + "'");
    });
    return "<" + primitive.tag + (attrs.length ? " " + attrs.join(" ") : "") + "/>";
  }

  function maskSvg(symbol) {
    var body = symbol.body.map(primitiveToMarkup).join("");
    if (symbol.trishul) {
      var transform = symbol.trishul.transform ? " transform='" + symbol.trishul.transform + "'" : "";
      body += "<g" + transform + " stroke-width='3'>" +
        TRISHUL_PATHS.map(function (d) { return "<path d='" + d + "'/>"; }).join("") +
        "</g>";
    }
    return "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 100 100' fill='none' stroke='white' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'>" + body + "</svg>";
  }

  function maskDataUri(symbol) {
    var svg = maskSvg(symbol)
      .replace(/%/g, "%25")
      .replace(/</g, "%3C")
      .replace(/>/g, "%3E")
      .replace(/#/g, "%23");
    return "url(\"data:image/svg+xml," + svg + "\")";
  }

  function prepareSymbolMasks() {
    SYMBOLS.forEach(function (symbol) {
      symbol.mask = maskDataUri(symbol);
    });
  }

  function buildUI() {
    ensureTrishulDefs();
    prepareSymbolMasks();

    var root = el("div", "chamundi-root");
    var panel = el("section", "chamundi-panel");
    panel.id = "chamundi-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "chamundi-title");
    panel.hidden = true;

    var header = el("header", "chamundi-header");
    var brand = el("div", "chamundi-brand");
    var headerMark = el("span", "chamundi-header__mark");
    var headerStack = buildSymbolStack("cm-symbol-stack--header");
    headerMark.appendChild(headerStack);
    var dotsWrap = buildSymbolDots();
    headerMark.appendChild(dotsWrap);
    var brandText = el("div", "chamundi-brand__text");
    var title = el("h2", "chamundi-title", "Chamundi");
    title.id = "chamundi-title";
    var status = el("p", "chamundi-status");
    var statusDesk = el("span", null, "COFFEE TRADE DESK · ");
    var statusDot = el("span", "chamundi-status__dot", "●");
    statusDot.setAttribute("aria-hidden", "true");
    var statusText = el("span", null, " ONLINE");
    status.appendChild(statusDesk);
    status.appendChild(statusDot);
    status.appendChild(statusText);
    var symbolName = el("p", "chamundi-symbol-name", SYMBOLS[0].name);
    brandText.appendChild(title);
    brandText.appendChild(status);
    brandText.appendChild(symbolName);
    brand.appendChild(headerMark);
    brand.appendChild(brandText);

    var close = el("button", "chamundi-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close Chamundi chat");
    close.setAttribute("title", "Close");

    header.appendChild(brand);
    header.appendChild(close);

    var messages = el("div", "chamundi-messages");
    var log = el("div", "chamundi-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");
    log.setAttribute("aria-relevant", "additions text");
    log.setAttribute("aria-label", "Conversation with Chamundi");
    log.setAttribute("tabindex", "0");
    messages.appendChild(log);

    var typing = el("div", "chamundi-typing");
    typing.hidden = true;
    typing.setAttribute("role", "status");
    for (var i = 0; i < 3; i += 1) {
      var star = el("span", "chamundi-typing__star");
      star.setAttribute("aria-hidden", "true");
      star.appendChild(buildSymbol(SYMBOLS[0], "chamundi-shatkona chamundi-typing__star-icon"));
      typing.appendChild(star);
    }
    var typingSr = el("span", "chamundi-sr-only", "Chamundi is typing.");
    typing.appendChild(typingSr);

    var jump = el("button", "chamundi-jump", "↓");
    jump.type = "button";
    jump.hidden = true;
    jump.setAttribute("aria-label", "Jump to the latest message");
    jump.setAttribute("title", "Latest message");

    var compose = el("div", "chamundi-compose");
    var verify = el("div", "chamundi-verify");
    verify.hidden = true;
    var verifyLabel = el("p", "chamundi-verify__label", "Verify to start · Cloudflare Turnstile");
    var verifyStatus = el("p", "chamundi-verify__status", "A quick check protects the trade desk from automated messages.");
    var verifyWidget = el("div", "chamundi-verify__widget");
    verify.appendChild(verifyLabel);
    verify.appendChild(verifyStatus);
    verify.appendChild(verifyWidget);

    var form = el("form", "chamundi-form");
    form.noValidate = true;
    var input = el("textarea", "chamundi-input");
    input.rows = 1;
    input.maxLength = MAX_INPUT;
    input.placeholder = "Ask about origins, grades, samples…";
    input.setAttribute("aria-label", "Message Chamundi");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("dir", "auto");
    var send = el("button", "chamundi-send", "→");
    send.type = "submit";
    send.setAttribute("aria-label", "Send message");
    form.appendChild(input);
    form.appendChild(send);

    var hint = el("p", "chamundi-hint", "Enter to send · Shift + Enter for a new line");
    compose.appendChild(verify);
    compose.appendChild(form);
    compose.appendChild(hint);

    var footer = el("footer", "chamundi-footer");
    var person = el("a", null, "Talk to a person →");
    person.href = config.enquiry;
    person.setAttribute("data-chamundi-enquiry", "true");
    var whatsapp = null;
    if (config.whatsapp) {
      whatsapp = el("a", null, "WhatsApp →");
      whatsapp.href = "https://wa.me/" + config.whatsapp + "?text=" + encodeURIComponent("Namaskara, I would like to enquire about coffee.");
      whatsapp.target = "_blank";
      whatsapp.rel = "noopener noreferrer";
      whatsapp.setAttribute("aria-label", "Message the trade desk on WhatsApp (opens in a new tab)");
      whatsapp.setAttribute("data-chamundi-whatsapp", "true");
    }
    var ai = el("span", "chamundi-footer__ai", "AI assistant");
    footer.appendChild(person);
    if (whatsapp) footer.appendChild(whatsapp);
    footer.appendChild(ai);

    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(jump);
    panel.appendChild(compose);
    panel.appendChild(footer);

    log.appendChild(typing);

    var launcher = el("button", "chamundi-launcher");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open Chamundi chat");
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "chamundi-panel");
    var launcherStack = buildSymbolStack("cm-symbol-stack--launcher");
    launcher.appendChild(launcherStack);

    root.appendChild(launcher);
    root.appendChild(panel);
    document.body.appendChild(root);

    ui = {
      root: root,
      launcher: launcher,
      panel: panel,
      close: close,
      log: log,
      messages: messages,
      typing: typing,
      jump: jump,
      compose: compose,
      verify: verify,
      verifyLabel: verifyLabel,
      verifyStatus: verifyStatus,
      verifyWidget: verifyWidget,
      form: form,
      input: input,
      send: send,
      footer: footer,
      person: person,
      whatsapp: whatsapp,
      statusText: statusText,
      symbolLabel: symbolName,
      symbolStacks: [headerStack, launcherStack],
      symbolDots: Array.prototype.slice.call(dotsWrap.children),
      chips: null,
      leadCardEl: null
    };
  }

  /* ============================================================
     Events
     ============================================================ */

  function wireEvents() {
    ui.launcher.addEventListener("click", openPanel);
    ui.launcher.addEventListener("mouseenter", function () {
      hoverPaused = true;
      updateSymbolPause();
    });
    ui.launcher.addEventListener("mouseleave", function () {
      hoverPaused = false;
      updateSymbolPause();
    });
    document.addEventListener("visibilitychange", updateSymbolPause);
    if (reducedMotionQuery) {
      if (reducedMotionQuery.addEventListener) {
        reducedMotionQuery.addEventListener("change", function () {
          if (!symbolPaused) restartSymbolTimer();
        });
      } else if (reducedMotionQuery.addListener) {
        reducedMotionQuery.addListener(function () {
          if (!symbolPaused) restartSymbolTimer();
        });
      }
    }
    ui.close.addEventListener("click", closePanel);
    ui.form.addEventListener("submit", function (event) {
      event.preventDefault();
      sendMessage(ui.input.value);
    });
    ui.input.addEventListener("input", function () {
      autoResize();
      updateComposer();
    });
    ui.input.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing || event.keyCode === 229) return;
      event.preventDefault();
      sendMessage(ui.input.value);
    });
    ui.jump.addEventListener("click", function () {
      scrollToBottom(true);
      updateJumpButton();
    });
    ui.log.addEventListener("scroll", function () {
      state.nearBottom = isNearBottom();
      updateJumpButton();
    });
    ui.person.addEventListener("click", function () {
      closePanel();
    });
    if (ui.whatsapp) {
      ui.whatsapp.addEventListener("click", function () {
        closePanel();
      });
    }
    ui.panel.addEventListener("keydown", trapFocus);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !ui.panel.hidden) {
        event.preventDefault();
        closePanel();
      }
    });
    if (mobileQuery) {
      if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", syncMobileLock);
      else if (mobileQuery.addListener) mobileQuery.addListener(syncMobileLock);
    }
    if (window.MutationObserver) {
      var observer = new MutationObserver(function () {
        if (ui.panel.hidden || state.sessionPass || turnstileToken) return;
        if (config.turnstileKey) renderTurnstile();
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-mode"] });
    }
    window.addEventListener("pagehide", saveHistory);
    window.Chamundi = { open: openPanel, close: closePanel };
  }

  /* ============================================================
     Symbol screen saver
     ============================================================ */

  function initSymbolScreen() {
    updateSymbolUI(0);
    setPattern(0, true);
    updateSymbolPause();
    if (!symbolPaused) startSymbolTimer();
  }

  function updateSymbolUI(index) {
    symbolIndex = index;
    ui.symbolStacks.forEach(function (stack) {
      Array.prototype.forEach.call(stack.children, function (svg, svgIndex) {
        svg.classList.toggle("is-active", svgIndex === index);
      });
    });
    ui.symbolLabel.textContent = SYMBOLS[index].name;
    ui.symbolDots.forEach(function (dot, dotIndex) {
      var active = dotIndex === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function setSymbol(index, restartTimer) {
    var next = ((index % SYMBOLS.length) + SYMBOLS.length) % SYMBOLS.length;
    updateSymbolUI(next);
    setPattern(next, false);
    if (restartTimer) restartSymbolTimer();
  }

  function jumpSymbol(index) {
    setSymbol(index, true);
  }

  function setPattern(index, initial) {
    var mask = SYMBOLS[index].mask || maskDataUri(SYMBOLS[index]);
    if (initial) {
      ui.root.style.setProperty("--cm-mask-a", mask);
      ui.root.classList.add("is-pattern-a");
      patternLayer = "a";
      return;
    }
    if (patternLayer === "a") {
      ui.root.style.setProperty("--cm-mask-b", mask);
      ui.root.classList.remove("is-pattern-a");
      ui.root.classList.add("is-pattern-b");
      patternLayer = "b";
    } else {
      ui.root.style.setProperty("--cm-mask-a", mask);
      ui.root.classList.remove("is-pattern-b");
      ui.root.classList.add("is-pattern-a");
      patternLayer = "a";
    }
  }

  function startSymbolTimer() {
    if (symbolPaused) return;
    if (symbolTimer) window.clearInterval(symbolTimer);
    var interval = prefersReducedMotion() ? 10000 : 5000;
    symbolTimer = window.setInterval(function () {
      if (symbolPaused) return;
      setSymbol(symbolIndex + 1, false);
    }, interval);
  }

  function restartSymbolTimer() {
    if (symbolTimer) window.clearInterval(symbolTimer);
    symbolTimer = null;
    startSymbolTimer();
  }

  function updateSymbolPause() {
    var shouldPause = hoverPaused || document.hidden;
    if (shouldPause) {
      if (!symbolPaused) {
        symbolPaused = true;
        if (symbolTimer) window.clearInterval(symbolTimer);
        symbolTimer = null;
        ui.root.classList.add("is-symbol-paused");
      }
      return;
    }
    if (symbolPaused) {
      symbolPaused = false;
      ui.root.classList.remove("is-symbol-paused");
      restartSymbolTimer();
    }
  }

  function openPanel() {
    if (!ui.panel.hidden) return;
    state.lastFocused = document.activeElement;
    ui.panel.hidden = false;
    ui.root.classList.add("is-open");
    ui.launcher.setAttribute("aria-expanded", "true");
    syncMobileLock();
    ui.close.focus({ preventScroll: true });
    if (config.turnstileKey && !state.sessionPass && !turnstileToken) {
      renderTurnstile();
    }
    state.nearBottom = true;
    scrollToBottom(false);
    updateJumpButton();
  }

  function closePanel() {
    if (ui.panel.hidden) return;
    ui.panel.hidden = true;
    ui.root.classList.remove("is-open");
    ui.launcher.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("chamundi-lock");
    var target = state.lastFocused && state.lastFocused !== document.body && document.contains(state.lastFocused) ? state.lastFocused : ui.launcher;
    try {
      target.focus({ preventScroll: true });
    } catch (e) {
      target.focus();
    }
  }

  function syncMobileLock() {
    if (!document.documentElement) return;
    if (!ui.panel.hidden && mobileQuery && mobileQuery.matches) {
      document.documentElement.classList.add("chamundi-lock");
    } else {
      document.documentElement.classList.remove("chamundi-lock");
    }
  }

  function trapFocus(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
      return;
    }
    if (event.key !== "Tab") return;
    var focusable = getFocusable();
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (!ui.panel.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function getFocusable() {
    var nodes = ui.panel.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
    );
    return Array.prototype.slice.call(nodes).filter(function (node) {
      return !node.hidden && node.offsetParent !== null;
    });
  }

  /* ============================================================
     Verification
     ============================================================ */

  function hasVerification() {
    if (!config.turnstileKey) return true;
    if (state.sessionPass && tokenIsFresh(state.sessionPass)) return true;
    return Boolean(turnstileToken);
  }

  function ensureVerified(pendingText) {
    if (hasVerification()) return true;
    state.pendingSend = pendingText;
    showVerification();
    if (config.turnstileKey) {
      renderTurnstile();
    }
    return false;
  }

  function showVerification() {
    ui.verify.hidden = false;
    ui.verify.classList.remove("is-verified");
    ui.verifyStatus.textContent = "A quick check protects the trade desk from automated messages.";
  }

  function markVerified() {
    turnstileToken = "";
    if (turnstileWidgetId !== null && window.turnstile) {
      try {
        window.turnstile.remove(turnstileWidgetId);
      } catch (e) {
        /* The widget may already be gone. */
      }
      turnstileWidgetId = null;
    }
    ui.verify.classList.add("is-verified");
    ui.verifyStatus.textContent = "Verified. You can send your message.";
    ui.verify.hidden = true;
  }

  function resetTurnstile() {
    turnstileToken = "";
    if (turnstileWidgetId !== null && window.turnstile) {
      try {
        window.turnstile.remove(turnstileWidgetId);
      } catch (e) {
        /* Ignore. */
      }
      turnstileWidgetId = null;
    }
    if (!config.turnstileKey || state.sessionPass) {
      ui.verify.hidden = true;
      return;
    }
    showVerification();
    renderTurnstile();
  }

  function renderTurnstile() {
    if (!config.turnstileKey || state.sessionPass || turnstileToken) {
      ui.verify.hidden = true;
      return;
    }
    if (turnstileRendering) return;
    turnstileRendering = true;
    showVerification();

    loadTurnstile()
      .then(function (turnstile) {
        if (!turnstile) throw new Error("Turnstile unavailable");
        if (state.sessionPass || turnstileToken) {
          ui.verify.hidden = true;
          return;
        }
        if (turnstileWidgetId !== null) {
          try {
            turnstile.remove(turnstileWidgetId);
          } catch (e) {
            /* Ignore. */
          }
          turnstileWidgetId = null;
        }
        ui.verifyWidget.textContent = "";
        turnstileWidgetId = turnstile.render(ui.verifyWidget, {
          sitekey: config.turnstileKey,
          theme: document.documentElement.getAttribute("data-mode") === "dark" ? "dark" : "light",
          size: "flexible",
          action: "chamundi",
          callback: function (token) {
            turnstileToken = token;
            ui.verify.classList.add("is-verified");
            ui.verifyStatus.textContent = "Verified. Sending your message…";
            window.setTimeout(function () {
              if (turnstileToken) ui.verify.hidden = true;
            }, 300);
            if (state.pendingSend) {
              var pending = state.pendingSend;
              state.pendingSend = null;
              sendMessage(pending);
            }
          },
          "expired-callback": function () {
            turnstileToken = "";
            ui.verifyStatus.textContent = "Verification expired. Please complete it again.";
            resetTurnstile();
          },
          "timeout-callback": function () {
            turnstileToken = "";
            ui.verifyStatus.textContent = "Verification timed out. Please try again.";
            resetTurnstile();
          },
          "error-callback": function () {
            turnstileToken = "";
            ui.verifyStatus.textContent = "Verification could not load. Please refresh the page or use the enquiry form.";
          }
        });
      })
      .catch(function () {
        ui.verifyStatus.textContent = "Verification could not load. Please refresh the page or use the enquiry form.";
      })
      .then(
        function () {
          turnstileRendering = false;
        },
        function () {
          turnstileRendering = false;
        }
      );
  }

  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (turnstilePromise) return turnstilePromise;
    turnstilePromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = function () {
        if (window.turnstile) resolve(window.turnstile);
        else reject(new Error("Turnstile did not initialise"));
      };
      script.onerror = function () {
        reject(new Error("Turnstile failed to load"));
      };
      document.head.appendChild(script);
    }).catch(function (error) {
      turnstilePromise = null;
      throw error;
    });
    return turnstilePromise;
  }

  /* ============================================================
     Sending and streaming
     ============================================================ */

  async function sendMessage(rawText) {
    var text = String(rawText || "").trim();
    if (!text || state.streaming || state.blocked) return;
    if (text.length > MAX_INPUT) {
      addNotice("Please keep messages under 2,000 characters.", { linkText: "Use the enquiry form →", href: config.enquiry });
      return;
    }
    if (!ensureVerified(text)) return;

    state.pendingSend = null;
    removeChips();

    var userWrap = addMessage("user", text);
    state.pendingUser = { el: userWrap, content: text };
    state.messages.push({ role: "user", content: text });
    saveHistory();

    ui.input.value = "";
    autoResize();
    state.pendingLead = null;
    setStreaming(true);
    scrollToBottom(true);

    var payload = {
      sessionId: state.sessionId,
      messages: state.messages.slice(-12).map(function (message) {
        return { role: message.role, content: message.content };
      }),
      sessionPass: state.sessionPass || undefined
    };
    if (!state.sessionPass && turnstileToken) {
      payload.turnstileToken = turnstileToken;
      // A Turnstile token is single-use. Clear it as soon as it is sent so a
      // failed request cannot accidentally reuse it.
      turnstileToken = "";
    }

    try {
      var response = await fetch(config.chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        var errorBody = await readJson(response);
        throw new ChatError(
          (errorBody && errorBody.error) || "http_error",
          (errorBody && errorBody.message) || "The chat service returned an error.",
          response.status
        );
      }

      var contentType = response.headers.get("content-type") || "";
      if (!response.body || contentType.indexOf("text/event-stream") === -1) {
        var wrongBody = await readJson(response);
        throw new ChatError(
          (wrongBody && wrongBody.error) || "bad_response",
          "The chat service returned an unexpected response.",
          response.status
        );
      }

      await consumeSSE(response, {
        meta: function (data) {
          if (data && data.sessionPass) {
            state.sessionPass = data.sessionPass;
            savePass();
            markVerified();
          }
        },
        text: function (data) {
          if (data && typeof data.delta === "string") appendStreamText(data.delta);
        },
        lead_draft: function (data) {
          if (data && data.draft && data.token) state.pendingLead = data;
        },
        error: function (data) {
          throw new ChatError(
            (data && data.code) || "chat_error",
            (data && data.message) || "The chat service reported an error.",
            200
          );
        }
      });

      finishStream(true);
      state.pendingUser = null;
    } catch (error) {
      finishStream(false);
      handleChatError(error, text);
    } finally {
      setStreaming(false);
      updateComposer();
      saveHistory();
      if (state.nearBottom) scrollToBottom(false);
      updateJumpButton();
    }
  }

  async function consumeSSE(response, handlers) {
    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    var buffer = "";
    var eventName = "message";
    var dataLines = [];

    try {
      while (true) {
        var result = await reader.read();
        if (result.done) break;
        buffer += decoder.decode(result.value, { stream: true });
        var newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          var line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.charAt(line.length - 1) === "\r") line = line.slice(0, -1);
          if (line === "") {
            if (dataLines.length) {
              var eventData = dataLines.join("\n");
              dataLines = [];
              var parsed = null;
              try {
                parsed = JSON.parse(eventData);
              } catch (parseError) {
                parsed = null;
              }
              if (handlers[eventName]) handlers[eventName](parsed);
            }
            eventName = "message";
            continue;
          }
          if (line.indexOf("event:") === 0) {
            eventName = line.slice(6).trim();
          } else if (line.indexOf("data:") === 0) {
            dataLines.push(line.slice(5).replace(/^ /, ""));
          }
        }
      }
      if (dataLines.length) {
        var finalParsed = null;
        try {
          finalParsed = JSON.parse(dataLines.join("\n"));
        } catch (finalParseError) {
          finalParsed = null;
        }
        if (handlers[eventName]) handlers[eventName](finalParsed);
      }
    } finally {
      try {
        await reader.cancel();
      } catch (cancelError) {
        /* Ignore. */
      }
    }
  }

  function appendStreamText(delta) {
    if (!delta) return;
    if (!streamState) {
      ui.typing.hidden = true;
      var shell = createMessageShell("assistant");
      shell.wrap.classList.add("is-streaming");
      streamState = { wrap: shell.wrap, bubble: shell.bubble, raw: "" };
    }
    streamState.raw += delta;
    if (renderQueued) return;
    renderQueued = true;
    window.requestAnimationFrame(function () {
      renderQueued = false;
      if (!streamState) return;
      renderMarkdown(streamState.bubble, streamState.raw);
      if (state.nearBottom) scrollToBottom(false);
      updateJumpButton();
    });
  }

  function finishStream(success) {
    var hadCard = Boolean(state.pendingLead);
    var hadText = false;

    if (streamState) {
      var current = streamState;
      current.wrap.classList.remove("is-streaming");
      if (current.raw.trim()) {
        hadText = true;
        renderMarkdown(current.bubble, current.raw);
        if (success) {
          state.messages.push({ role: "assistant", content: current.raw.trim() });
          saveHistory();
        }
      } else {
        current.wrap.remove();
      }
      streamState = null;
    }

    if (state.pendingLead) {
      var card = state.pendingLead;
      state.pendingLead = null;
      renderLeadCard(card);
      hadCard = true;
    }

    if (success && !hadText && !hadCard) {
      addNotice("I did not receive a reply. Please try again, or use the enquiry form.", {
        linkText: "Open the enquiry form →",
        href: config.enquiry
      });
    }

    ui.typing.hidden = true;
    ui.log.setAttribute("aria-busy", "false");
    updateJumpButton();
  }

  function handleChatError(error, attemptedText) {
    var code = error && error.code;
    if (code === "verification_required" || code === "verification_failed" || code === "verification_not_configured") {
      state.sessionPass = null;
      clearPass();
      turnstileToken = "";
      removePendingUser();

      if (code === "verification_not_configured" || !config.turnstileKey) {
        state.blocked = true;
        addNotice("Chat verification is not configured yet. Please use the enquiry form or WhatsApp to reach the trade desk.", {
          linkText: "Open the enquiry form →",
          href: config.enquiry
        });
      } else {
        state.pendingSend = attemptedText;
        ui.verifyStatus.textContent = "Please complete verification. Your message will send automatically.";
        resetTurnstile();
      }
      return;
    }

    if (code === "session_limit" || code === "ip_limit") {
      state.blocked = true;
      addNotice(
        (error && error.message) || "This chat has reached its message limit. Please use the enquiry form or WhatsApp.",
        { linkText: "Open the enquiry form →", href: config.enquiry }
      );
      ui.input.placeholder = "Chat limit reached — please use the enquiry form";
      return;
    }

    if (code === "rate_limit_unavailable") {
      addNotice("The chat service is temporarily unavailable. Please use the enquiry form or WhatsApp.", {
        linkText: "Open the enquiry form →",
        href: config.enquiry
      });
      if (!state.sessionPass && config.turnstileKey) resetTurnstile();
      return;
    }

    addNotice("I could not reach the trade desk just now. Please try again, or use the enquiry form.", {
      linkText: "Open the enquiry form →",
      href: config.enquiry
    });
    if (error && error.status === 401) {
      state.sessionPass = null;
      clearPass();
      resetTurnstile();
    } else if (!state.sessionPass && config.turnstileKey) {
      resetTurnstile();
    }
  }

  function removePendingUser() {
    if (!state.pendingUser) return;
    try {
      state.pendingUser.el.remove();
    } catch (e) {
      /* Ignore. */
    }
    if (state.messages.length && state.messages[state.messages.length - 1].role === "user") {
      state.messages.pop();
    }
    state.pendingUser = null;
    saveHistory();
  }

  function setStreaming(streaming) {
    state.streaming = streaming;
    ui.typing.hidden = !streaming;
    ui.log.setAttribute("aria-busy", streaming ? "true" : "false");
    ui.statusText.textContent = streaming ? " TYPING" : " ONLINE";
    updateComposer();
  }

  function updateComposer() {
    if (!ui.input) return;
    var disabled = state.streaming || state.blocked;
    ui.input.disabled = disabled;
    ui.send.disabled = disabled || !ui.input.value.trim();
    if (ui.chips) {
      Array.prototype.forEach.call(ui.chips.querySelectorAll("button"), function (button) {
        button.disabled = disabled;
      });
    }
  }

  function autoResize() {
    if (!ui.input) return;
    ui.input.style.height = "auto";
    var height = Math.min(ui.input.scrollHeight, 120);
    ui.input.style.height = Math.max(44, height) + "px";
  }

  /* ============================================================
     Messages and markdown
     ============================================================ */

  function createMessageShell(role) {
    var wrap = el("div", "chamundi-msg chamundi-msg--" + (role === "assistant" ? "bot" : "user"));
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", role === "assistant" ? "Chamundi said" : "You said");
    var row = el("div", "chamundi-msg__row");
    if (role === "assistant") {
      var avatar = el("span", "chamundi-msg__avatar");
      avatar.setAttribute("aria-hidden", "true");
      avatar.appendChild(buildSymbol(SYMBOLS[0], "chamundi-shatkona chamundi-msg__avatar-icon"));
      row.appendChild(avatar);
    }
    var bubble = el("div", "chamundi-bubble");
    bubble.setAttribute("dir", "auto");
    row.appendChild(bubble);
    wrap.appendChild(row);
    ui.log.insertBefore(wrap, ui.typing);
    return { wrap: wrap, bubble: bubble };
  }

  function addMessage(role, content) {
    var shell = createMessageShell(role);
    if (role === "assistant") {
      renderMarkdown(shell.bubble, content);
    } else {
      shell.bubble.textContent = content;
    }
    return shell.wrap;
  }

  function addNotice(text, options) {
    var notice = el("div", "chamundi-notice");
    notice.setAttribute("role", "alert");
    notice.textContent = text;
    if (options && options.linkText && options.href) {
      notice.appendChild(document.createTextNode(" "));
      var link = el("a", null, options.linkText);
      link.href = options.href;
      if (options.href.indexOf("http") === 0) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      } else {
        link.addEventListener("click", function () {
          closePanel();
        });
      }
      notice.appendChild(link);
    }
    ui.log.insertBefore(notice, ui.typing);
    if (state.nearBottom) scrollToBottom(true);
    updateJumpButton();
    return notice;
  }

  function addChips() {
    if (ui.chips || state.messages.length || state.leadCard) return;
    var prompts = ["Brewing guide", "Find my coffee", "Request samples", "Compare origins", "Export terms", "Get a quote"];
    var wrap = el("div", "chamundi-chips");
    prompts.forEach(function (prompt) {
      var button = el("button", "chamundi-chip", prompt + " →");
      button.type = "button";
      button.addEventListener("click", function () {
        sendMessage(prompt);
      });
      wrap.appendChild(button);
    });
    ui.log.insertBefore(wrap, ui.typing);
    ui.chips = wrap;
    if (state.streaming || state.blocked) updateComposer();
  }

  function removeChips() {
    if (!ui.chips) return;
    try {
      ui.chips.remove();
    } catch (e) {
      /* Ignore. */
    }
    ui.chips = null;
  }

  function renderMarkdown(container, raw) {
    container.textContent = "";
    var text = String(raw || "").replace(/\r\n?/g, "\n");
    var lines = text.split("\n");
    var paragraph = [];
    var list = null;

    function flushParagraph() {
      if (!paragraph.length) return;
      var p = el("p");
      appendInline(p, paragraph.join("\n"));
      container.appendChild(p);
      paragraph = [];
    }

    function flushList() {
      if (!list) return;
      container.appendChild(list.el);
      list = null;
    }

    lines.forEach(function (line) {
      var trimmed = line.trim();
      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }
      var bullet = line.match(/^\s*[-*•]\s+(.*)$/);
      var numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
      var heading = line.match(/^\s*#{1,4}\s+(.*)$/);

      if (bullet) {
        flushParagraph();
        if (!list || list.type !== "ul") {
          flushList();
          list = { type: "ul", el: el("ul") };
        }
        var bulletItem = el("li");
        appendInline(bulletItem, bullet[1]);
        list.el.appendChild(bulletItem);
      } else if (numbered) {
        flushParagraph();
        if (!list || list.type !== "ol") {
          flushList();
          list = { type: "ol", el: el("ol") };
        }
        var numberItem = el("li");
        appendInline(numberItem, numbered[1]);
        list.el.appendChild(numberItem);
      } else if (heading) {
        flushParagraph();
        flushList();
        var headingNode = el("p", "chamundi-md-heading");
        appendInline(headingNode, heading[1]);
        container.appendChild(headingNode);
      } else if (list) {
        if (/^\s{2,}/.test(line)) {
          var lastItem = list.el.lastElementChild;
          if (lastItem) {
            lastItem.appendChild(document.createTextNode(" "));
            appendInline(lastItem, trimmed);
          }
        } else {
          flushList();
          paragraph.push(line);
        }
      } else {
        paragraph.push(line);
      }
    });

    flushParagraph();
    flushList();

    if (!container.firstChild && text.trim()) {
      var fallback = el("p");
      appendInline(fallback, text);
      container.appendChild(fallback);
    }
  }

  function appendInline(parent, text) {
    var lines = String(text).split("\n");
    lines.forEach(function (line, index) {
      if (index > 0) parent.appendChild(document.createElement("br"));
      appendInlineLine(parent, line);
    });
  }

  function appendInlineLine(parent, text) {
    var pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    var lastIndex = 0;
    var match;
    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parent.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      var token = match[0];
      if (token.indexOf("**") === 0 && token.lastIndexOf("**") === token.length - 2) {
        var strong = el("strong", null, token.slice(2, -2));
        parent.appendChild(strong);
      } else if (token.charAt(0) === "`" && token.charAt(token.length - 1) === "`") {
        var code = el("code", null, token.slice(1, -1));
        parent.appendChild(code);
      } else if (token.charAt(0) === "*" && token.charAt(token.length - 1) === "*") {
        var emphasis = el("em", null, token.slice(1, -1));
        parent.appendChild(emphasis);
      } else if (token.charAt(0) === "[") {
        var linkMatch = token.match(/^\[([^\]]+)\]\((.+)\)$/);
        if (linkMatch) {
          var href = safeUrl(linkMatch[2]);
          if (href) {
            var link = el("a", null, linkMatch[1]);
            link.href = href;
            if (href.indexOf("http://") === 0 || href.indexOf("https://") === 0) {
              link.target = "_blank";
              link.rel = "noopener noreferrer";
            }
            parent.appendChild(link);
          } else {
            parent.appendChild(document.createTextNode(token));
          }
        } else {
          parent.appendChild(document.createTextNode(token));
        }
      } else {
        parent.appendChild(document.createTextNode(token));
      }
      lastIndex = pattern.lastIndex;
    }
    if (lastIndex < text.length) {
      parent.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
  }

  function safeUrl(raw) {
    try {
      var url = new URL(String(raw), window.location.href);
      if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") {
        return url.href;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  /* ============================================================
     Lead summary card
     ============================================================ */

  function renderLeadCard(card) {
    if (ui.leadCardEl) {
      try {
        ui.leadCardEl.remove();
      } catch (e) {
        /* Ignore. */
      }
      ui.leadCardEl = null;
    }
    var node = buildLeadCard(card);
    ui.log.insertBefore(node, ui.typing);
    ui.leadCardEl = node;
    state.leadCard = card;
    saveLeadCard();
    if (state.nearBottom) scrollToBottom(true);
    updateJumpButton();
  }

  function buildLeadCard(card) {
    var box = el("section", "chamundi-lead");
    box.setAttribute("aria-label", "Trade enquiry summary");
    var eyebrow = el(
      "p",
      "chamundi-lead__eyebrow",
      card.submitted ? "TRADE ENQUIRY · SENT" : "TRADE ENQUIRY · SUMMARY"
    );
    var list = el("dl", "chamundi-lead__list");
    var draft = card.draft || {};

    var rows = [
      ["Name", draft.name],
      ["Company", draft.company],
      ["Country", draft.country],
      ["Buyer type", BUYER_LABELS[draft.buyer_type] || draft.buyer_type],
      ["Product", FORM_LABELS[draft.product_form] || draft.product_form],
      ["Origin / grade", draft.origin_grade],
      ["Volume", draft.volume],
      ["Incoterm / port", draft.incoterm_port],
      ["Timeline", draft.timeline],
      ["Email", draft.email],
      ["WhatsApp", draft.whatsapp]
    ];

    if (draft.notes) rows.push(["Notes", draft.notes]);

    rows.forEach(function (row) {
      var rowNode = el("div", "chamundi-lead__row");
      var dt = el("dt", null, row[0]);
      var dd = el("dd", null, row[1] ? String(row[1]) : "Not provided");
      dd.setAttribute("dir", "auto");
      rowNode.appendChild(dt);
      rowNode.appendChild(dd);
      list.appendChild(rowNode);
    });

    box.appendChild(eyebrow);
    box.appendChild(list);

    if (card.submitted) {
      box.classList.add("is-submitted");
      var sentStatus = el("p", "chamundi-lead__status is-success", THANK_YOU);
      sentStatus.setAttribute("role", "status");
      sentStatus.setAttribute("aria-live", "polite");
      box.appendChild(sentStatus);
      return box;
    }

    leadSequence += 1;
    var consentId = "chamundi-consent-" + leadSequence;
    var consentLabel = el("label", "chamundi-consent");
    consentLabel.htmlFor = consentId;
    var checkbox = el("input");
    checkbox.type = "checkbox";
    checkbox.id = consentId;
    var consentText = el(
      "span",
      null,
      "I consent to Sri Durga HariHara Enterprises contacting me about this enquiry."
    );
    consentLabel.appendChild(checkbox);
    consentLabel.appendChild(consentText);

    var submit = el("button", "chamundi-lead__submit", "Confirm and send →");
    submit.type = "button";
    submit.disabled = true;
    var status = el("p", "chamundi-lead__status", "");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("tabindex", "-1");

    checkbox.addEventListener("change", function () {
      submit.disabled = !checkbox.checked || card.submitted;
    });

    submit.addEventListener("click", function () {
      submitLead(card, box, status, submit, checkbox);
    });

    box.appendChild(consentLabel);
    box.appendChild(submit);
    box.appendChild(status);
    return box;
  }

  async function submitLead(card, box, status, button, checkbox) {
    if (card.submitted || !checkbox.checked) return;
    button.disabled = true;
    status.classList.remove("is-error", "is-success");
    status.textContent = "Sending your enquiry…";

    try {
      var response = await fetch(config.leadEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          token: card.token,
          consent: true,
          sessionId: state.sessionId
        })
      });
      var data = await readJson(response);
      if (!response.ok) {
        throw new ChatError(
          (data && data.error) || "lead_error",
          (data && data.message) || "The enquiry could not be sent.",
          response.status
        );
      }

      card.submitted = true;
      box.classList.add("is-submitted");
      var eyebrow = box.querySelector(".chamundi-lead__eyebrow");
      if (eyebrow) eyebrow.textContent = "TRADE ENQUIRY · SENT";
      status.textContent = THANK_YOU;
      status.classList.add("is-success");
      saveLeadCard();
      try {
        status.focus({ preventScroll: true });
      } catch (e) {
        /* Ignore. */
      }
      if (state.nearBottom) scrollToBottom(true);
    } catch (error) {
      if (
        error &&
        (error.status === 401 || error.code === "lead_token_expired" || error.code === "lead_token_invalid")
      ) {
        status.textContent = "This summary has expired. Please ask Chamundi to prepare it again.";
        status.classList.add("is-error");
        addRefreshSummaryButton(status);
      } else if (error && error.code === "consent_required") {
        status.textContent = "Please tick consent before sending.";
        status.classList.add("is-error");
        button.disabled = false;
      } else if (error && (error.code === "rate_limited" || error.status === 429)) {
        status.textContent = "Too many enquiries from this connection. Please try again later or use the contact details below.";
        status.classList.add("is-error");
      } else {
        status.textContent = "I could not send the enquiry just now. Please try again, or use the enquiry form below.";
        status.classList.add("is-error");
        button.disabled = false;
      }
    }
  }

  function addRefreshSummaryButton(status) {
    var button = el("button", "chamundi-lead__refresh", "Ask Chamundi to prepare it again →");
    button.type = "button";
    button.addEventListener("click", function () {
      button.remove();
      sendMessage("Please prepare my trade enquiry summary again.");
    });
    status.appendChild(document.createElement("br"));
    status.appendChild(button);
  }

  /* ============================================================
     Storage
     ============================================================ */

  function getSessionId() {
    try {
      var stored = window.sessionStorage.getItem(STORE_SESSION);
      if (stored && /^[A-Za-z0-9_-]{16,64}$/.test(stored)) return stored;
    } catch (e) {
      /* Ignore. */
    }
    var id = makeSessionId();
    try {
      window.sessionStorage.setItem(STORE_SESSION, id);
    } catch (e) {
      /* Ignore. */
    }
    return id;
  }

  function makeSessionId() {
    try {
      if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
      if (window.crypto && window.crypto.getRandomValues) {
        var bytes = new Uint8Array(18);
        window.crypto.getRandomValues(bytes);
        return Array.prototype.map
          .call(bytes, function (byte) {
            return byte.toString(16).padStart(2, "0");
          })
          .join("");
      }
    } catch (e) {
      /* Fall through. */
    }
    return "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 14);
  }

  function loadHistory() {
    try {
      var raw = window.sessionStorage.getItem(STORE_HISTORY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(function (message) {
          return (
            message &&
            (message.role === "user" || message.role === "assistant") &&
            typeof message.content === "string" &&
            message.content.trim()
          );
        })
        .slice(-MAX_HISTORY)
        .map(function (message) {
          return { role: message.role, content: message.content.slice(0, 4000) };
        });
    } catch (e) {
      return [];
    }
  }

  function saveHistory() {
    try {
      var trimmed = state.messages.slice(-MAX_HISTORY).map(function (message) {
        return { role: message.role, content: String(message.content).slice(0, 4000) };
      });
      window.sessionStorage.setItem(STORE_HISTORY, JSON.stringify(trimmed));
    } catch (e) {
      /* Storage is optional. */
    }
  }

  function loadPass() {
    try {
      var pass = window.sessionStorage.getItem(STORE_PASS);
      if (pass && tokenIsFresh(pass)) return pass;
    } catch (e) {
      /* Ignore. */
    }
    return null;
  }

  function savePass() {
    try {
      if (state.sessionPass) window.sessionStorage.setItem(STORE_PASS, state.sessionPass);
      else window.sessionStorage.removeItem(STORE_PASS);
    } catch (e) {
      /* Ignore. */
    }
  }

  function clearPass() {
    state.sessionPass = null;
    try {
      window.sessionStorage.removeItem(STORE_PASS);
    } catch (e) {
      /* Ignore. */
    }
  }

  function loadLeadCard() {
    try {
      var raw = window.sessionStorage.getItem(STORE_LEAD);
      if (!raw) return null;
      var card = JSON.parse(raw);
      if (!card || typeof card !== "object" || !card.draft || typeof card.draft !== "object") return null;
      if (!card.submitted && (!card.token || !tokenIsFresh(card.token))) return null;
      return card;
    } catch (e) {
      return null;
    }
  }

  function saveLeadCard() {
    try {
      if (state.leadCard) window.sessionStorage.setItem(STORE_LEAD, JSON.stringify(state.leadCard));
      else window.sessionStorage.removeItem(STORE_LEAD);
    } catch (e) {
      /* Ignore. */
    }
  }

  function tokenIsFresh(token) {
    var payload = readTokenPayload(token);
    if (!payload || typeof payload.exp !== "number") return false;
    return payload.exp * 1000 > Date.now() + 5000;
  }

  function readTokenPayload(token) {
    try {
      var part = String(token).split(".")[0];
      part = part.replace(/-/g, "+").replace(/_/g, "/");
      while (part.length % 4) part += "=";
      var binary = window.atob(part);
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) {
      return null;
    }
  }

  /* ============================================================
     Scrolling and utilities
     ============================================================ */

  function isNearBottom() {
    if (!ui.log) return true;
    return ui.log.scrollHeight - ui.log.scrollTop - ui.log.clientHeight < 64;
  }

  function scrollToBottom(smooth) {
    if (!ui.log) return;
    var behavior = smooth && !prefersReducedMotion() ? "smooth" : "auto";
    try {
      ui.log.scrollTo({ top: ui.log.scrollHeight, behavior: behavior });
    } catch (e) {
      ui.log.scrollTop = ui.log.scrollHeight;
    }
    state.nearBottom = true;
  }

  function updateJumpButton() {
    if (!ui.jump) return;
    var hasOverflow = ui.log.scrollHeight > ui.log.clientHeight + 4;
    ui.jump.hidden = !hasOverflow || isNearBottom();
  }

  function prefersReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  async function readJson(response) {
    try {
      return await response.json();
    } catch (e) {
      return null;
    }
  }

  function ChatError(code, message, status) {
    this.name = "ChatError";
    this.code = code;
    this.message = message;
    this.status = status;
    if (Error.captureStackTrace) Error.captureStackTrace(this, ChatError);
  }
  ChatError.prototype = Object.create(Error.prototype);
  ChatError.prototype.constructor = ChatError;
})();
