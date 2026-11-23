/**
 * A & A Venture – script.js
 * Forms use hidden-iframe submission (no fetch, no CORS issues).
 * Both candidate and employer forms submit natively into a hidden
 * iframe; the iframe load event triggers the success/error UI.
 */

/* ============================================================
   MOBILE NAV TOGGLE
   ============================================================ */
(function () {
  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();


/* ============================================================
   VALIDATION HELPERS
   ============================================================ */

function isValidPhone(value) {
  return /^[+\d][\d\s\-(). ]{5,19}$/.test(value.trim());
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function setFieldError(errId, msg) {
  var el = document.getElementById(errId);
  if (!el) return;
  el.textContent = msg;
  var input = el.previousElementSibling;
  if (input) {
    msg ? input.setAttribute('aria-invalid', 'true')
        : input.removeAttribute('aria-invalid');
  }
}

function setStatus(el, type, message) {
  el.className = 'form-status';
  if (type) {
    el.classList.add(type);
    el.textContent = message;
  } else {
    el.textContent = '';
  }
}

function setLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn.classList.add('loading');
  } else {
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}


/* ============================================================
   HIDDEN-IFRAME SUBMISSION HELPER
   The form's target attribute points to a hidden <iframe>.
   FormSubmit processes the POST and loads its response inside
   the iframe. The iframe "load" event fires when it is done.
   This avoids CORS entirely and is much faster than fetch().
   ============================================================ */

/**
 * Wire up a form for hidden-iframe submission.
 *
 * @param {string} formId       – id of the <form>
 * @param {string} iframeId     – id of the hidden <iframe>
 * @param {string} btnId        – id of the submit button
 * @param {string} statusId     – id of the .form-status div
 * @param {Function} validateFn – returns true if valid, sets errors if not
 * @param {string} successMsg   – message shown on success
 */
function wireIframeForm(formId, iframeId, btnId, statusId, validateFn, successMsg) {
  var form   = document.getElementById(formId);
  var iframe = document.getElementById(iframeId);
  var btn    = document.getElementById(btnId);
  var status = document.getElementById(statusId);

  if (!form || !iframe || !btn || !status) return;

  // Track whether the form has been submitted (ignore first blank load)
  var submitted = false;

  // Listen for the iframe to finish loading (= FormSubmit responded)
  iframe.addEventListener('load', function () {
    if (!submitted) return;          // initial empty load – ignore
    submitted = false;

    setLoading(btn, false);
    setStatus(status, 'success', successMsg);
    form.reset();

    status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Re-enable button after a short cooldown to prevent double-submit
    setTimeout(function () { btn.disabled = false; }, 4000);
  });

  form.addEventListener('submit', function (e) {
    // Run custom validation; stop if invalid
    if (!validateFn()) {
      e.preventDefault();
      return;
    }

    // All good – let the form submit natively into the hidden iframe
    submitted = true;
    setLoading(btn, true);
    setStatus(status, '', '');
    // Do NOT call e.preventDefault() – the native submit goes to iframe.target
  });
}


/* ============================================================
   CANDIDATE REGISTRATION FORM
   ============================================================ */
wireIframeForm(
  'candidateForm',
  'iframe-candidate',
  'c-submit',
  'c-status',
  function validateCandidate() {
    var valid = true;

    var name  = document.getElementById('c-name');
    var phone = document.getElementById('c-phone');
    var email = document.getElementById('c-email');

    if (!name || !name.value.trim()) {
      setFieldError('c-name-err', 'Full name is required.');
      valid = false;
    } else {
      setFieldError('c-name-err', '');
    }

    if (!phone || !phone.value.trim()) {
      setFieldError('c-phone-err', 'Phone number is required.');
      valid = false;
    } else if (!isValidPhone(phone.value)) {
      setFieldError('c-phone-err', 'Please enter a valid phone number.');
      valid = false;
    } else {
      setFieldError('c-phone-err', '');
    }

    if (!email || !email.value.trim()) {
      setFieldError('c-email-err', 'Email address is required.');
      valid = false;
    } else if (!isValidEmail(email.value)) {
      setFieldError('c-email-err', 'Please enter a valid email address.');
      valid = false;
    } else {
      setFieldError('c-email-err', '');
      // Set reply-to hidden field
      var rt = document.getElementById('c-replyto');
      if (rt) rt.value = email.value.trim();
    }

    return valid;
  },
  '✅ Thank you! Your candidate registration has been received. We will review your profile and be in touch soon.'
);


/* ============================================================
   EMPLOYER HIRING ENQUIRY FORM
   ============================================================ */
wireIframeForm(
  'employerForm',
  'iframe-employer',
  'e-submit',
  'e-status',
  function validateEmployer() {
    var valid = true;

    var company = document.getElementById('e-company');
    var contact = document.getElementById('e-contact');
    var phone   = document.getElementById('e-phone');
    var email   = document.getElementById('e-email');

    if (!company || !company.value.trim()) {
      setFieldError('e-company-err', 'Company name is required.');
      valid = false;
    } else {
      setFieldError('e-company-err', '');
    }

    if (!contact || !contact.value.trim()) {
      setFieldError('e-contact-err', 'Contact person name is required.');
      valid = false;
    } else {
      setFieldError('e-contact-err', '');
    }

    if (!phone || !phone.value.trim()) {
      setFieldError('e-phone-err', 'Phone number is required.');
      valid = false;
    } else if (!isValidPhone(phone.value)) {
      setFieldError('e-phone-err', 'Please enter a valid phone number.');
      valid = false;
    } else {
      setFieldError('e-phone-err', '');
    }

    if (!email || !email.value.trim()) {
      setFieldError('e-email-err', 'Work email is required.');
      valid = false;
    } else if (!isValidEmail(email.value)) {
      setFieldError('e-email-err', 'Please enter a valid email address.');
      valid = false;
    } else {
      setFieldError('e-email-err', '');
      // Set reply-to hidden field
      var rt = document.getElementById('e-replyto');
      if (rt) rt.value = email.value.trim();
    }

    return valid;
  },
  '✅ Thank you! Your hiring enquiry has been received. Our team will review your requirements and contact you shortly.'
);


/* ============================================================
   AUTO COPYRIGHT YEAR
   ============================================================ */
(function () {
  var el = document.getElementById('copy-year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ============================================================
   SMOOTH-SCROLL (polyfill for older Safari / iOS)
   ============================================================ */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id     = this.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', '#' + id);
    });
  });
})();
