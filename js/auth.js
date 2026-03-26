/* ==========================================================================
   Boxel Studio Quoting Agent — Auth Page Logic (Prototype)
   No real authentication — clicking Sign In enters the app directly.
   ========================================================================== */

let resetEmail = '';

document.addEventListener('DOMContentLoaded', () => {
  Store.init();

  // If already authenticated, redirect to main page
  if (Store.isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  // Login form handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

/* ---- View Switching ---- */

function showView(viewName) {
  const container = document.getElementById('auth-view');

  if (viewName === 'login') {
    location.reload();
    return;
  }

  if (viewName === 'forgot-step1') {
    const tpl = document.getElementById('tpl-forgot-step1');
    container.innerHTML = '';
    container.appendChild(tpl.content.cloneNode(true));
    const form = document.getElementById('forgot-form');
    if (form) form.addEventListener('submit', handleForgotSubmit);
    return;
  }

  if (viewName === 'forgot-step2') {
    const tpl = document.getElementById('tpl-forgot-step2');
    container.innerHTML = '';
    container.appendChild(tpl.content.cloneNode(true));
    const maskedEl = document.getElementById('masked-email');
    if (maskedEl && resetEmail) maskedEl.textContent = maskEmail(resetEmail);
    return;
  }

  if (viewName === 'reset-password') {
    const tpl = document.getElementById('tpl-reset-password');
    container.innerHTML = '';
    container.appendChild(tpl.content.cloneNode(true));
    initResetForm();
    return;
  }
}

/* ---- Login (Prototype: always succeeds) ---- */

function handleLogin(e) {
  e.preventDefault();
  // Prototype — create a mock session directly, no validation
  const session = {
    userId: 'user-proto',
    email: 'specialist@boxelstudio.com',
    name: 'VFX Specialist',
    role: 'specialist',
    loggedInAt: new Date().toISOString()
  };
  localStorage.setItem('boxel_session', JSON.stringify(session));
  window.location.href = 'index.html';
}

/* ---- Forgot Password ---- */

function handleForgotSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim();
  if (!email) return;
  resetEmail = email;
  showView('forgot-step2');
}

function handleResend() {
  showToast('Reset link resent to ' + maskEmail(resetEmail), 'info');
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const masked = local[0] + '*'.repeat(Math.max(local.length - 2, 3)) + local[local.length - 1];
  return masked + '@' + domain;
}

/* ---- Reset Password (Prototype demo) ---- */

function initResetForm() {
  const passwordInput = document.getElementById('reset-password');
  const confirmInput = document.getElementById('reset-confirm');
  const form = document.getElementById('reset-form');
  const feedback = document.getElementById('reset-feedback');

  passwordInput.addEventListener('input', () => {
    feedback.style.display = 'flex';
    validatePassword(passwordInput.value, 'reset');
    if (confirmInput.value) validateMatch('reset');
  });

  confirmInput.addEventListener('input', () => {
    validateMatch('reset');
  });

  form.addEventListener('submit', handleResetSubmit);
}

function validatePassword(password, prefix) {
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const rulesList = document.getElementById(prefix + '-rules');
  if (rulesList) {
    rulesList.querySelectorAll('.password-rule').forEach(li => {
      const rule = li.dataset.rule;
      li.classList.toggle('met', rules[rule]);
    });
  }

  const passed = Object.values(rules).filter(Boolean).length;
  const levels = ['weak', 'fair', 'medium', 'strong'];
  const labels = ['WEAK', 'FAIR', 'MEDIUM', 'STRONG'];
  const level = password.length === 0 ? -1 : Math.max(0, passed - 1);

  const fill = document.getElementById(prefix + '-strength-fill');
  const levelEl = document.getElementById(prefix + '-strength-level');

  if (level >= 0) {
    fill.setAttribute('data-strength', levels[level]);
    levelEl.textContent = labels[level];
    levelEl.style.color = getStrengthColor(levels[level]);
  }

  updateResetButton(prefix);
  return rules;
}

function validateMatch(prefix) {
  const password = document.getElementById(prefix + '-password').value;
  const confirm = document.getElementById(prefix + '-confirm').value;
  const matchEl = document.getElementById(prefix + '-match');

  if (!confirm) {
    matchEl.style.display = 'none';
    updateResetButton(prefix);
    return;
  }

  matchEl.style.display = 'block';
  if (password === confirm) {
    matchEl.textContent = '✓ Passwords match';
    matchEl.className = 'password-match match';
  } else {
    matchEl.textContent = '✗ Passwords do not match';
    matchEl.className = 'password-match no-match';
  }

  updateResetButton(prefix);
}

function updateResetButton(prefix) {
  const password = document.getElementById(prefix + '-password').value;
  const confirm = document.getElementById(prefix + '-confirm').value;
  const btn = document.getElementById(prefix + '-submit');
  if (!btn) return;

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const allRulesPass = Object.values(rules).every(Boolean);
  const passwordsMatch = password === confirm && confirm.length > 0;
  btn.disabled = !(allRulesPass && passwordsMatch);
}

function getStrengthColor(level) {
  const colors = { weak: '#E85A4F', fair: '#FFB547', medium: '#C8A951', strong: '#32D583' };
  return colors[level] || '#4A4A55';
}

function handleResetSubmit(e) {
  e.preventDefault();
  showToast('Password reset successfully. Please sign in.', 'success');
  setTimeout(() => showView('login'), 1500);
}

/* ---- Password Toggle ---- */

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  const eyeOpen = btn.querySelector('.eye-open');
  const eyeClosed = btn.querySelector('.eye-closed');

  if (input.type === 'password') {
    input.type = 'text';
    eyeOpen.style.display = 'none';
    eyeClosed.style.display = 'block';
  } else {
    input.type = 'password';
    eyeOpen.style.display = 'block';
    eyeClosed.style.display = 'none';
  }
}
