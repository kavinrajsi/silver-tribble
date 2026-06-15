console.log('\'Allo \'Allo!');

// Apply form validation + submission
(function () {
  var EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var MOBILE_RE = /^[6-9]\d{9}$/; // Indian 10-digit mobile
  var PINCODE_RE = /^\d{6}$/;     // Indian 6-digit pincode

  // Each field validates a value and returns an error message ('' = valid).
  var fields = [
    {
      id: 'apply-name', errorId: 'apply-name-error',
      validate: function (v) {
        if (v === '') return 'Please enter your name.';
        if (v.length < 2) return 'Name must be at least 2 characters.';
        if (!/^[a-zA-Z][a-zA-Z .'-]*$/.test(v)) return 'Please enter a valid name.';
        return '';
      }
    },
    {
      id: 'apply-mobile', errorId: 'apply-mobile-error',
      validate: function (v) {
        if (v === '') return 'Please enter your mobile number.';
        if (!MOBILE_RE.test(v)) return 'Please enter a valid 10-digit mobile number.';
        return '';
      }
    },
    {
      id: 'apply-email', errorId: 'apply-email-error',
      validate: function (v) {
        if (v === '') return 'Please enter your email address.';
        if (!EMAIL_RE.test(v)) return 'Please enter a valid email address.';
        return '';
      }
    },
    {
      id: 'apply-city', errorId: 'apply-city-error',
      validate: function (v) {
        if (v === '') return 'Please enter your city.';
        if (!/^[a-zA-Z][a-zA-Z .'-]*$/.test(v)) return 'Please enter a valid city name.';
        return '';
      }
    },
    {
      id: 'apply-pincode', errorId: 'apply-pincode-error',
      validate: function (v) {
        if (v === '') return 'Please enter your pincode.';
        if (!PINCODE_RE.test(v)) return 'Please enter a valid 6-digit pincode.';
        return '';
      }
    },
    {
      id: 'apply-consent', errorId: 'apply-consent-error',
      validate: function (v, el) {
        if (el && !el.checked) return 'Please provide your consent to proceed.';
        return '';
      }
    }
  ];

  function variant(el) {
    return el.tagName === 'SELECT' ? 'select' : el.tagName === 'TEXTAREA' ? 'textarea' : 'input';
  }

  function showError(field, message) {
    var el = document.getElementById(field.id);
    var err = document.getElementById(field.errorId);
    if (err) {
      err.textContent = message;
      err.classList.add('apply-form__error--visible');
    }
    if (el) el.classList.add('apply-form__' + variant(el) + '--error');
  }

  function clearError(field) {
    var el = document.getElementById(field.id);
    var err = document.getElementById(field.errorId);
    if (err) {
      err.textContent = '';
      err.classList.remove('apply-form__error--visible');
    }
    if (el) el.classList.remove('apply-form__input--error', 'apply-form__select--error', 'apply-form__textarea--error');
  }

  // Runs a field's validator, toggles its error UI, returns true when valid.
  function checkField(field) {
    var el = document.getElementById(field.id);
    if (!el) return true;
    var message = field.validate(el.value.trim(), el);
    if (message) { showError(field, message); return false; }
    clearError(field);
    return true;
  }

  fields.forEach(function (field) {
    var el = document.getElementById(field.id);
    if (!el) return;
    var evt = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'blur';
    el.addEventListener(evt, function () { checkField(field); });
    el.addEventListener('input', function () {
      if (!field.validate(el.value.trim(), el)) clearError(field);
    });
  });

  // City: allow letters, spaces and basic name punctuation only.
  var cityEl = document.getElementById('apply-city');
  if (cityEl) {
    cityEl.addEventListener('input', function () {
      var cleaned = cityEl.value.replace(/[^a-zA-Z .'-]/g, '');
      if (cleaned !== cityEl.value) cityEl.value = cleaned;
    });
  }

  var form = document.getElementById('apply-form');
  if (!form) return;

  var statusEl = document.getElementById('apply-form-status');
  var submitBtn = form.querySelector('.apply-form__submit');

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle('apply-form__status--error', !!isError);
    statusEl.classList.toggle('apply-form__status--success', !isError && message !== '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setStatus('', false);

    // Validate every field; collect overall validity.
    var valid = true;
    fields.forEach(function (field) {
      if (!checkField(field)) valid = false;
    });
    if (!valid) {
      setStatus('Please correct the highlighted fields and try again.', true);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.label = submitBtn.textContent;
      submitBtn.textContent = 'Submitting…';
    }

    fetch(form.getAttribute('action'), {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        if (result.ok && result.data && result.data.success) {
          setStatus(result.data.message || 'Thank you! Your application has been submitted.', false);
          form.reset();
          fields.forEach(clearError);
        } else {
          // Surface per-field errors returned by the server, if any.
          if (result.data && result.data.errors) {
            fields.forEach(function (field) {
              var key = field.id.replace('apply-', '');
              if (result.data.errors[key]) showError(field, result.data.errors[key]);
            });
          }
          setStatus((result.data && result.data.message) || 'Something went wrong. Please try again.', true);
        }
      })
      .catch(function () {
        setStatus('Unable to submit right now. Please try again later.', true);
      })
      .then(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.label || 'Submit';
        }
      });
  });
}());

// FAQ accordion
document.querySelectorAll('.faq-item__question').forEach(function(button) {
  button.addEventListener('click', function() {
    var item = this.closest('.faq-item');
    var isOpen = item.classList.contains('faq-item--open');

    // Close all
    document.querySelectorAll('.faq-item').forEach(function(el) {
      el.classList.remove('faq-item--open');
      el.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
    });

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('faq-item--open');
      this.setAttribute('aria-expanded', 'true');
    }
  });
});

