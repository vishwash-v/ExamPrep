// ================================
// ExamPrep — Test Engine UI
// ================================

import { Store } from '../../data/store.js';
import { PerformanceTracker } from '../../engine/performanceTracker.js';
import { formatTime, showToast } from '../../utils/helpers.js';
import { initAntiCheat, removeAntiCheat, getTabSwitchCount } from '../../utils/antiCheat.js';

let timerInterval = null;
let currentTest = null;
let answers = {};
let markedForReview = new Set();
let currentQuestionIndex = 0;
let timeRemaining = 0;
let startTime = 0;
let activeResultKey = null; // Firebase key for the current test result

export function renderTest(container) {
  const user = Store.getSession();
  if (!user) { window.location.hash = '#/login'; return; }

  const testData = sessionStorage.getItem('currentTest');
  if (!testData) {
    showToast('No test found. Please start a test from dashboard.', 'error');
    window.location.hash = '#/student/dashboard';
    return;
  }

  currentTest = JSON.parse(testData);
  answers = {};
  markedForReview = new Set();
  currentQuestionIndex = 0;
  timeRemaining = currentTest.timeLimit * 60;
  startTime = Date.now();
  activeResultKey = null;

  // Enable anti-cheat
  initAntiCheat(user.name);

  // Create the test result entry in Firebase immediately
  (async () => {
    activeResultKey = await Store.initTestResult(user.id, {
      testId: currentTest.id,
      type: currentTest.scheduledTestId ? 'scheduled' : (currentTest.type || 'topic'),
      exam: currentTest.exam || '',
      subject: currentTest.subject || '',
      topic: currentTest.topic || '',
      scheduledTestId: currentTest.scheduledTestId || '',
      totalQuestions: currentTest.totalQuestions || currentTest.questions.length,
      timeLimit: currentTest.timeLimit || 0,
      marking: currentTest.marking || {}
    });
    if (activeResultKey) {
      console.log('Test result initialized:', activeResultKey);
    }
  })();

  // If revision material exists, show it first
  if (currentTest.revisionMaterial) {
    showRevisionScreen(container, user, () => {
      renderTestUI(container);
    });
  } else {
    renderTestUI(container);
  }
}

function showRevisionScreen(container, user, onComplete) {
  let revisionTimeLeft = 10 * 60; // 10 minutes in seconds

  container.innerHTML = `
    <div class="test-page no-select">
      <div class="test-topbar">
        <div class="flex items-center gap-md">
          <span class="nav-brand">ExamPrep</span>
          <span class="badge badge-blue">${currentTest.exam}</span>
          <span class="text-sm text-muted">${currentTest.topic || 'Scheduled Test'}</span>
        </div>
        <div class="flex items-center gap-md">
          <div class="timer-display" id="revision-timer" style="background: rgba(59, 130, 246, 0.15); color: var(--accent-blue);">10:00</div>
          <span class="badge badge-medium" style="padding: 0.4rem 0.8rem;">📖 Revision</span>
        </div>
      </div>

      <div style="max-width: 900px; margin: 0 auto; padding: 1.5rem;">
        <div class="card" style="border: 1px solid rgba(59, 130, 246, 0.3); background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent);">
          <div class="card-header" style="border-bottom: 1px solid rgba(59, 130, 246, 0.15);">
            <span class="card-title">📖 Revision Material</span>
            <span class="text-xs text-muted" id="revision-msg">Read carefully — test starts automatically after the timer</span>
          </div>
          <div style="padding: 1.5rem; max-height: 70vh; overflow-y: auto;">
            <div id="revision-content" style="white-space: pre-wrap; line-height: 1.8; font-size: 1rem; color: var(--text-primary);">${currentTest.revisionMaterial}</div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 1.5rem;">
          <div class="text-sm text-muted">⏳ Test will start automatically in <strong id="revision-countdown-text">10:00</strong></div>
          <div class="progress-bar mt-md" style="max-width: 400px; margin: 0 auto;">
            <div class="progress-fill green" id="revision-progress" style="width: 0%; transition: width 1s linear;"></div>
          </div>
          <p class="text-xs text-muted mt-md">You cannot skip this. Use this time to revise!</p>
        </div>
      </div>
    </div>

    <style>
      .test-topbar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0.75rem 1.5rem; background: rgba(10, 14, 26, 0.95);
        backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-color);
        position: sticky; top: 0; z-index: 100;
      }
    </style>
  `;

  const timerEl = document.getElementById('revision-timer');
  const countdownText = document.getElementById('revision-countdown-text');
  const progressBar = document.getElementById('revision-progress');
  const totalTime = 600; // 10 min

  const revInterval = setInterval(() => {
    revisionTimeLeft--;
    const m = Math.floor(revisionTimeLeft / 60);
    const s = revisionTimeLeft % 60;
    const display = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    timerEl.textContent = display;
    countdownText.textContent = display;
    progressBar.style.width = ((totalTime - revisionTimeLeft) / totalTime * 100) + '%';

    if (revisionTimeLeft <= 30) {
      timerEl.style.background = 'rgba(245, 158, 11, 0.15)';
      timerEl.style.color = 'var(--accent-orange)';
    }
    if (revisionTimeLeft <= 10) {
      timerEl.style.background = 'rgba(239, 68, 68, 0.15)';
      timerEl.style.color = 'var(--accent-red)';
    }

    if (revisionTimeLeft <= 0) {
      clearInterval(revInterval);
      // Reset startTime so test timer counts from now
      startTime = Date.now();
      onComplete();
    }
  }, 1000);
}

