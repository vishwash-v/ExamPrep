// ================================
// ExamPrep — Parent Dashboard
// ================================

import { EXAMS, getSubjects } from '../../data/exams.js';
import { Store } from '../../data/store.js';
import { PerformanceTracker } from '../../engine/performanceTracker.js';
import { formatDate, formatTime, getChartColors } from '../../utils/helpers.js';

export async function renderParentDashboard(container) {
  const user = Store.getSession();
  if (!user) { window.location.hash = '#/login'; return; }

  // Get linked student
  const studentId = user.linkedStudent || 'student1';
  const student = await Store.getUser(studentId);
  const studentName = student?.name || 'Student';
  const selectedExam = student?.selectedExam || 'NEET';

  container.innerHTML = `
    <nav class="navbar">
      <span class="nav-brand">ExamPrep</span>
      <div class="nav-user">
        <span class="text-sm text-muted">Parent Dashboard</span>
        <div class="nav-avatar">P</div>
        <button class="btn btn-ghost btn-sm" id="logout-btn">Logout</button>
      </div>
    </nav>

    <div class="container page-enter" style="padding-top: 2rem; padding-bottom: 3rem;">
      <div class="flex items-center justify-between flex-wrap gap-md mb-lg">
        <div>
          <h2>📊 ${studentName}'s Performance</h2>
          <p class="text-muted mt-sm">Detailed analytics and progress tracking</p>
        </div>
        <div class="flex gap-sm">
          ${Object.keys(EXAMS).map(examId => `
            <button class="btn ${examId === selectedExam ? 'btn-primary' : 'btn-ghost'} exam-switch-btn" data-exam="${examId}">
              ${EXAMS[examId].name}
            </button>
          `).join('')}
        </div>
      </div>

      <div id="parent-content">
        <div class="loading-screen">
          <div class="spinner"></div>
          <p class="text-muted">Loading analytics...</p>
        </div>
      </div>
    </div>
  `;

  let currentExam = selectedExam;

  async function loadAnalytics(examId) {
    const contentEl = document.getElementById('parent-content');
    const summary = await PerformanceTracker.getPerformanceSummary(studentId, examId);

    if (summary.totalTests === 0) {
      contentEl.innerHTML = `
        <div class="empty-state" style="padding: 4rem;">
          <div class="empty-state-icon">📝</div>
          <h3>No Tests Taken Yet</h3>
          <p class="text-muted mt-sm">Once ${studentName} takes some tests for ${EXAMS[examId].name}, analytics will appear here.</p>
        </div>
      `;
      return;
    }

    contentEl.innerHTML = `
      <!-- Stats -->
      <div class="grid-4 mb-lg">
        <div class="card stat-card">
          <span class="stat-label">Tests Taken</span>
          <span class="stat-value">${summary.totalTests}</span>
        </div>
        <div class="card stat-card">
          <span class="stat-label">Avg Accuracy</span>
          <span class="stat-value">${summary.avgAccuracy}%</span>
        </div>
        <div class="card stat-card">
          <span class="stat-label">Avg Score</span>
          <span class="stat-value">${summary.avgScore}</span>
        </div>
        <div class="card stat-card">
          <span class="stat-label">Avg Speed</span>
          <span class="stat-value">${summary.avgSpeed}s</span>
          <span class="text-xs text-muted">per question</span>
        </div>
      </div>

      <!-- Charts row -->
      <div class="grid-2 mb-lg">
        <div class="card">
          <div class="card-header">
            <span class="card-title">📈 Accuracy Trend</span>
          </div>
          <div class="chart-container">
            <canvas id="accuracy-chart"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">⏱️ Speed Trend</span>
          </div>
          <div class="chart-container">
            <canvas id="speed-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Topic Performance -->
      <div class="grid-2 mb-lg">
        <div class="card">
          <div class="card-header">
            <span class="card-title">🎯 Topic Radar</span>
          </div>
          <div class="chart-container" style="height: 320px;">
            <canvas id="topic-radar"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">📊 Score Distribution</span>
          </div>
          <div class="chart-container">
            <canvas id="score-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Weak & Strong Topics -->
      <div class="grid-2 mb-lg">
        <div class="card">
          <div class="card-header">
            <span class="card-title">⚠️ Weak Topics</span>
            <span class="badge badge-hard">&lt; 60% accuracy</span>
          </div>
          <div id="weak-topics-parent">
            ${summary.weakTopics.length === 0
              ? '<p class="text-sm text-muted p-md">No weak topics detected. Great job!</p>'
              : summary.weakTopics.map(t => `
                <div class="topic-card weak" style="cursor: default; margin-bottom: 0.5rem;">
                  <div>
                    <div class="font-semibold text-sm">${t.topic}</div>
                    <div class="text-xs text-muted">${t.subject} • ${t.totalQ}Q attempted</div>
                  </div>
                  <span class="badge badge-hard">${t.accuracy}%</span>
                </div>
              `).join('')
            }
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">💪 Strong Topics</span>
            <span class="badge badge-easy">&gt; 75% accuracy</span>
          </div>
          <div id="strong-topics-parent">
            ${summary.strongTopics.length === 0
              ? '<p class="text-sm text-muted p-md">No strong topics yet.</p>'
              : summary.strongTopics.map(t => `
                <div class="topic-card strong" style="cursor: default; margin-bottom: 0.5rem;">
                  <div>
                    <div class="font-semibold text-sm">${t.topic}</div>
                    <div class="text-xs text-muted">${t.subject} • ${t.totalQ}Q attempted</div>
                  </div>
                  <span class="badge badge-easy">${t.accuracy}%</span>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>

      <!-- Test History -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📋 Full Test History</span>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Topic/Mode</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Time</th>
                <th>Speed</th>
              </tr>
            </thead>
            <tbody>
              ${summary.recentTests.map(r => `
                <tr>
                  <td class="text-muted">${formatDate(r.timestamp)}</td>
                  <td><span class="badge badge-${r.type === 'mock' ? 'purple' : 'blue'}">${r.type}</span></td>
                  <td class="font-semibold">${r.topic || 'Mock Test'}</td>
                  <td>${r.score}/${r.totalMarks}</td>
                  <td>
                    <span class="badge ${r.accuracy >= 75 ? 'badge-easy' : r.accuracy >= 50 ? 'badge-medium' : 'badge-hard'}">${r.accuracy}%</span>
                  </td>
                  <td>${formatTime(r.timeTaken || 0)}</td>
                  <td class="text-muted">${r.avgTimePerQuestion || '-'}s/Q</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Render charts
    renderCharts(summary);
  }

  function renderCharts(summary) {
    const chartDefaults = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 11 } } }
      }
    };

    // Accuracy trend
    const accCtx = document.getElementById('accuracy-chart')?.getContext('2d');
    if (accCtx && summary.trend.length > 0) {
      new Chart(accCtx, {
        type: 'line',
        data: {
          labels: summary.trend.map(t => formatDate(t.date)),
          datasets: [{
            data: summary.trend.map(t => t.accuracy),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6'
          }]
        },
        options: { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 0, max: 100 } } }
      });
    }

    // Speed trend
    const speedCtx = document.getElementById('speed-chart')?.getContext('2d');
    if (speedCtx && summary.trend.length > 0) {
      new Chart(speedCtx, {
        type: 'line',
        data: {
          labels: summary.trend.map(t => formatDate(t.date)),
          datasets: [{
            data: summary.trend.map(t => t.speed),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#f59e0b'
          }]
        },
        options: chartDefaults
      });
    }

    // Topic radar
    const radarCtx = document.getElementById('topic-radar')?.getContext('2d');
    if (radarCtx && summary.topicPerformance.length > 0) {
      const topTopics = summary.topicPerformance.slice(0, 10);
      new Chart(radarCtx, {
        type: 'radar',
        data: {
          labels: topTopics.map(t => t.topic.length > 20 ? t.topic.substring(0, 18) + '...' : t.topic),
          datasets: [{
            data: topTopics.map(t => t.accuracy),
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            pointBackgroundColor: '#8b5cf6',
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            r: {
              min: 0,
              max: 100,
              grid: { color: 'rgba(255,255,255,0.08)' },
              angleLines: { color: 'rgba(255,255,255,0.08)' },
              pointLabels: { color: '#94a3b8', font: { size: 10 } },
              ticks: { display: false }
            }
          }
        }
      });
    }

    // Score distribution
    const scoreCtx = document.getElementById('score-chart')?.getContext('2d');
    if (scoreCtx && summary.recentTests.length > 0) {
      new Chart(scoreCtx, {
        type: 'bar',
        data: {
          labels: summary.recentTests.slice(0, 10).reverse().map(t => formatDate(t.timestamp)),
          datasets: [{
            data: summary.recentTests.slice(0, 10).reverse().map(t => t.score),
            backgroundColor: summary.recentTests.slice(0, 10).reverse().map(t =>
              t.accuracy >= 75 ? 'rgba(16, 185, 129, 0.6)' :
              t.accuracy >= 50 ? 'rgba(245, 158, 11, 0.6)' :
              'rgba(239, 68, 68, 0.6)'
            ),
            borderRadius: 6
          }]
        },
        options: chartDefaults
      });
    }
  }

  // Init
  await loadAnalytics(currentExam);

  // Exam switch
  document.querySelectorAll('.exam-switch-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      currentExam = btn.dataset.exam;
      document.querySelectorAll('.exam-switch-btn').forEach(b => {
        b.className = `btn ${b.dataset.exam === currentExam ? 'btn-primary' : 'btn-ghost'} exam-switch-btn`;
      });
      await loadAnalytics(currentExam);
    });
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    Store.clearSession();
    window.location.hash = '#/login';
  });
}
