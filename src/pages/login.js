// ================================
// ExamPrep — Login Page
// ================================

import { Store } from '../data/store.js';
import { showToast } from '../utils/helpers.js';

export function renderLogin(container) {
  container.innerHTML = `
    <div class="login-page page-enter">
      <div class="login-container">
        <div class="login-header">
          <div class="login-logo">📝</div>
          <h1>ExamPrep</h1>
          <p class="text-muted">NEET & KCET 2026 Practice Platform</p>
        </div>

        <div class="tabs" id="role-tabs">
          <button class="tab active" data-role="student">Student</button>
          <button class="tab" data-role="parent">Parent</button>
          <button class="tab" data-role="admin">Admin</button>
        </div>

        <form id="login-form" class="login-form">
          <div class="form-group">
            <label class="form-label" for="login-username">Username</label>
            <input class="form-input" type="text" id="login-username" placeholder="Enter username" required autocomplete="username">
          </div>
          <div class="form-group">
            <label class="form-label" for="login-password">Password</label>
            <input class="form-input" type="password" id="login-password" placeholder="Enter password" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary btn-lg" id="login-btn" style="width: 100%;">
            Sign In →
          </button>
        </form>

        <div class="login-hint">
          <p class="text-xs text-muted">Contact your admin for login credentials</p>
        </div>
      </div>
    </div>

    <style>
      .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
      }
      .login-container {
        width: 100%;
        max-width: 420px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: 2.5rem;
        backdrop-filter: blur(20px);
        box-shadow: var(--shadow-lg);
      }
      .login-header {
        text-align: center;
        margin-bottom: 2rem;
      }
      .login-logo {
        font-size: 3rem;
        margin-bottom: 0.75rem;
      }
      .login-header h1 {
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 2rem;
        margin-bottom: 0.25rem;
      }
      .login-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        margin-top: 1.5rem;
      }
      .login-hint {
        text-align: center;
        margin-top: 1.25rem;
      }
    </style>
  `;

  let selectedRole = 'student';

  // Tab switching
  document.querySelectorAll('#role-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#role-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedRole = tab.dataset.role;
    });
  });

  // Login form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const btn = document.getElementById('login-btn');

    if (!username || !password) {
      showToast('Please fill all fields', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Signing in...';

    try {
      const user = await Store.authenticate(username, password);
      
      if (!user) {
        showToast('Invalid username or password', 'error');
        btn.disabled = false;
        btn.textContent = 'Sign In →';
        return;
      }

      if (user.role !== selectedRole) {
        showToast(`This account is not a ${selectedRole} account`, 'error');
        btn.disabled = false;
        btn.textContent = 'Sign In →';
        return;
      }

      Store.setSession(user);
      showToast(`Welcome, ${user.name}!`, 'success');

      // Redirect based on role
      setTimeout(() => {
        if (user.role === 'student') {
          window.location.hash = '#/student/dashboard';
        } else if (user.role === 'parent') {
          window.location.hash = '#/parent/dashboard';
        } else if (user.role === 'admin') {
          window.location.hash = '#/admin/questions';
        }
      }, 300);

    } catch (err) {
      showToast('Login failed. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = 'Sign In →';
      console.error(err);
    }
  });
}