let saveIndicatorTimeout = null;
function showSaveIndicator(success = true) {
  const el = document.getElementById('save-indicator');
  if (!el) return;
  if (success) {
    el.textContent = '✓ Saved';
    el.style.color = '#10b981';
  } else {
    el.textContent = '✗ Failed';
    el.style.color = '#ef4444';
  }
  el.style.opacity = '1';
  clearTimeout(saveIndicatorTimeout);
  saveIndicatorTimeout = setTimeout(() => { el.style.opacity = '0'; }, 1500);
}

function renderTestUI(container) {

  container.innerHTML = `
    <div class="test-page no-select">
      <!-- Top Bar -->
      <div class="test-topbar">
        <div class="flex items-center gap-md">
          <span class="nav-brand">ExamPrep</span>
          <span class="badge badge-blue">${currentTest.exam}</span>
          <span class="text-sm text-muted">${currentTest.topic || 'Mock Test'}</span>
        </div>
        <div class="flex items-center gap-md">
          <span id="save-indicator" style="font-size: 0.75rem; color: #10b981; font-weight: 600; opacity: 0; transition: opacity 0.3s;">✓ Saved</span>
          <div class="timer-display" id="timer">--:--</div>
          <button class="btn btn-danger btn-sm" id="submit-test-btn">Submit Test</button>
        </div>
      </div>

      <div class="test-body">
        <!-- Main Question Area -->
        <div class="test-main">
          <div class="card" id="question-card">
            <div class="question-header">
              <span class="question-number" id="q-number">Question 1 of ${currentTest.totalQuestions}</span>
              <div class="flex items-center gap-sm">
                <span class="badge" id="q-difficulty">Easy</span>
                <button class="btn btn-ghost btn-sm" id="mark-review-btn">⭐ Mark for Review</button>
              </div>
            </div>
            <div class="question-text" id="q-text"></div>
            <div class="options-list" id="q-options"></div>
          </div>

          <div class="flex justify-between mt-md">
            <button class="btn btn-ghost" id="prev-btn">← Previous</button>
            <div class="flex gap-sm">
              <button class="btn btn-ghost" id="clear-btn">Clear</button>
              <button class="btn btn-primary" id="next-btn">Next →</button>
            </div>
          </div>
        </div>

        <!-- Right Sidebar: Question Palette -->
        <div class="test-sidebar">
          <div class="card">
            <div class="card-header">
              <span class="card-title text-sm">Questions</span>
            </div>
            <div class="palette-legend mb-md">
              <div class="legend-item"><span class="legend-dot answered"></span> Answered</div>
              <div class="legend-item"><span class="legend-dot marked"></span> Marked</div>
              <div class="legend-item"><span class="legend-dot unanswered"></span> Not Answered</div>
            </div>
            <div class="q-palette" id="q-palette"></div>
            <div class="mt-md">
              <div class="text-xs text-muted mb-sm">
                Answered: <span id="answered-count">0</span> / ${currentTest.totalQuestions}
              </div>
              <div class="progress-bar">
                <div class="progress-fill green" id="progress-bar" style="width: 0%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      .test-page { min-height: 100vh; }
      .test-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1.5rem;
        background: rgba(10, 14, 26, 0.95);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--border-color);
        position: sticky;
        top: 0;
        z-index: 100;
      }
      .test-body {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        padding: 1.5rem;
        max-width: 1300px;
        margin: 0 auto;
      }
      .question-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .question-number {
        font-weight: 600;
        color: var(--accent-blue);
      }
      .question-text {
        font-size: 1.1rem;
        line-height: 1.7;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: var(--bg-glass);
        border-radius: var(--radius-md);
      }
      .options-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .palette-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        font-size: 0.75rem;
        color: var(--text-secondary);
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }
      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 3px;
        border: 1px solid var(--border-color);
        background: var(--bg-glass);
      }
      .legend-dot.answered { background: rgba(16, 185, 129, 0.3); border-color: var(--accent-green); }
      .legend-dot.marked { background: rgba(245, 158, 11, 0.3); border-color: var(--accent-orange); }
      .legend-dot.unanswered { background: var(--bg-glass); }

      @media (max-width: 900px) {
        .test-body { grid-template-columns: 1fr; }
        .test-sidebar { order: -1; }
      }
    </style>
  `;

  // Render palette
  renderPalette();
  renderQuestion(0);
  startTimer();

  // Events
  document.getElementById('next-btn').addEventListener('click', () => {
    if (currentQuestionIndex < currentTest.questions.length - 1) {
      renderQuestion(currentQuestionIndex + 1);
    }
  });

  document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      renderQuestion(currentQuestionIndex - 1);
    }
  });

  document.getElementById('clear-btn').addEventListener('click', () => {
    const q = currentTest.questions[currentQuestionIndex];
    delete answers[currentQuestionIndex];
    // Save cleared state directly to testResults
    const user = Store.getSession();
    if (user && activeResultKey) {
      Store.clearAnswerInResult(user.id, activeResultKey, currentQuestionIndex, {
        questionId: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: null,
        isCorrect: false,
        isUnanswered: true,
        topic: q.topic,
        subject: q.subject,
        difficulty: q.difficulty,
        solution: q.solution || ''
      }).then(ok => showSaveIndicator(ok));
    }
    renderQuestion(currentQuestionIndex);
    updatePalette();
  });

  document.getElementById('mark-review-btn').addEventListener('click', () => {
    if (markedForReview.has(currentQuestionIndex)) {
      markedForReview.delete(currentQuestionIndex);
    } else {
      markedForReview.add(currentQuestionIndex);
    }
    updatePalette();
    updateMarkButton();
  });

  document.getElementById('submit-test-btn').addEventListener('click', () => {
    showSubmitConfirm();
  });
}

