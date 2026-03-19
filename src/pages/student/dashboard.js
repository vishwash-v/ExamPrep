// ================================
// ExamPrep — Student Dashboard
// ================================

import { EXAMS, getSubjects, getTopics, getDaysUntilExam, isMockTestMode } from '../../data/exams.js';
import { Store } from '../../data/store.js';
import { TestGenerator } from '../../engine/testGenerator.js';
import { showToast, formatDate, formatTime } from '../../utils/helpers.js';

export async function renderStudentDashboard(container) {
  const user = Store.getSession();
  if (!user) { window.location.hash = '#/login'; return; }

  const selectedExam = user.selectedExam || 'NEET';

  container.innerHTML = `
    <nav class="navbar">
      <span class="nav-brand">ExamPrep</span>
      <div class="nav-user">
        <span class="text-sm text-muted">${user.name}</span>
        <div class="nav-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <button class="btn btn-ghost btn-sm" id="logout-btn">Logout</button>
      </div>
    </nav>

    <div class="container page-enter" style="padding-top: 2rem; padding-bottom: 3rem;">
      <!-- Exam Selector -->
      <div class="flex items-center justify-between flex-wrap gap-md mb-lg">
        <div>
          <h2>Welcome back, ${user.name}! 👋</h2>
          <p class="text-muted mt-sm">Ready to practice? Select your exam and topic.</p>
        </div>
        <div class="flex gap-sm">
          ${Object.keys(EXAMS).map(examId => `
            <button class="btn ${examId === selectedExam ? 'btn-primary' : 'btn-ghost'} exam-select-btn" data-exam="${examId}">
              ${EXAMS[examId].name}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Exam Countdown -->
      <div class="card mb-lg" id="countdown-card">
        <div class="flex items-center justify-between flex-wrap gap-md">
          <div>
            <h4 id="exam-name">${EXAMS[selectedExam].name}</h4>
            <p class="text-sm text-muted" id="exam-date">Exam Date: ${EXAMS[selectedExam].examDate}</p>
          </div>
          <div class="exam-countdown" id="exam-countdown"></div>
        </div>
        <div id="mock-mode-banner" style="display: none;" class="mt-md">
          <div class="badge badge-hard" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
            🔥 Mock Test Mode Active — Last 30 days! Take full-length tests.
          </div>
        </div>
      </div>

      <!-- Scheduled / Upcoming Tests -->
      <div id="scheduled-tests-section" class="mb-lg" style="display: none;">
        <div class="card" style="border: 1px solid rgba(245, 158, 11, 0.3); background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), transparent);">
          <div class="card-header">
            <span class="card-title">📅 Upcoming Scheduled Tests</span>
            <span class="badge badge-medium" id="sched-count">0</span>
          </div>
          <div id="scheduled-tests-list"></div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid-4 mb-lg" id="stats-row">
        <div class="card stat-card">
          <span class="stat-label">Tests Taken</span>
          <span class="stat-value" id="stat-tests">-</span>
        </div>
        <div class="card stat-card">
          <span class="stat-label">Avg Accuracy</span>
          <span class="stat-value" id="stat-accuracy">-</span>
        </div>
        <div class="card stat-card">
          <span class="stat-label">Avg Score</span>
          <span class="stat-value" id="stat-score">-</span>
        </div>
        <div class="card stat-card">
          <span class="stat-label">Weak Topics</span>
          <span class="stat-value" id="stat-weak">-</span>
        </div>
      </div>

      <div class="grid-2" style="grid-template-columns: 1fr 1fr;">
        <!-- Left: Topic Selection -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">📚 Practice by Topic</span>
          </div>
          <div class="form-group mb-md">
            <label class="form-label">Subject</label>
            <select class="form-select" id="subject-select">
              <option value="">Select Subject</option>
            </select>
          </div>
          <div class="form-group mb-md">
            <label class="form-label">Topic</label>
            <select class="form-select" id="topic-select" disabled>
              <option value="">Select Topic</option>
            </select>
          </div>
          <button class="btn btn-primary" id="start-topic-test" style="width: 100%;" disabled>
            Start Topic Test
          </button>
          <div class="mt-lg">
            <button class="btn btn-success" id="start-mock-test" style="width: 100%;">
              🎯 Start Full Mock Test
            </button>
            <p class="text-xs text-muted mt-sm text-center">
              <span id="mock-info"></span>
            </p>
          </div>
        </div>

        <!-- Right: Recommendations & History -->
        <div>
          <div class="card mb-md">
            <div class="card-header">
              <span class="card-title">🎯 Recommended Topics</span>
              <span class="badge badge-hard">Weak Areas</span>
            </div>
            <div id="weak-topics-list">
              <div class="empty-state" style="padding: 1.5rem;">
                <p class="text-sm text-muted">Take some tests to see recommendations</p>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <span class="card-title">📊 Recent Tests</span>
            </div>
            <div id="recent-tests-list">
              <div class="empty-state" style="padding: 1.5rem;">
                <p class="text-sm text-muted">No tests taken yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      .sched-test-card {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .sched-test-card:last-child { border-bottom: none; }
      .sched-countdown {
        font-size: 0.8rem;
        padding: 0.375rem 0.75rem;
        border-radius: var(--radius-md);
        font-weight: 600;
      }
      .sched-live { background: rgba(16, 185, 129, 0.15); color: var(--accent-green); animation: pulse 2s infinite; }
      .sched-upcoming { background: rgba(59, 130, 246, 0.12); color: var(--accent-blue); }
      .sched-missed { background: rgba(239, 68, 68, 0.12); color: var(--accent-red); }
    </style>
  `;

  let currentExam = selectedExam;

  // ---- Scheduled tests ----
  async function loadScheduledTests() {
    const scheduledTests = await Store.getScheduledTestsForStudent(user.id);
    const now = Date.now();
    
    // Filter: only show scheduled (not completed) and not older than 24h
    const relevant = scheduledTests.filter(t => 
      t.status === 'scheduled' && t.scheduledDate > now - 24 * 60 * 60 * 1000
    );
    
    const section = document.getElementById('scheduled-tests-section');
    const list = document.getElementById('scheduled-tests-list');
    
    if (relevant.length === 0) {
      section.style.display = 'none';
      return;
    }
    
    section.style.display = 'block';
    document.getElementById('sched-count').textContent = relevant.length;
    
    list.innerHTML = relevant.map(t => {
      const schedDate = new Date(t.scheduledDate);
      const endTime = t.scheduledDate + t.duration * 60 * 1000;
      const isLive = now >= t.scheduledDate && now <= endTime;
      const isPast = now > endTime;
      const isUpcoming = now < t.scheduledDate;
      
      // Time display
      let timeDisplay = '';
      let statusClass = '';
      let btnHtml = '';
      
      if (isLive) {
        const remaining = Math.ceil((endTime - now) / 60000);
        statusClass = 'sched-live';
        timeDisplay = `🟢 LIVE — ${remaining} min remaining`;
        btnHtml = `<button class="btn btn-success btn-sm start-scheduled-btn" data-id="${t.id}">▶ Start Now</button>`;
      } else if (isPast) {
        statusClass = 'sched-missed';
        timeDisplay = '⏰ Window expired';
        btnHtml = `<span class="text-xs text-muted">Missed</span>`;
      } else {
        // Upcoming — calculate countdown
        const diff = t.scheduledDate - now;
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        statusClass = 'sched-upcoming';
        if (hours > 24) {
          const days = Math.floor(hours / 24);
          timeDisplay = `Starts in ${days}d ${hours % 24}h`;
        } else if (hours > 0) {
          timeDisplay = `Starts in ${hours}h ${mins}m`;
        } else {
          timeDisplay = `Starts in ${mins}m`;
        }
        btnHtml = `<span class="text-xs text-muted">Not yet</span>`;
      }
      
      return `
        <div class="sched-test-card">
          <div style="flex: 1; min-width: 0;">
            <div class="font-semibold">${t.title}</div>
            <div class="text-xs text-muted mt-sm">
              ${t.exam} • ${t.subject || 'Mixed'} • ${t.questionCount}Q • ${t.duration}min
            </div>
            <div class="text-xs text-muted">
              📆 ${schedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              ⏰ ${schedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            ${t.topics && t.topics[0] !== 'All Topics' ? `<div class="text-xs text-muted">Topics: ${t.topics.join(', ')}</div>` : ''}
            ${t.instructions ? `<div class="text-xs mt-sm" style="color: var(--accent-blue); font-style: italic;">📝 ${t.instructions}</div>` : ''}
          </div>
          <div class="flex flex-column items-center gap-sm" style="flex-direction: column;">
            <div class="sched-countdown ${statusClass}">${timeDisplay}</div>
            ${btnHtml}
          </div>
        </div>
      `;
    }).join('');
    
    // Start scheduled test buttons
    list.querySelectorAll('.start-scheduled-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const testId = btn.dataset.id;
        const schedTest = await Store.getScheduledTest(testId);
        if (!schedTest) { showToast('Test not found', 'error'); return; }
        
        const now2 = Date.now();
        const endTime2 = schedTest.scheduledDate + schedTest.duration * 60 * 1000;
        if (now2 < schedTest.scheduledDate || now2 > endTime2) {
          showToast('Test is not available at this time', 'error');
          return;
        }
        
        // Load the actual questions by ID
        const allQuestions = await Store.getAllQuestions();
        const qMap = {};
        allQuestions.forEach(q => { qMap[q.id] = q; });
        
        const questions = schedTest.questionIds
          .map(id => qMap[id])
          .filter(Boolean);
        
        if (questions.length === 0) {
          showToast('No questions found for this test', 'error');
          return;
        }
        
        // Calculate remaining time
        const remainingMs = endTime2 - now2;
        const remainingMin = Math.ceil(remainingMs / 60000);
        
        const test = {
          id: `scheduled_${schedTest.id}`,
          type: 'scheduled',
          exam: schedTest.exam,
          subject: schedTest.subject,
          topic: schedTest.title,
          questions,
          totalQuestions: questions.length,
          timeLimit: Math.min(schedTest.duration, remainingMin),
          marking: schedTest.marking || EXAMS[schedTest.exam].marking,
          scheduledTestId: schedTest.id,
          createdAt: Date.now()
        };
        
        sessionStorage.setItem('currentTest', JSON.stringify(test));
        window.location.hash = '#/student/test';
      });
    });
  }

  // Populate subjects
  function populateSubjects(examId) {
    const subjectSelect = document.getElementById('subject-select');
    const subjects = getSubjects(examId);
    subjectSelect.innerHTML = '<option value="">Select Subject</option>' +
      subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    document.getElementById('topic-select').innerHTML = '<option value="">Select Topic</option>';
    document.getElementById('topic-select').disabled = true;
    document.getElementById('start-topic-test').disabled = true;
  }

  // Update countdown
  function updateCountdown(examId) {
    const days = getDaysUntilExam(examId);
    const el = document.getElementById('exam-countdown');
    const banner = document.getElementById('mock-mode-banner');
    
    if (days !== null && days >= 0) {
      const d = Math.floor(days);
      const hours = Math.floor((days - d) * 24);
      el.innerHTML = `
        <div class="countdown-unit">
          <div class="countdown-value">${d}</div>
          <div class="countdown-label">Days</div>
        </div>
        <div class="countdown-unit">
          <div class="countdown-value">${hours}</div>
          <div class="countdown-label">Hours</div>
        </div>
      `;
      if (isMockTestMode(examId)) banner.style.display = 'block';
    } else {
      el.innerHTML = '<span class="text-muted">Exam date passed</span>';
    }

    const exam = EXAMS[examId];
    document.getElementById('mock-info').textContent = 
      `${exam.totalQuestions}Q • ${exam.duration} min • ${exam.marking.correct > 1 ? '+' + exam.marking.correct + '/' + exam.marking.incorrect : 'No negative marking'}`;
  }

  // Load stats
  async function loadStats(examId) {
    const results = await Store.getTestResults(user.id);
    const examResults = results.filter(r => r.exam === examId);

    document.getElementById('stat-tests').textContent = examResults.length;
    
    if (examResults.length > 0) {
      const avgAcc = Math.round(examResults.reduce((s, r) => s + r.accuracy, 0) / examResults.length);
      const avgScore = Math.round(examResults.reduce((s, r) => s + r.score, 0) / examResults.length);
      document.getElementById('stat-accuracy').textContent = avgAcc + '%';
      document.getElementById('stat-score').textContent = avgScore;
    } else {
      document.getElementById('stat-accuracy').textContent = '-';
      document.getElementById('stat-score').textContent = '-';
    }

    const weakTopics = await Store.getWeakTopics(user.id, examId);
    document.getElementById('stat-weak').textContent = weakTopics.length;

    const weakList = document.getElementById('weak-topics-list');
    if (weakTopics.length > 0) {
      weakList.innerHTML = weakTopics.slice(0, 5).map(t => `
        <div class="topic-card weak" data-topic="${t.topic}" data-subject="${t.subject}">
          <div>
            <div class="font-semibold text-sm">${t.topic}</div>
            <div class="text-xs text-muted">${t.subject} • ${t.totalQ} questions attempted</div>
          </div>
          <span class="badge badge-hard">${t.accuracy}%</span>
        </div>
      `).join('');

      weakList.querySelectorAll('.topic-card').forEach(card => {
        card.addEventListener('click', () => {
          document.getElementById('subject-select').value = card.dataset.subject;
          populateTopics(currentExam, card.dataset.subject);
          setTimeout(() => {
            document.getElementById('topic-select').value = card.dataset.topic;
            document.getElementById('start-topic-test').disabled = false;
          }, 50);
        });
      });
    }

    const recentList = document.getElementById('recent-tests-list');
    if (examResults.length > 0) {
      recentList.innerHTML = examResults.slice(0, 5).map(r => `
        <div class="topic-card" style="cursor: default;">
          <div>
            <div class="font-semibold text-sm">${r.topic || r.type}</div>
            <div class="text-xs text-muted">${formatDate(r.timestamp)} • ${r.totalQuestions}Q</div>
          </div>
          <div class="flex items-center gap-sm">
            <span class="badge ${r.accuracy >= 75 ? 'badge-easy' : r.accuracy >= 50 ? 'badge-medium' : 'badge-hard'}">${r.accuracy}%</span>
            <span class="text-sm font-semibold">${r.score}/${r.totalMarks}</span>
          </div>
        </div>
      `).join('');
    }
  }

  function populateTopics(examId, subject) {
    const topicSelect = document.getElementById('topic-select');
    const topics = getTopics(examId, subject);
    topicSelect.innerHTML = '<option value="">Select Topic</option>' +
      topics.map(t => `<option value="${t}">${t}</option>`).join('');
    topicSelect.disabled = false;
  }

  // Init
  populateSubjects(currentExam);
  updateCountdown(currentExam);
  loadStats(currentExam);
  loadScheduledTests();

  // Auto-refresh scheduled tests every 30 seconds
  const schedRefresh = setInterval(() => loadScheduledTests(), 30000);

  // Exam switch
  document.querySelectorAll('.exam-select-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      currentExam = btn.dataset.exam;
      document.querySelectorAll('.exam-select-btn').forEach(b => {
        b.className = `btn ${b.dataset.exam === currentExam ? 'btn-primary' : 'btn-ghost'} exam-select-btn`;
      });
      document.getElementById('exam-name').textContent = EXAMS[currentExam].name;
      document.getElementById('exam-date').textContent = 'Exam Date: ' + EXAMS[currentExam].examDate;
      populateSubjects(currentExam);
      updateCountdown(currentExam);
      loadStats(currentExam);
      await Store.updateUser(user.id, { selectedExam: currentExam });
    });
  });

  document.getElementById('subject-select').addEventListener('change', (e) => {
    if (e.target.value) {
      populateTopics(currentExam, e.target.value);
    } else {
      document.getElementById('topic-select').innerHTML = '<option value="">Select Topic</option>';
      document.getElementById('topic-select').disabled = true;
      document.getElementById('start-topic-test').disabled = true;
    }
  });

  document.getElementById('topic-select').addEventListener('change', (e) => {
    document.getElementById('start-topic-test').disabled = !e.target.value;
  });

  document.getElementById('start-topic-test').addEventListener('click', async () => {
    const subject = document.getElementById('subject-select').value;
    const topic = document.getElementById('topic-select').value;
    if (!subject || !topic) { showToast('Select a subject and topic first', 'error'); return; }
    try {
      const test = await TestGenerator.generateTopicTest(currentExam, subject, topic, user.id);
      sessionStorage.setItem('currentTest', JSON.stringify(test));
      window.location.hash = '#/student/test';
    } catch (err) { showToast(err.message || 'Failed to generate test', 'error'); }
  });

  document.getElementById('start-mock-test').addEventListener('click', async () => {
    try {
      showToast('Generating mock test...', 'success');
      const test = await TestGenerator.generateMockTest(currentExam, user.id);
      sessionStorage.setItem('currentTest', JSON.stringify(test));
      window.location.hash = '#/student/test';
    } catch (err) { showToast(err.message || 'Failed to generate mock test', 'error'); }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    clearInterval(schedRefresh);
    Store.clearSession();
    window.location.hash = '#/login';
  });
}
