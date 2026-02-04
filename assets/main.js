(() => {
  const header = document.querySelector("[data-header]");
  const menuBtn = document.querySelector("[data-menu-btn]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  const safeStorage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
  };

  const setCookie = (name, value, maxAgeSeconds) => {
    const maxAge = typeof maxAgeSeconds === "number" ? `; max-age=${maxAgeSeconds}` : "";
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${maxAge}; path=/; samesite=lax`;
  };

  const getCookie = (name) => {
    const encoded = encodeURIComponent(name) + "=";
    const parts = document.cookie.split(";").map((p) => p.trim());
    for (const part of parts) {
      if (part.startsWith(encoded)) return decodeURIComponent(part.slice(encoded.length));
    }
    return null;
  };

  const setHeaderOffset = () => {
    if (!header) return;
    const height = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--header-h", `${height}px`);
  };

  const closeMobileNav = () => {
    if (!mobileNav || !menuBtn) return;
    mobileNav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
  };

  const toggleMobileNav = () => {
    if (!mobileNav || !menuBtn) return;
    const isOpen = mobileNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  if (menuBtn) menuBtn.addEventListener("click", toggleMobileNav);
  if (mobileNav) {
    mobileNav.addEventListener("click", (e) => {
      const target = e.target;
      if (target instanceof HTMLAnchorElement) closeMobileNav();
    });
  }

  window.addEventListener("resize", () => {
    setHeaderOffset();
    if (window.matchMedia("(min-width: 900px)").matches) closeMobileNav();
  });
  window.addEventListener("load", setHeaderOffset);
  setHeaderOffset();

  // Cookie consent banner (lightweight, phone-first)
  const CONSENT_KEY = "cookie_consent_v1";
  const consent = safeStorage.get(CONSENT_KEY) || getCookie(CONSENT_KEY);

  const ensureCookieBanner = () => {
    let banner = document.querySelector("[data-cookie-banner]");
    if (!banner) {
      banner = document.createElement("div");
      banner.className = "cookie-banner";
      banner.hidden = true;
      banner.setAttribute("data-cookie-banner", "");
      banner.setAttribute("role", "dialog");
      banner.setAttribute("aria-modal", "false");
      banner.setAttribute("aria-label", "Cookie preferences");
      banner.innerHTML = `
        <div class="container">
          <div class="cookie-banner-inner">
            <div>
              <p class="cookie-title">Cookies</p>
              <p class="cookie-desc">
                We use cookies to understand site usage and improve performance. You can accept or decline.
                Read our <a href="cookie-policy.html">Cookie Policy</a>.
              </p>
            </div>
            <div class="cookie-actions" aria-label="Cookie actions">
              <button class="btn btn-outline-light" type="button" data-cookie-decline>Decline</button>
              <button class="btn btn-danger" type="button" data-cookie-accept>Accept</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(banner);
    }

    const acceptBtn = banner.querySelector("[data-cookie-accept]");
    const declineBtn = banner.querySelector("[data-cookie-decline]");

    const setConsent = (value) => {
      safeStorage.set(CONSENT_KEY, value);
      setCookie(CONSENT_KEY, value, 60 * 60 * 24 * 365);
      banner.hidden = true;
    };

    acceptBtn?.addEventListener("click", () => setConsent("accepted"));
    declineBtn?.addEventListener("click", () => setConsent("declined"));

    return banner;
  };

  if (!consent) {
    const banner = ensureCookieBanner();
    banner.hidden = false;
  }

  // Contact form: keep it simple + phone-first.
  const form = document.querySelector("[data-appointment-form]");
  const statusEl = document.querySelector("[data-form-status]");
  if (form && statusEl) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const appliance = String(data.get("appliance") || "").trim();
      const issue = String(data.get("issue") || "").trim();

      if (!name || !phone || !appliance || !issue) {
        statusEl.textContent = "Please complete the required fields. For the fastest help, tap Call Now.";
        statusEl.hidden = false;
        return;
      }

      statusEl.innerHTML = `Request received. For the fastest scheduling, please call <a href="tel:+15551234567">(555) 123-4567</a>.`;
      statusEl.hidden = false;
      form.reset();
    });
  }
})();