function renderQuestion(index) {
  currentQuestionIndex = index;
  const q = currentTest.questions[index];

  document.getElementById('q-number').textContent = `Question ${index + 1} of ${currentTest.totalQuestions}`;
  document.getElementById('q-text').textContent = q.question;

  const diffBadge = document.getElementById('q-difficulty');
  diffBadge.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
  diffBadge.className = `badge badge-${q.difficulty === 'easy' ? 'easy' : q.difficulty === 'medium' ? 'medium' : 'hard'}`;

  // Render options
  const optionsEl = document.getElementById('q-options');
  const labels = ['A', 'B', 'C', 'D'];
  optionsEl.innerHTML = q.options.map((opt, i) => `
    <div class="option-item ${answers[index] === i ? 'selected' : ''}" data-index="${i}">
      <span class="option-label">${labels[i]}</span>
      <span class="option-text">${opt}</span>
    </div>
  `).join('');

  // Option click
  optionsEl.querySelectorAll('.option-item').forEach(item => {
    item.addEventListener('click', () => {
      const optIndex = parseInt(item.dataset.index);
      answers[currentQuestionIndex] = optIndex;
      // Save answer directly to testResults in Firebase
      const user = Store.getSession();
      const q = currentTest.questions[currentQuestionIndex];
      if (user && activeResultKey) {
        Store.saveAnswerToResult(user.id, activeResultKey, currentQuestionIndex, {
          questionId: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          userAnswer: optIndex,
          isCorrect: optIndex === q.correctAnswer,
          isUnanswered: false,
          topic: q.topic,
          subject: q.subject,
          difficulty: q.difficulty,
          solution: q.solution || ''
        }).then(ok => showSaveIndicator(ok));
      }
      renderQuestion(currentQuestionIndex);
      updatePalette();
    });
  });

  // Nav buttons
  document.getElementById('prev-btn').disabled = index === 0;
  document.getElementById('next-btn').textContent = index === currentTest.questions.length - 1 ? 'Finish' : 'Next →';

  updateMarkButton();
  updatePalette();
}

