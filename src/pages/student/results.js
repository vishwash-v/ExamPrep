// ================================
// ExamPrep — Test Results Page
// ================================

import { Store } from '../../data/store.js';
import { formatTime, formatDate, showToast, percentage } from '../../utils/helpers.js';
import { EXAMS } from '../../data/exams.js';

export function renderResults(container) {
  const user = Store.getSession();
  if (!user) { window.location.hash = '#/login'; return; }

  const resultData = sessionStorage.getItem('lastResult');
  if (!resultData) {
    showToast('No results found.', 'error');
    window.location.hash = '#/student/dashboard';
    return;
  }

  const result = JSON.parse(resultData);
  const exam = EXAMS[result.exam];
  const scorePercentage = percentage(result.score, result.totalMarks);
  const timeUsedPct = percentage(result.timeTaken, result.timeLimit);

  container.innerHTML = `
    <nav class="navbar">
      <span class="nav-brand">ExamPrep</span>
      <div class="nav-user">
        <button class="btn btn-ghost btn-sm" id="back-dashboard">← Dashboard</button>
      </div>
    </nav>

    <div class="container page-enter" style="padding-top: 2rem; padding-bottom: 3rem;">
      <!-- Result Header -->
      <div class="card mb-lg" style="text-align: center; padding: 2.5rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">
          ${result.accuracy >= 80 ? '🎉' : result.accuracy >= 60 ? '👍' : result.accuracy >= 40 ? '😐' : '💪'}
        </div>
        <h2 style="margin-bottom: 0.5rem;">
          ${result.accuracy >= 80 ? 'Excellent!' : result.accuracy >= 60 ? 'Good Job!' : result.accuracy >= 40 ? 'Keep Practicing!' : 'Don\'t Give Up!'}
        </h2>
        <p class="text-muted mb-lg">${result.exam} • ${result.topic || 'Mock Test'} • ${formatDate(Date.now())}</p>

        <div class="flex justify-center gap-xl flex-wrap">
          <div>
            <div class="stat-value" style="font-size: 3rem;">${result.score}</div>
            <div class="stat-label">Score / ${result.totalMarks}</div>
          </div>
          <div>
            <div class="stat-value" style="font-size: 3rem;">${result.accuracy}%</div>
            <div class="stat-label">Accuracy</div>
          </div>
          <div>
            <div class="stat-value" style="font-size: 3rem;">${formatTime(result.timeTaken)}</div>
            <div class="stat-label">Time Taken</div>
          </div>
        </div>

        ${result.tabSwitches > 0 ? `
          <div class="mt-md">
            <span class="badge badge-hard" style="padding: 0.4rem 0.8rem;">
              ⚠️ Tab Switches Detected: ${result.tabSwitches}
            </span>
          </div>
        ` : ''}
      </div>

      <!-- Stats Grid -->
      <div class="grid-4 mb-lg">
        <div class="card stat-card">
          <span class="stat-label">Correct</span>
          <span class="stat-value text-green" style="-webkit-text-fill-color: var(--accent-green);">${result.correct}</span>
        </div>
        <div class="card stat-card">
          <span class="stat-label">Incorrect</span>
          <span class="stat-value text-red" style="-webkit-text-fill-color: var(--accent-red);">${result.incorrect}</span>
        </div>
        <div class="card stat-card">
          <span class="stat-label">Unanswered</span>
          <span class="stat-value text-orange" style="-webkit-text-fill-color: var(--accent-orange);">${result.unanswered}</span>
        </div>
        <div class="card stat-card">
          <span class="stat-label">Avg Time/Q</span>
          <span class="stat-value">${result.avgTimePerQuestion}s</span>
        </div>
      </div>

      <!-- Marking info -->
      <div class="card mb-lg p-md">
        <div class="flex items-center gap-lg flex-wrap text-sm">
          <span>Marking: <span class="font-semibold text-green">+${result.marking.correct} correct</span></span>
          <span><span class="font-semibold text-red">${result.marking.incorrect} incorrect</span></span>
          <span>Time Used: <span class="font-semibold">${timeUsedPct}%</span> of ${formatTime(result.timeLimit)}</span>
        </div>
        <div class="progress-bar mt-sm">
          <div class="progress-fill ${timeUsedPct > 90 ? 'warning' : 'green'}" style="width: ${timeUsedPct}%"></div>
        </div>
      </div>

      <!-- Topic Breakdown -->
      <div class="card mb-lg">
        <div class="card-header">
          <span class="card-title">📊 Topic-wise Breakdown</span>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Topic</th>
                <th>Subject</th>
                <th>Correct</th>
                <th>Wrong</th>
                <th>Skipped</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(result.topicBreakdown).map(([topic, data]) => {
                const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                return `
                  <tr>
                    <td class="font-semibold">${topic}</td>
                    <td class="text-muted">${data.subject}</td>
                    <td class="text-green">${data.correct}</td>
                    <td class="text-red">${data.incorrect}</td>
                    <td class="text-orange">${data.unanswered}</td>
                    <td>
                      <span class="badge ${acc >= 75 ? 'badge-easy' : acc >= 50 ? 'badge-medium' : 'badge-hard'}">${acc}%</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Question Review -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">📝 Detailed Review</span>
          <div class="flex gap-sm">
            <button class="btn btn-ghost btn-sm review-filter active" data-filter="all">All</button>
            <button class="btn btn-ghost btn-sm review-filter" data-filter="wrong">Wrong Only</button>
            <button class="btn btn-ghost btn-sm review-filter" data-filter="correct">Correct Only</button>
          </div>
        </div>
        <div id="question-review-list"></div>
      </div>

      <!-- Action buttons -->
      <div class="flex justify-center gap-md mt-lg">
        <button class="btn btn-primary btn-lg" id="back-to-dashboard">← Back to Dashboard</button>
      </div>
    </div>
  `;

  // Render review list
  let currentFilter = 'all';

  function renderReviewList(filter) {
    const list = document.getElementById('question-review-list');
    let questions = result.questionResults;

    if (filter === 'wrong') questions = questions.filter(q => !q.isCorrect && !q.isUnanswered);
    if (filter === 'correct') questions = questions.filter(q => q.isCorrect);

    if (questions.length === 0) {
      list.innerHTML = '<div class="empty-state"><p class="text-muted">No questions match this filter</p></div>';
      return;
    }

    const labels = ['A', 'B', 'C', 'D'];
    list.innerHTML = questions.map((q, idx) => `
      <div class="review-question" style="padding: 1.25rem; border-bottom: 1px solid var(--border-color);">
        <div class="flex items-center justify-between mb-sm">
          <span class="font-semibold text-sm">
            ${q.isCorrect ? '✅' : q.isUnanswered ? '⬜' : '❌'} Q${idx + 1}
          </span>
          <div class="flex gap-sm">
            <span class="badge badge-${q.difficulty === 'easy' ? 'easy' : q.difficulty === 'medium' ? 'medium' : 'hard'}">${q.difficulty}</span>
            <span class="text-xs text-muted">${q.topic}</span>
          </div>
        </div>
        <p class="mb-md" style="line-height: 1.6;">${q.question}</p>
        <div class="options-list" style="gap: 0.5rem;">
          ${q.options.map((opt, i) => {
            let cls = '';
            if (i === q.correctAnswer) cls = 'correct';
            else if (i === q.userAnswer && !q.isCorrect) cls = 'wrong';
            return `
              <div class="option-item ${cls}" style="cursor: default; padding: 0.625rem 0.875rem;">
                <span class="option-label" style="width: 24px; height: 24px; min-width: 24px; font-size: 0.7rem;">${labels[i]}</span>
                <span class="text-sm">${opt}</span>
                ${i === q.correctAnswer ? '<span class="text-xs text-green" style="margin-left: auto;">✓ Correct</span>' : ''}
                ${i === q.userAnswer && !q.isCorrect ? '<span class="text-xs text-red" style="margin-left: auto;">Your answer</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
        ${q.solution ? `
          <div class="mt-md" style="padding: 0.875rem; background: rgba(59, 130, 246, 0.08); border-radius: var(--radius-md); border-left: 3px solid var(--accent-blue);">
            <div class="text-xs font-semibold text-blue mb-sm">💡 Solution</div>
            <p class="text-sm" style="line-height: 1.6; color: var(--text-secondary);">${q.solution}</p>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  renderReviewList('all');

  // Filter buttons
  document.querySelectorAll('.review-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.review-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderReviewList(currentFilter);
    });
  });

  // Navigation
  document.getElementById('back-dashboard')?.addEventListener('click', () => {
    window.location.hash = '#/student/dashboard';
  });
  document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
    window.location.hash = '#/student/dashboard';
  });
}
