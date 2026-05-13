(function () {
  var ANALYTICS_ID = "G-QE6SZD4J75";
  var CONSENT_KEY = "entech_analytics_consent";
  var ACCEPTED = "accepted";
  var DECLINED = "declined";
  var memoryConsent = null;

  function getConsent() {
    try {
      return window.localStorage.getItem(CONSENT_KEY) || memoryConsent;
    } catch (error) {
      return memoryConsent;
    }
  }

  function setConsent(value) {
    memoryConsent = value;

    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {
      // If storage is unavailable, apply the choice for this page view only.
    }
  }

  function hasAnalyticsConsent() {
    return getConsent() === ACCEPTED;
  }

  function ensureGtagQueue() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
  }

  function loadAnalytics() {
    window["ga-disable-" + ANALYTICS_ID] = false;
    ensureGtagQueue();

    if (window.__entechAnalyticsLoaded) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
      return;
    }

    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("config", ANALYTICS_ID, {
      transport_type: "beacon"
    });

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ANALYTICS_ID);
    document.head.appendChild(script);

    window.__entechAnalyticsLoaded = true;
  }

  function deleteCookie(name, domain) {
    var cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    if (domain) {
      cookie += "; domain=" + domain;
    }
    document.cookie = cookie + "; SameSite=Lax";
  }

  function deleteAnalyticsCookies() {
    var host = window.location.hostname;
    var domains = [""];
    var hostParts = host.split(".");

    if (host) {
      domains.push(host, "." + host);
    }

    if (hostParts.length > 2) {
      domains.push("." + hostParts.slice(-2).join("."));
    }

    document.cookie.split(";").forEach(function (cookie) {
      var name = cookie.split("=")[0].trim();
      if (name.indexOf("_ga") === 0 || name.indexOf("_gid") === 0 || name.indexOf("_gat") === 0) {
        domains.forEach(function (domain) {
          deleteCookie(name, domain);
        });
      }
    });
  }

  function disableAnalytics() {
    window["ga-disable-" + ANALYTICS_ID] = true;

    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
    }

    deleteAnalyticsCookies();
  }

  function updateBannerStatus(banner) {
    var status = banner.querySelector("[data-consent-status]");
    var currentConsent = getConsent();

    if (!status) {
      return;
    }

    if (currentConsent === ACCEPTED) {
      status.textContent = "Aktuell: Analytics aktiviert.";
    } else if (currentConsent === DECLINED) {
      status.textContent = "Aktuell: Analytics deaktiviert.";
    } else {
      status.textContent = "Bitte treffen Sie eine Auswahl.";
    }
  }

  function getPrivacyLink() {
    return window.location.pathname.endsWith("datenschutz.html")
      ? "#google-analytics"
      : "datenschutz.html#google-analytics";
  }

  function getOrCreateBanner() {
    var existingBanner = document.querySelector("[data-consent-banner]");

    if (existingBanner) {
      updateBannerStatus(existingBanner);
      return existingBanner;
    }

    var banner = document.createElement("div");
    banner.className = "consent-banner";
    banner.setAttribute("data-consent-banner", "");
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie-Einstellungen");
    banner.innerHTML =
      '<div class="consent-copy">' +
      '<h2>Datenschutz-Einstellungen</h2>' +
      '<p>Wir verwenden Google Analytics nur mit Ihrer Zustimmung, um Seitenaufrufe und Klicks auf den Start-Check auszuwerten. Ohne Zustimmung wird das Google-Tag nicht geladen.</p>' +
      '<p class="consent-status" data-consent-status></p>' +
      '<a href="' + getPrivacyLink() + '">Mehr in der Datenschutzerkl&auml;rung</a>' +
      '</div>' +
      '<div class="consent-actions">' +
      '<button type="button" class="consent-btn consent-btn-secondary" data-consent-choice="' + DECLINED + '">Ablehnen</button>' +
      '<button type="button" class="consent-btn consent-btn-primary" data-consent-choice="' + ACCEPTED + '">Akzeptieren</button>' +
      '</div>';

    banner.querySelectorAll("[data-consent-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        var choice = button.getAttribute("data-consent-choice");
        setConsent(choice);

        if (choice === ACCEPTED) {
          loadAnalytics();
        } else {
          disableAnalytics();
        }

        banner.hidden = true;
        updateBannerStatus(banner);
      });
    });

    document.body.appendChild(banner);
    updateBannerStatus(banner);
    return banner;
  }

  function showConsentBanner() {
    var banner = getOrCreateBanner();
    banner.hidden = false;
    updateBannerStatus(banner);
  }

  function setupConsentControls() {
    document.querySelectorAll("[data-open-consent]").forEach(function (control) {
      control.addEventListener("click", function (event) {
        event.preventDefault();
        showConsentBanner();
      });
    });
  }

  function trackStartCheckClick(link) {
    if (!hasAnalyticsConsent()) {
      return;
    }

    loadAnalytics();

    if (typeof window.gtag === "function") {
      window.gtag("event", "start_check_click", {
        event_category: "CTA",
        event_label: "Start Check",
        link_url: link.href,
        transport_type: "beacon"
      });
    }
  }

  function setupCtaTracking() {
    document.querySelectorAll('a[href*="streamlit.app"]').forEach(function (link) {
      link.addEventListener("click", function () {
        trackStartCheckClick(link);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupConsentControls();
    setupCtaTracking();

    if (hasAnalyticsConsent()) {
      loadAnalytics();
    } else if (!getConsent()) {
      showConsentBanner();
    } else {
      disableAnalytics();
    }
  });
})();