function renderPalette() {
  const palette = document.getElementById('q-palette');
  palette.innerHTML = currentTest.questions.map((_, i) => `
    <button class="q-palette-btn" data-index="${i}">${i + 1}</button>
  `).join('');

  palette.querySelectorAll('.q-palette-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      renderQuestion(parseInt(btn.dataset.index));
    });
  });
}

function updatePalette() {
  const buttons = document.querySelectorAll('.q-palette-btn');
  let answeredCount = 0;

  buttons.forEach(btn => {
    const i = parseInt(btn.dataset.index);
    btn.className = 'q-palette-btn';

    if (i === currentQuestionIndex) btn.classList.add('current');
    if (answers[i] !== undefined) {
      btn.classList.add('answered');
      answeredCount++;
    }
    if (markedForReview.has(i)) btn.classList.add('marked');
  });

  document.getElementById('answered-count').textContent = answeredCount;
  const pct = (answeredCount / currentTest.totalQuestions) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
}

function updateMarkButton() {
  const btn = document.getElementById('mark-review-btn');
  if (markedForReview.has(currentQuestionIndex)) {
    btn.textContent = '⭐ Unmark';
    btn.classList.add('btn-primary');
    btn.classList.remove('btn-ghost');
  } else {
    btn.textContent = '⭐ Mark for Review';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-ghost');
  }
}

function startTimer() {
  const timerEl = document.getElementById('timer');
  
  function updateTimer() {
    timerEl.textContent = formatTime(timeRemaining);

    if (timeRemaining <= 300) { // 5 min warning
      timerEl.classList.add('warning');
    }
    if (timeRemaining <= 60) {
      timerEl.classList.remove('warning');
      timerEl.classList.add('danger');
    }
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      showToast('Time\'s up! Submitting test...', 'warning');
      submitTest();
      return;
    }
    timeRemaining--;
  }

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function showSubmitConfirm() {
  const total = currentTest.totalQuestions;
  const answered = Object.keys(answers).length;
  const marked = markedForReview.size;
  const unanswered = total - answered;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3 style="margin-bottom: 1rem;">Submit Test?</h3>
      <div style="margin-bottom: 1.5rem;">
        <p class="text-sm mb-md">
          <span class="text-green font-semibold">✓ Answered:</span> ${answered} / ${total}
        </p>
        <p class="text-sm mb-md">
          <span class="text-orange font-semibold">⭐ Marked:</span> ${marked}
        </p>
        <p class="text-sm">
          <span class="text-red font-semibold">✗ Unanswered:</span> ${unanswered}
        </p>
      </div>
      ${unanswered > 0 ? '<p class="text-sm text-muted mb-md">You have unanswered questions. Are you sure?</p>' : ''}
      <div class="flex gap-sm justify-between">
        <button class="btn btn-ghost" id="cancel-submit">Go Back</button>
        <button class="btn btn-danger" id="confirm-submit">Submit Test</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  document.getElementById('cancel-submit').addEventListener('click', () => backdrop.remove());
  document.getElementById('confirm-submit').addEventListener('click', () => {
    backdrop.remove();
    submitTest();
  });
}

