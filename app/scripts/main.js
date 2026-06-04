console.log('\'Allo \'Allo!');

// Apply form validation
(function () {
  var fields = [
    { id: 'apply-name',    errorId: 'apply-name-error',    message: 'Please enter your name.' },
    { id: 'apply-mobile',  errorId: 'apply-mobile-error',  message: 'Please enter your mobile number.' },
    { id: 'apply-email',   errorId: 'apply-email-error',   message: 'Please enter a valid email address.' },
    { id: 'apply-city',    errorId: 'apply-city-error',    message: 'Please select a city.' },
    { id: 'apply-pincode', errorId: 'apply-pincode-error', message: 'Please enter your pincode.' }
  ];

  function showError(field) {
    var el = document.getElementById(field.id);
    var err = document.getElementById(field.errorId);
    if (!el || !err) return;
    err.textContent = field.message;
    err.classList.add('apply-form__error--visible');
    el.classList.add('apply-form__' + (el.tagName === 'SELECT' ? 'select' : el.tagName === 'TEXTAREA' ? 'textarea' : 'input') + '--error');
  }

  function clearError(field) {
    var el = document.getElementById(field.id);
    var err = document.getElementById(field.errorId);
    if (!el || !err) return;
    err.textContent = '';
    err.classList.remove('apply-form__error--visible');
    el.classList.remove('apply-form__input--error', 'apply-form__select--error', 'apply-form__textarea--error');
  }

  function isValid(field) {
    var el = document.getElementById(field.id);
    if (!el) return true;
    if (el.type === 'email') return el.value.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
    return el.value.trim() !== '';
  }

  fields.forEach(function (field) {
    var el = document.getElementById(field.id);
    if (!el) return;
    el.addEventListener('blur', function () {
      if (!isValid(field)) showError(field);
      else clearError(field);
    });
    el.addEventListener('input', function () {
      if (isValid(field)) clearError(field);
    });
  });

  var form = document.querySelector('.apply-form__fields');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hasError = false;
      fields.forEach(function (field) {
        if (!isValid(field)) { showError(field); hasError = true; }
        else clearError(field);
      });
      if (!hasError) form.submit();
    });
  }
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

