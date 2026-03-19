// ================================
// ExamPrep — App Router
// ================================

import { Store } from './data/store.js';
import { renderLogin } from './pages/login.js';
import { renderStudentDashboard } from './pages/student/dashboard.js';
import { renderTest, cleanupTest } from './pages/student/test.js';
import { renderResults } from './pages/student/results.js';
import { renderParentDashboard } from './pages/parent/dashboard.js';
import { renderAdminQuestions } from './pages/admin/questions.js';

const app = document.getElementById('app');

// Route definitions
const routes = {
  '#/login': { render: renderLogin, auth: false },
  '#/student/dashboard': { render: renderStudentDashboard, auth: true, role: 'student' },
  '#/student/test': { render: renderTest, auth: true, role: 'student' },
  '#/student/results': { render: renderResults, auth: true, role: 'student' },
  '#/parent/dashboard': { render: renderParentDashboard, auth: true, role: 'parent' },
  '#/admin/questions': { render: renderAdminQuestions, auth: true, role: 'admin' },
};

let currentRoute = '';

// Router
async function navigate() {
  const hash = window.location.hash || '#/login';
  const route = routes[hash];

  // Cleanup previous page
  if (currentRoute === '#/student/test' && hash !== '#/student/test') {
    cleanupTest();
  }

  if (!route) {
    window.location.hash = '#/login';
    return;
  }

  // Auth check
  if (route.auth) {
    const session = Store.getSession();
    if (!session) {
      window.location.hash = '#/login';
      return;
    }
    if (route.role && session.role !== route.role) {
      // Redirect to correct dashboard
      if (session.role === 'student') window.location.hash = '#/student/dashboard';
      else if (session.role === 'parent') window.location.hash = '#/parent/dashboard';
      else if (session.role === 'admin') window.location.hash = '#/admin/questions';
      return;
    }
  } else {
    // If already logged in, redirect to dashboard
    const session = Store.getSession();
    if (session && hash === '#/login') {
      if (session.role === 'student') { window.location.hash = '#/student/dashboard'; return; }
      if (session.role === 'parent') { window.location.hash = '#/parent/dashboard'; return; }
      if (session.role === 'admin') { window.location.hash = '#/admin/questions'; return; }
    }
  }

  currentRoute = hash;

  // Render page
  try {
    await route.render(app);
  } catch (err) {
    console.error('Page render error:', err);
    app.innerHTML = `
      <div class="loading-screen">
        <h3 style="color: var(--accent-red);">Something went wrong</h3>
        <p class="text-muted">${err.message}</p>
        <button class="btn btn-primary mt-md" onclick="window.location.hash='#/login'">Go to Login</button>
      </div>
    `;
  }
}

// Initialize
async function init() {
  // Show loading
  app.innerHTML = `
    <div class="loading-screen">
      <div class="spinner"></div>
      <p class="text-muted">Initializing ExamPrep...</p>
    </div>
  `;

  // Init store (seeds default data)
  try {
    await Store.init();
  } catch (err) {
    console.warn('Store init warning:', err);
  }

  // Listen for route changes
  window.addEventListener('hashchange', navigate);

  // Initial navigation
  navigate();
}

// Boot
init();