async function submitTest() {
  clearInterval(timerInterval);
  removeAntiCheat();

  // Show full-screen overlay immediately to block interactions
  const overlay = document.createElement('div');
  overlay.id = 'submit-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(10, 14, 26, 0.95);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      backdrop-filter: blur(10px);
    ">
      <div style="font-size: 4rem; margin-bottom: 1rem; animation: bounceIn 0.6s ease;">🎉</div>
      <h2 style="color: #e2e8f0; margin-bottom: 0.5rem; animation: fadeInUp 0.6s ease 0.2s both;">Thank You!</h2>
      <p style="color: #94a3b8; font-size: 1rem; margin-bottom: 2rem; animation: fadeInUp 0.6s ease 0.4s both;">Submitting your test, please wait...</p>
      <div style="animation: fadeInUp 0.6s ease 0.6s both;">
        <div class="spinner"></div>
      </div>
    </div>
    <style>
      @keyframes bounceIn {
        0% { transform: scale(0); opacity: 0; }
        60% { transform: scale(1.2); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes fadeInUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
  `;
  document.body.appendChild(overlay);

  const user = Store.getSession();
  const timeTaken = Math.round((Date.now() - startTime) / 1000);

  // Calculate result
  const result = PerformanceTracker.calculateResult(currentTest, answers, timeTaken);
  result.tabSwitches = getTabSwitchCount();

  // Tag scheduled tests
  if (currentTest.scheduledTestId) {
    result.scheduledTestId = currentTest.scheduledTestId;
    result.type = 'scheduled';
  }

  // Finalize: write only the summary stats (answers already saved per-question)
  if (activeResultKey) {
    try {
      // First, save unanswered questions that the student never visited
      for (let i = 0; i < currentTest.questions.length; i++) {
        if (answers[i] === undefined) {
          const q = currentTest.questions[i];
          await Store.saveAnswerToResult(user.id, activeResultKey, i, {
            questionId: q.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            userAnswer: null,
            isCorrect: false,
            isUnanswered: true,
            topic: q.topic,
            subject: q.subject,
            difficulty: q.difficulty,
            solution: q.solution || ''
          });
        }
      }

      await Store.finalizeTestResult(user.id, activeResultKey, {
        correct: result.correct,
        incorrect: result.incorrect,
        unanswered: result.unanswered,
        score: result.score,
        totalMarks: result.totalMarks,
        accuracy: result.accuracy,
        timeTaken: result.timeTaken,
        timeLimit: result.timeLimit,
        avgTimePerQuestion: result.avgTimePerQuestion,
        topicBreakdown: result.topicBreakdown,
        tabSwitches: result.tabSwitches,
        scheduledTestId: result.scheduledTestId || '',
        type: result.type
      });

      // Save mistakes and mark attempted (only in primary path)
      const mistakes = result.questionResults.filter(q => !q.isCorrect && !q.isUnanswered);
      for (const mistake of mistakes) {
        await Store.saveMistake(user.id, {
          questionId: mistake.questionId,
          exam: result.exam,
          subject: mistake.subject,
          topic: mistake.topic,
          userAnswer: mistake.userAnswer,
          correctAnswer: mistake.correctAnswer,
          difficulty: mistake.difficulty
        });
      }
      const questionIds = result.questionResults.map(q => q.questionId);
      await Store.markQuestionsAttempted(user.id, questionIds);

    } catch (e) {
      console.error('finalizeTestResult failed, saving full result as fallback:', e);
      // Fallback does everything (save result + mistakes + attempted)
      await PerformanceTracker.saveResult(user.id, result);
    }
  } else {
    // Fallback: no activeResultKey (initTestResult failed), do full save
    await PerformanceTracker.saveResult(user.id, result);
  }

  // Mark scheduled test as completed
  if (currentTest.scheduledTestId) {
    try {
      await Store.updateScheduledTest(currentTest.scheduledTestId, {
        status: 'completed',
        completedAt: Date.now()
      });
    } catch (e) { console.warn('Could not update scheduled test status:', e); }
  }

  // Store result in sessionStorage for results page
  sessionStorage.setItem('lastResult', JSON.stringify(result));
  sessionStorage.removeItem('currentTest');

  window.location.hash = '#/student/results';
}

// Cleanup on page leave
export function cleanupTest() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  removeAntiCheat();
}
