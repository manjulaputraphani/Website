/* ============================================================
   Chamundi · coffee trade desk assistant
   Sri Durga HariHara Enterprises, Bengaluru
   Plain JavaScript. No dependencies. Theme-aware.
   ============================================================ */

(function () {
  "use strict";

  if (window.__chamundiLoaded) return;
  window.__chamundiLoaded = true;

  var GREETING = "Namaskara. I'm Chamundi from Sri Durga HariHara Enterprises. Looking for green or roasted coffee?";
  var THANK_YOU = "Thank you. Our team will reply within one business day.";
  var MAX_INPUT = 2000;
  var MAX_HISTORY = 40;
  var STORE_HISTORY = "chamundi.history.v1";
  var STORE_SESSION = "chamundi.session.v1";
  var STORE_PASS = "chamundi.pass.v1";
  var STORE_LEAD = "chamundi.lead.v1";

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
    Object.keys(attrs).forEach(function (key) {
      node.setAttribute(key, attrs[key]);
    });
    return node;
  }

  function trishulIcon() {
    var svg = svgEl("svg", {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.4",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
      focusable: "false"
    });
    [
      "M12 3.2v18",
      "M7.2 6.7V3.6",
      "M12 6.7V2.8",
      "M16.8 6.7V3.6",
      "M4.8 6.7c0 4.2 3.2 6.5 7.2 6.5s7.2-2.3 7.2-6.5",
      "M8.6 21.2h6.8"
    ].forEach(function (d) {
      svg.appendChild(svgEl("path", { d: d }));
    });
    return svg;
  }

  function buildUI() {
    var root = el("div", "chamundi-root");
    var panel = el("section", "chamundi-panel");
    panel.id = "chamundi-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "chamundi-title");
    panel.hidden = true;

    var header = el("header", "chamundi-header");
    var brand = el("div", "chamundi-brand");
    var seal = el("span", "chamundi-brand__seal", "SDH");
    seal.setAttribute("aria-hidden", "true");
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
    brandText.appendChild(title);
    brandText.appendChild(status);
    brand.appendChild(seal);
    brand.appendChild(brandText);

    var close = el("button", "chamundi-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close Chamundi chat");
    close.setAttribute("title", "Close");

    header.appendChild(brand);
    header.appendChild(close);

    var log = el("div", "chamundi-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");
    log.setAttribute("aria-relevant", "additions text");
    log.setAttribute("aria-label", "Conversation with Chamundi");
    log.setAttribute("tabindex", "0");

    var typing = el("div", "chamundi-typing");
    typing.hidden = true;
    typing.setAttribute("role", "status");
    for (var i = 0; i < 3; i += 1) {
      var dot = el("span", "chamundi-typing__dot");
      dot.setAttribute("aria-hidden", "true");
      typing.appendChild(dot);
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
    panel.appendChild(log);
    panel.appendChild(jump);
    panel.appendChild(compose);
    panel.appendChild(footer);

    log.appendChild(typing);

    var launcher = el("button", "chamundi-launcher");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Ask Chamundi, the coffee trade desk assistant");
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "chamundi-panel");
    var mark = el("span", "chamundi-launcher__mark", "SDH");
    mark.setAttribute("aria-hidden", "true");
    var trishul = trishulIcon();
    trishul.classList.add("chamundi-launcher__trishul");
    var label = el("span", "chamundi-launcher__label", "Ask Chamundi");
    launcher.appendChild(mark);
    launcher.appendChild(trishul);
    launcher.appendChild(label);

    root.appendChild(launcher);
    root.appendChild(panel);
    document.body.appendChild(root);

    ui = {
      root: root,
      launcher: launcher,
      panel: panel,
      close: close,
      log: log,
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
      chips: null,
      leadCardEl: null
    };
  }

  /* ============================================================
     Events
     ============================================================ */

  function wireEvents() {
    ui.launcher.addEventListener("click", openPanel);
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
    var bubble = el("div", "chamundi-bubble");
    bubble.setAttribute("dir", "auto");
    wrap.appendChild(bubble);
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
    var prompts = ["Request samples", "Compare origins", "Export terms", "Get a quote"];
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
