// ================================
// ExamPrep — Admin Panel
// Questions + Users + Scheduling
// ================================

import { EXAMS, getSubjects, getTopics } from '../../data/exams.js';
import { Store } from '../../data/store.js';
import { showToast, generateId, formatDate } from '../../utils/helpers.js';

// Custom confirm dialog (replaces native confirm() which flickers on some browsers)
function showConfirm(message) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;';
    backdrop.innerHTML = `
      <div style="background:var(--bg-card,#1a1f36);border:1px solid var(--border-color,#2a2f4a);border-radius:12px;padding:1.5rem 2rem;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
        <p style="font-size:1rem;margin-bottom:1.25rem;color:#e2e8f0;line-height:1.5;">${message}</p>
        <div style="display:flex;gap:0.75rem;justify-content:flex-end;">
          <button type="button" id="confirm-no" style="padding:0.5rem 1.25rem;border-radius:8px;border:1px solid var(--border-color,#2a2f4a);background:transparent;color:#94a3b8;cursor:pointer;font-size:0.9rem;">Cancel</button>
          <button type="button" id="confirm-yes" style="padding:0.5rem 1.25rem;border-radius:8px;border:none;background:#ef4444;color:white;cursor:pointer;font-size:0.9rem;font-weight:600;">Yes, Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    backdrop.querySelector('#confirm-no').addEventListener('click', () => { backdrop.remove(); resolve(false); });
    backdrop.querySelector('#confirm-yes').addEventListener('click', () => { backdrop.remove(); resolve(true); });
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) { backdrop.remove(); resolve(false); } });
  });
}

export async function renderAdminQuestions(container) {
  const user = Store.getSession();
  if (!user || user.role !== 'admin') { window.location.hash = '#/login'; return; }

  container.innerHTML = `
    <nav class="navbar">
      <span class="nav-brand">ExamPrep</span>
      <div class="nav-user">
        <span class="text-sm text-muted">Admin: ${user.name}</span>
        <div class="nav-avatar">A</div>
        <button class="btn btn-ghost btn-sm" id="logout-btn">Logout</button>
      </div>
    </nav>
    <div class="container page-enter" style="padding-top: 2rem; padding-bottom: 3rem;">
      <div class="tabs mb-lg" id="admin-tabs" style="max-width: 480px;">
        <button class="tab active" data-tab="questions">📝 Questions</button>
        <button class="tab" data-tab="schedule">📅 Schedule</button>
        <button class="tab" data-tab="users">👥 Users</button>
      </div>
      <div id="tab-questions"></div>
      <div id="tab-schedule" style="display: none;"></div>
      <div id="tab-users" style="display: none;"></div>
    </div>
    <style>
      .q-pick-item { display:flex; align-items:center; gap:0.5rem; padding:0.5rem 0.75rem; border-bottom:1px solid var(--border-color); font-size:0.85rem; }
      .q-pick-item:hover { background: var(--bg-glass); }
      .q-pick-item input[type=checkbox] { accent-color: var(--accent-blue); width:16px; height:16px; flex-shrink:0; }
      .q-pick-item label { flex:1; cursor:pointer; }
    </style>
  `;

  // Tab switching
  document.querySelectorAll('#admin-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#admin-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const t = tab.dataset.tab;
      document.getElementById('tab-questions').style.display = t === 'questions' ? '' : 'none';
      document.getElementById('tab-schedule').style.display = t === 'schedule' ? '' : 'none';
      document.getElementById('tab-users').style.display = t === 'users' ? '' : 'none';
      if (t === 'users') loadUsersTab();
      if (t === 'schedule') loadScheduleTab();
    });
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    Store.clearSession();
    window.location.hash = '#/login';
  });

  // Init first tab
  renderQuestionsTab();
  // ================================================
  // SCHEDULE TAB
  // ================================================
  async function loadScheduleTab() {
    const schedTab = document.getElementById('tab-schedule');
    const students = await Store.getStudentsList();
    const allScheduled = await Store.getAllScheduledTests();
    const allQuestions = await Store.getAllQuestions();

    const upcoming = allScheduled.filter(t => t.status === 'scheduled');
    const completed = allScheduled.filter(t => t.status === 'completed');

    schedTab.innerHTML = `
      <div class="grid-2" style="grid-template-columns: 1fr 1fr;">
        <!-- Left: Schedule Form -->
        <div class="card">
          <div class="card-header"><span class="card-title">📅 Schedule a Test</span></div>
          <form id="schedule-form">
            <div class="form-group mb-md">
              <label class="form-label">Test Title / Description</label>
              <input class="form-input" type="text" id="sch-title" placeholder="e.g. Physics Chapter 3 Test" required>
            </div>
            <div class="form-group mb-md">
              <label class="form-label">Assign to Student</label>
              <select class="form-select" id="sch-student" required>
                <option value="">— Select Student —</option>
                ${students.map(s => `<option value="${s.id}">${s.name} (${s.username})</option>`).join('')}
              </select>
            </div>
            <div class="grid-2" style="grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group mb-md">
                <label class="form-label">Exam</label>
                <select class="form-select" id="sch-exam">
                  ${Object.keys(EXAMS).map(id => `<option value="${id}">${EXAMS[id].name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group mb-md">
                <label class="form-label">Subject</label>
                <select class="form-select" id="sch-subject">
                  <option value="">All Subjects</option>
                </select>
              </div>
            </div>
            <div class="form-group mb-md">
              <label class="form-label">Topic</label>
              <select class="form-select" id="sch-topic">
                <option value="">All Topics</option>
              </select>
            </div>
            <div class="grid-2" style="grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group mb-md">
                <label class="form-label">📆 Date</label>
                <input class="form-input" type="date" id="sch-date" required>
              </div>
              <div class="form-group mb-md">
                <label class="form-label">⏰ Start Time</label>
                <input class="form-input" type="time" id="sch-time" required>
              </div>
            </div>
            <div class="grid-2" style="grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group mb-md">
                <label class="form-label">Duration (min)</label>
                <input class="form-input" type="number" id="sch-duration" value="30" min="5" max="240" required>
              </div>
              <div class="form-group mb-md">
                <label class="form-label">Auto-pick count</label>
                <input class="form-input" type="number" id="sch-qcount" value="10" min="0" max="200">
                <span class="text-xs text-muted">Set 0 to use only pasted questions</span>
              </div>
            </div>
            <div class="form-group mb-md">
              <label class="form-label">Difficulty</label>
              <select class="form-select" id="sch-diff">
                <option value="mixed">Mixed (40/40/20)</option>
                <option value="easy">Mostly Easy</option>
                <option value="medium">Mostly Medium</option>
                <option value="hard">Mostly Hard</option>
              </select>
            </div>
            <div class="form-group mb-md">
              <label class="form-label">Instructions (optional)</label>
              <textarea class="form-textarea" id="sch-instructions" rows="2" placeholder="e.g. Focus on numerical problems..."></textarea>
            </div>
            <div class="form-group mb-md">
              <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;margin-bottom:0.5rem;">
                <input type="checkbox" id="sch-revision-check" style="accent-color:var(--accent-blue);width:16px;height:16px;">
                <span class="text-sm font-semibold">📖 Provide Revision Material?</span>
              </label>
              <div id="sch-revision-area" style="display:none;">
                <p class="text-xs text-muted mb-sm">This material will be shown to the student for <strong>5 minutes</strong> before the test starts. No skipping allowed.</p>
                <textarea class="form-textarea" id="sch-revision-material" rows="6" placeholder="Paste revision notes, formulas, key concepts here..."></textarea>
              </div>
            </div>
            <div class="card mb-md" style="padding: 0.75rem; background: var(--bg-glass);">
              <span class="text-xs text-muted">Auto-pick pool: </span>
              <span class="badge badge-blue text-xs" id="sch-pool-count">0</span>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">📅 Schedule Test</button>
          </form>

          <!-- Add New Questions for this test -->
          <div style="margin-top:1.25rem; border-top:1px solid var(--border-color); padding-top:1.25rem;">
            <div class="card-header" style="margin-bottom:0.5rem;">
              <span class="card-title text-sm">➕ Add New Questions for This Test</span>
            </div>
            <p class="text-xs text-muted mb-sm">Paste questions below — they'll be included in this scheduled test.</p>
            <label style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;cursor:pointer;">
              <input type="checkbox" id="sch-add-to-bank" style="accent-color:var(--accent-blue);width:16px;height:16px;">
              <span class="text-xs">Also add these questions to the <strong>Question Bank</strong></span>
            </label>
            <p class="text-xs text-muted mb-md" style="font-family:monospace;">Format: Q: / A: / B: / C: / D: / ANS: / DIFF: / SOL:</p>
            <div class="form-group mb-md">
              <textarea class="form-textarea" id="sch-new-questions" rows="8" placeholder="Q: What is Newton's first law?&#10;A: Law of inertia&#10;B: F=ma&#10;C: Action-reaction&#10;D: None&#10;ANS: A&#10;DIFF: easy&#10;SOL: Newton's first law states..."></textarea>
            </div>
            <div class="text-xs" id="sch-paste-info" style="display:none; color: var(--accent-green);">
              ✅ <span id="sch-paste-count">0</span> questions detected
            </div>
          </div>
        </div>

        <!-- Right: Lists -->
        <div>
          <div class="card mb-md">
            <div class="card-header"><span class="card-title">📋 Upcoming (${upcoming.length})</span></div>
            <div id="upcoming-list">
              ${upcoming.length === 0
                ? '<div class="empty-state" style="padding:1rem;"><p class="text-sm text-muted">No tests scheduled</p></div>'
                : upcoming.map(t => {
                    const st = students.find(s => s.id === t.studentId);
                    const d = new Date(t.scheduledDate);
                    const e = new Date(t.scheduledDate + t.duration * 60000);
                    return `<div class="topic-card" style="margin-bottom:0.5rem;cursor:default;">
                      <div style="flex:1;min-width:0;">
                        <div class="font-semibold text-sm">${t.title}</div>
                        <div class="text-xs text-muted">${st ? st.name : '?'} • ${t.exam} • ${t.questionCount || '?'}Q • ${t.duration}min</div>
                        <div class="text-xs" style="color:var(--accent-blue);">📆 ${d.toLocaleDateString('en-IN',{day:'numeric',month:'short'})} ⏰ ${d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}–${e.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
                        ${t.topics ? `<div class="text-xs text-muted">Topics: ${t.topics.join(', ')}</div>` : ''}
                      </div>
                      <button class="btn btn-ghost btn-sm js-del-sched" data-sid="${t.id}" type="button">🗑️</button>
                    </div>`;
                  }).join('')
              }
            </div>
          </div>
          <div class="card">
            <div class="card-header"><span class="card-title">✅ Completed (${completed.length})</span></div>
            ${completed.length === 0
              ? '<div class="empty-state" style="padding:1rem;"><p class="text-sm text-muted">None yet</p></div>'
              : completed.slice(0,10).map(t => {
                  const st = students.find(s => s.id === t.studentId);
                  return `<div class="topic-card" style="margin-bottom:0.5rem;cursor:default;opacity:0.7;">
                    <div><div class="font-semibold text-sm">${t.title}</div><div class="text-xs text-muted">${st ? st.name : '?'} • ${formatDate(t.scheduledDate)}</div></div>
                    <span class="badge badge-easy">Done</span>
                  </div>`;
                }).join('')
            }
          </div>
        </div>
      </div>
    `;

    // --- Subject/Topic dropdowns ---
    const schExam = document.getElementById('sch-exam');
    const schSubject = document.getElementById('sch-subject');
    const schTopic = document.getElementById('sch-topic');

    function refreshSubjects() {
      const subs = getSubjects(schExam.value);
      schSubject.innerHTML = '<option value="">All Subjects</option>' + subs.map(s => `<option value="${s}">${s}</option>`).join('');
      schTopic.innerHTML = '<option value="">All Topics</option>';
      refreshPool();
    }
    refreshSubjects();

    schExam.addEventListener('change', () => { refreshSubjects(); });
    schSubject.addEventListener('change', () => {
      const sub = schSubject.value;
      if (sub) {
        const tops = getTopics(schExam.value, sub);
        schTopic.innerHTML = '<option value="">All Topics</option>' + tops.map(t => `<option value="${t}">${t}</option>`).join('');
      } else {
        schTopic.innerHTML = '<option value="">All Topics</option>';
      }
      refreshPool();
    });
    schTopic.addEventListener('change', () => { refreshPool(); });

    function getFilteredPool() {
      let pool = allQuestions.filter(q => q.exam === schExam.value);
      if (schSubject.value) pool = pool.filter(q => q.subject === schSubject.value);
      if (schTopic.value) pool = pool.filter(q => q.topic === schTopic.value);
      return pool;
    }

    function refreshPool() {
      document.getElementById('sch-pool-count').textContent = getFilteredPool().length;
    }
    refreshPool();

    // Default date = today, time = 30 min from now
    const now = new Date();
    document.getElementById('sch-date').value = now.toISOString().split('T')[0];
    const m = now.getMinutes() + 30;
    const h = now.getHours() + Math.floor(m / 60);
    document.getElementById('sch-time').value = `${String(h % 24).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}`;

    // --- Live preview of pasted questions ---
    const pasteArea = document.getElementById('sch-new-questions');
    pasteArea.addEventListener('input', () => {
      const txt = pasteArea.value.trim();
      if (!txt) { document.getElementById('sch-paste-info').style.display = 'none'; return; }
      const parsed = parseQuestions(txt, schExam.value, schSubject.value || 'General', schTopic.value || 'General');
      document.getElementById('sch-paste-count').textContent = parsed.length;
      document.getElementById('sch-paste-info').style.display = parsed.length > 0 ? 'block' : 'none';
    });

    // --- Revision material toggle ---
    document.getElementById('sch-revision-check').addEventListener('change', (e) => {
      document.getElementById('sch-revision-area').style.display = e.target.checked ? 'block' : 'none';
    });

    // --- Schedule submit ---
    document.getElementById('schedule-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('sch-title').value.trim();
      const studentId = document.getElementById('sch-student').value;
      const exam = schExam.value;
      const subject = schSubject.value;
      const topic = schTopic.value;
      const date = document.getElementById('sch-date').value;
      const time = document.getElementById('sch-time').value;
      const duration = parseInt(document.getElementById('sch-duration').value);
      const autoCount = parseInt(document.getElementById('sch-qcount').value) || 0;
      const difficultyMix = document.getElementById('sch-diff').value;
      const instructions = document.getElementById('sch-instructions').value.trim();
      const pastedText = document.getElementById('sch-new-questions').value.trim();

      if (!title || !studentId || !date || !time) { showToast('Fill title, student, date & time', 'error'); return; }

      const scheduledDate = new Date(`${date}T${time}`).getTime();
      if (isNaN(scheduledDate)) { showToast('Invalid date/time', 'error'); return; }

      // 1. Parse pasted questions — optionally save to question bank
      const addToBank = document.getElementById('sch-add-to-bank').checked;
      const newQuestionIds = [];
      let parsedNewQuestions = [];
      if (pastedText) {
        parsedNewQuestions = parseQuestions(pastedText, exam, subject || 'General', topic || 'General');
        if (parsedNewQuestions.length > 0) {
          if (addToBank) {
            const savedIds = await Store.addQuestionsBulk(parsedNewQuestions);
            newQuestionIds.push(...savedIds);
            showToast(`${parsedNewQuestions.length} new questions added to question bank!`, 'success');
          } else {
            // Use temporary IDs — questions only live in this test
            parsedNewQuestions.forEach(q => newQuestionIds.push(q.id));
          }
        }
      }

      // 2. Auto-pick from existing pool
      const finalIds = [...newQuestionIds];
      if (autoCount > 0) {
        const latestQuestions = await Store.getAllQuestions();
        let pool = latestQuestions.filter(q => q.exam === exam && !finalIds.includes(q.id));
        if (subject) pool = pool.filter(q => q.subject === subject);
        if (topic) pool = pool.filter(q => q.topic === topic);
        let picked = [];
        if (difficultyMix === 'mixed') {
          const ey = shuffle(pool.filter(q => q.difficulty === 'easy'));
          const md = shuffle(pool.filter(q => q.difficulty === 'medium'));
          const hd = shuffle(pool.filter(q => q.difficulty === 'hard'));
          const eC = Math.ceil(autoCount * 0.4), mC = Math.ceil(autoCount * 0.4), hC = autoCount - eC - mC;
          picked = [...ey.slice(0, eC), ...md.slice(0, mC), ...hd.slice(0, hC)];
        } else {
          const pref = shuffle(pool.filter(q => q.difficulty === difficultyMix));
          const rest = shuffle(pool.filter(q => q.difficulty !== difficultyMix));
          picked = [...pref, ...rest];
        }
        if (picked.length < autoCount) {
          const usedIds = new Set(picked.map(q => q.id));
          picked = [...picked, ...shuffle(pool.filter(q => !usedIds.has(q.id)))];
        }
        picked.slice(0, autoCount).forEach(q => { if (!finalIds.includes(q.id)) finalIds.push(q.id); });
      }

      if (finalIds.length === 0) { showToast('No questions! Paste some questions or increase auto-pick count.', 'error'); return; }

      const testData = {
        title, studentId, exam,
        subject: subject || 'All',
        topics: topic ? [topic] : ['All Topics'],
        scheduledDate, duration,
        questionCount: finalIds.length,
        questionIds: finalIds,
        difficultyMix, instructions,
        marking: EXAMS[exam].marking
      };

      // Revision material
      const hasRevision = document.getElementById('sch-revision-check').checked;
      const revisionText = document.getElementById('sch-revision-material').value.trim();
      if (hasRevision && revisionText) {
        testData.revisionMaterial = revisionText;
      }

      // If NOT adding to bank, embed the full question data in the test so they're available
      if (!addToBank && parsedNewQuestions.length > 0) {
        testData.embeddedQuestions = {};
        parsedNewQuestions.forEach(q => { testData.embeddedQuestions[q.id] = q; });
      }

      try {
        await Store.createScheduledTest(testData);
        showToast(`"${title}" scheduled with ${finalIds.length} questions!`, 'success');
        loadScheduleTab();
      } catch (err) { showToast('Failed: ' + err.message, 'error'); }
    });

    // --- Delete scheduled tests ---
    schedTab.querySelectorAll('.js-del-sched').forEach(btn => {
      btn.addEventListener('click', async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const id = btn.getAttribute('data-sid');
        if (!id) return;
        const ok = await showConfirm('Cancel this scheduled test?');
        if (ok) {
          try {
            await Store.deleteScheduledTest(id);
            showToast('Cancelled', 'success');
            loadScheduleTab();
          } catch (err) { showToast('Delete failed: ' + err.message, 'error'); }
        }
      });
    });
  }

  // ================================================
  // USERS TAB
  // ================================================
  async function loadUsersTab() {
    const tab = document.getElementById('tab-users');
    const students = await Store.getStudentsList();
    const parents = await Store.getParentsList();

    tab.innerHTML = `
      <div class="grid-2" style="grid-template-columns: 1fr 1fr;">
        <div class="card mb-md">
          <div class="card-header"><span class="card-title">➕ Add Student</span></div>
          <form id="add-student-form">
            <div class="form-group mb-md"><label class="form-label">Name</label><input class="form-input" type="text" id="st-name" placeholder="e.g. Priya" required></div>
            <div class="form-group mb-md"><label class="form-label">Username</label><input class="form-input" type="text" id="st-username" placeholder="e.g. priya2026" required></div>
            <div class="form-group mb-md"><label class="form-label">Password</label><input class="form-input" type="text" id="st-password" placeholder="e.g. priya@123" required></div>
            <div class="form-group mb-md"><label class="form-label">Exam</label>
              <select class="form-select" id="st-exam">${Object.keys(EXAMS).map(id => `<option value="${id}">${EXAMS[id].name}</option>`).join('')}</select>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;">Create Student</button>
          </form>
        </div>
        <div class="card mb-md">
          <div class="card-header"><span class="card-title">➕ Add Parent</span></div>
          <form id="add-parent-form">
            <div class="form-group mb-md"><label class="form-label">Name</label><input class="form-input" type="text" id="pr-name" placeholder="e.g. Mr. Sharma" required></div>
            <div class="form-group mb-md"><label class="form-label">Username</label><input class="form-input" type="text" id="pr-username" placeholder="e.g. sharma_parent" required></div>
            <div class="form-group mb-md"><label class="form-label">Password</label><input class="form-input" type="text" id="pr-password" placeholder="e.g. parent@123" required></div>
            <div class="form-group mb-md"><label class="form-label">Link to Student</label>
              <select class="form-select" id="pr-linked-student">
                <option value="">— Select Student —</option>
                ${students.map(s => `<option value="${s.id}">${s.name} (${s.username})</option>`).join('')}
              </select>
            </div>
            <button type="submit" class="btn btn-success" style="width:100%;">Create Parent</button>
          </form>
        </div>
      </div>
      <div class="card mb-md">
        <div class="card-header"><span class="card-title">🎓 Students (${students.length})</span></div>
        <div id="students-table-wrap">
        ${students.length === 0 ? '<p class="text-sm text-muted" style="padding:1rem;">No students yet.</p>' :
          `<div class="table-container"><table><thead><tr><th>Name</th><th>Username</th><th>Password</th><th>Exam</th><th></th></tr></thead>
          <tbody>${students.map(s => `<tr>
            <td class="font-semibold">${s.name}</td>
            <td><code style="background:var(--bg-glass);padding:0.15rem 0.5rem;border-radius:4px;font-size:0.8rem;">${s.username}</code></td>
            <td><code style="background:var(--bg-glass);padding:0.15rem 0.5rem;border-radius:4px;font-size:0.8rem;">${s.password}</code></td>
            <td><span class="badge badge-blue">${s.selectedExam||'NEET'}</span></td>
            <td><button class="btn btn-ghost btn-sm js-del-user" data-uid="${s.id}" data-uname="${s.name}" type="button">🗑️</button></td>
          </tr>`).join('')}</tbody></table></div>`}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">👨‍👩‍👧 Parents (${parents.length})</span></div>
        <div id="parents-table-wrap">
        ${parents.length === 0 ? '<p class="text-sm text-muted" style="padding:1rem;">No parents yet.</p>' :
          `<div class="table-container"><table><thead><tr><th>Name</th><th>Username</th><th>Password</th><th>Linked Student</th><th></th></tr></thead>
          <tbody>${parents.map(p => {
            const linked = students.find(s => s.id === p.linkedStudent);
            return `<tr>
              <td class="font-semibold">${p.name}</td>
              <td><code style="background:var(--bg-glass);padding:0.15rem 0.5rem;border-radius:4px;font-size:0.8rem;">${p.username}</code></td>
              <td><code style="background:var(--bg-glass);padding:0.15rem 0.5rem;border-radius:4px;font-size:0.8rem;">${p.password}</code></td>
              <td>${linked ? `<span class="badge badge-purple">${linked.name}</span>` : '<span class="text-muted text-xs">—</span>'}</td>
              <td><button class="btn btn-ghost btn-sm js-del-user" data-uid="${p.id}" data-uname="${p.name}" type="button">🗑️</button></td>
            </tr>`;
          }).join('')}</tbody></table></div>`}
        </div>
      </div>
    `;

    // --- Add Student ---
    document.getElementById('add-student-form').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const name = document.getElementById('st-name').value.trim();
      const username = document.getElementById('st-username').value.trim();
      const password = document.getElementById('st-password').value.trim();
      const selectedExam = document.getElementById('st-exam').value;
      if (!name||!username||!password) { showToast('Fill all fields','error'); return; }
      if (await Store.isUsernameTaken(username)) { showToast('Username taken!','error'); return; }
      try {
        await Store.addStudent({ username, password, name, selectedExam });
        showToast(`Student "${name}" created!`,'success');
        loadUsersTab();
      } catch(err) { showToast('Error: '+err.message,'error'); }
    });

    // --- Add Parent ---
    document.getElementById('add-parent-form').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const name = document.getElementById('pr-name').value.trim();
      const username = document.getElementById('pr-username').value.trim();
      const password = document.getElementById('pr-password').value.trim();
      const linkedStudent = document.getElementById('pr-linked-student').value;
      if (!name||!username||!password) { showToast('Fill all fields','error'); return; }
      if (!linkedStudent) { showToast('Link to a student','error'); return; }
      if (await Store.isUsernameTaken(username)) { showToast('Username taken!','error'); return; }
      try {
        await Store.addParent({ username, password, name, linkedStudent });
        showToast(`Parent "${name}" created!`,'success');
        loadUsersTab();
      } catch(err) { showToast('Error: '+err.message,'error'); }
    });

    // --- Delete Users ---
    tab.querySelectorAll('.js-del-user').forEach(btn => {
      btn.addEventListener('click', async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const uid = btn.getAttribute('data-uid');
        const uname = btn.getAttribute('data-uname');
        if (!uid) return;
        const ok = await showConfirm(`Delete "${uname}"? This cannot be undone.`);
        if (ok) {
          try {
            await Store.deleteUser(uid);
            showToast(`"${uname}" deleted`,'success');
            loadUsersTab();
          } catch(err) { showToast('Delete failed: '+err.message,'error'); }
        }
      });
    });
  }

  // ================================================
  // QUESTIONS TAB
  // ================================================
  function renderQuestionsTab() {
    const qTab = document.getElementById('tab-questions');
    qTab.innerHTML = `
      <div style="display:grid;grid-template-columns:340px minmax(0,1fr);gap:1rem;">
        <div style="min-width:0;">
          <div class="card mb-md">
            <div class="card-header"><span class="card-title">Add Questions</span></div>
            <div class="form-group mb-md"><label class="form-label">Exam</label>
              <select class="form-select" id="admin-exam">${Object.keys(EXAMS).map(id => `<option value="${id}">${EXAMS[id].name}</option>`).join('')}</select>
            </div>
            <div class="form-group mb-md"><label class="form-label">Subject</label>
              <select class="form-select" id="admin-subject"><option value="">Select Subject</option></select>
            </div>
            <div class="form-group mb-md"><label class="form-label">Topic</label>
              <select class="form-select" id="admin-topic"><option value="">Select Topic</option></select>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><span class="card-title">Bulk Paste</span></div>
            <p class="text-xs text-muted mb-md">Format: Q: / A: / B: / C: / D: / ANS: / DIFF: / SOL:</p>
            <div class="form-group mb-md"><textarea class="form-textarea" id="bulk-input" rows="12" placeholder="Paste questions here..."></textarea></div>
            <div class="flex gap-sm">
              <button class="btn btn-primary" id="parse-btn" style="flex:1;">📋 Parse & Preview</button>
              <button class="btn btn-ghost" id="clear-input-btn">Clear</button>
            </div>
            <div id="preview-area" class="mt-lg" style="display:none;">
              <div class="card-header"><span class="card-title text-sm">Preview (<span id="preview-count">0</span>Q)</span>
                <button class="btn btn-success btn-sm" id="save-questions-btn">💾 Save All</button>
              </div>
              <div id="preview-list" style="max-height:350px;overflow-y:auto;"></div>
            </div>
          </div>
        </div>
        <div style="min-width:0;overflow:hidden;">
          <div class="card mb-md">
            <div class="card-header"><span class="card-title">📊 Stats</span><button class="btn btn-ghost btn-sm" id="refresh-stats">↻</button></div>
            <div id="stats-content"><div class="loading-screen" style="min-height:60px;"><div class="spinner"></div></div></div>
          </div>
          <div class="card" style="overflow:hidden;">
            <div class="card-header"><span class="card-title">📚 Questions</span><span class="text-xs text-muted" id="total-q-count"></span></div>
            <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);gap:0.5rem;margin-bottom:0.75rem;">
              <select class="form-select" id="filter-exam" style="font-size:0.8rem;padding:0.5rem 0.75rem;min-width:0;">
                <option value="">All Exams</option>
                ${Object.keys(EXAMS).map(id => `<option value="${id}">${EXAMS[id].name}</option>`).join('')}
              </select>
              <select class="form-select" id="filter-subject" style="font-size:0.8rem;padding:0.5rem 0.75rem;min-width:0;">
                <option value="">All Subjects</option>
              </select>
              <select class="form-select" id="filter-topic" style="font-size:0.8rem;padding:0.5rem 0.75rem;min-width:0;">
                <option value="">All Topics</option>
              </select>
            </div>
            <div class="form-group mb-md"><input class="form-input" type="text" id="search-questions" placeholder="Search..."></div>
            <div id="questions-list" style="max-height:450px;overflow-y:auto;"><div class="loading-screen" style="min-height:60px;"><div class="spinner"></div></div></div>
          </div>
        </div>
      </div>
    `;

    let parsedQuestions = [];
    let curExam = Object.keys(EXAMS)[0];

    function popSubs(eid) {
      document.getElementById('admin-subject').innerHTML = '<option value="">Select Subject</option>' + getSubjects(eid).map(s => `<option value="${s}">${s}</option>`).join('');
      document.getElementById('admin-topic').innerHTML = '<option value="">Select Topic</option>';
    }
    popSubs(curExam);

    document.getElementById('admin-exam').addEventListener('change', e => { curExam = e.target.value; popSubs(curExam); });
    document.getElementById('admin-subject').addEventListener('change', e => {
      document.getElementById('admin-topic').innerHTML = '<option value="">Select Topic</option>' + getTopics(curExam, e.target.value).map(t => `<option value="${t}">${t}</option>`).join('');
    });

    document.getElementById('parse-btn').addEventListener('click', () => {
      const exam = document.getElementById('admin-exam').value;
      const subject = document.getElementById('admin-subject').value;
      const topic = document.getElementById('admin-topic').value;
      const input = document.getElementById('bulk-input').value.trim();
      if (!subject||!topic) { showToast('Select subject & topic','error'); return; }
      if (!input) { showToast('Paste questions','error'); return; }
      parsedQuestions = parseQuestions(input, exam, subject, topic);
      if (!parsedQuestions.length) { showToast('Could not parse. Check format.','error'); return; }
      document.getElementById('preview-area').style.display = 'block';
      document.getElementById('preview-count').textContent = parsedQuestions.length;
      const lbl = ['A','B','C','D'];
      document.getElementById('preview-list').innerHTML = parsedQuestions.map((q,i) => `
        <div style="padding:0.75rem;border-bottom:1px solid var(--border-color);">
          <div class="flex items-center justify-between mb-sm"><span class="font-semibold text-sm">Q${i+1}</span><span class="badge badge-${q.difficulty==='easy'?'easy':q.difficulty==='medium'?'medium':'hard'}">${q.difficulty}</span></div>
          <p class="text-sm mb-sm">${q.question}</p>
          <div class="text-xs text-muted">${q.options.map((o,j) => `${lbl[j]}:${o}${j===q.correctAnswer?' ✓':''}`).join(' | ')}</div>
          ${q.solution ? `<p class="text-xs text-muted mt-sm" style="font-style:italic;">Sol: ${q.solution}</p>` : ''}
        </div>
      `).join('');
      showToast(`Parsed ${parsedQuestions.length}Q`,'success');
    });

    document.getElementById('save-questions-btn').addEventListener('click', async () => {
      if (!parsedQuestions.length) return;
      await Store.addQuestionsBulk(parsedQuestions);
      showToast(`Saved ${parsedQuestions.length}Q!`,'success');
      document.getElementById('bulk-input').value = '';
      document.getElementById('preview-area').style.display = 'none';
      parsedQuestions = [];
      loadStats(); loadQL();
    });
    document.getElementById('clear-input-btn').addEventListener('click', () => {
      document.getElementById('bulk-input').value = '';
      document.getElementById('preview-area').style.display = 'none';
      parsedQuestions = [];
    });

    // --- Filter dropdowns for Questions list ---
    const filterExam = document.getElementById('filter-exam');
    const filterSubject = document.getElementById('filter-subject');
    const filterTopic = document.getElementById('filter-topic');

    filterExam.addEventListener('change', () => {
      const ex = filterExam.value;
      if (ex) {
        const subs = getSubjects(ex);
        filterSubject.innerHTML = '<option value="">All Subjects</option>' + subs.map(s => `<option value="${s}">${s}</option>`).join('');
      } else {
        filterSubject.innerHTML = '<option value="">All Subjects</option>';
      }
      filterTopic.innerHTML = '<option value="">All Topics</option>';
      loadQL();
    });

    filterSubject.addEventListener('change', () => {
      const ex = filterExam.value;
      const sub = filterSubject.value;
      if (ex && sub) {
        const tops = getTopics(ex, sub);
        filterTopic.innerHTML = '<option value="">All Topics</option>' + tops.map(t => `<option value="${t}">${t}</option>`).join('');
      } else {
        filterTopic.innerHTML = '<option value="">All Topics</option>';
      }
      loadQL();
    });

    filterTopic.addEventListener('change', () => { loadQL(); });

    async function loadStats() {
      const el = document.getElementById('stats-content');
      const all = await Store.getAllQuestions();
      const st = {};
      all.forEach(q => { if(!st[q.exam]) st[q.exam]={total:0,subjects:{}}; st[q.exam].total++; if(!st[q.exam].subjects[q.subject]) st[q.exam].subjects[q.subject]=0; st[q.exam].subjects[q.subject]++; });
      el.innerHTML = Object.entries(st).map(([ex,d]) => `
        <div style="margin-bottom:0.75rem;"><div class="flex items-center justify-between mb-sm"><span class="font-semibold text-sm">${ex}</span><span class="badge badge-blue">${d.total}</span></div>
        ${Object.entries(d.subjects).map(([s,c]) => `<div class="flex items-center justify-between text-xs text-muted" style="padding:0.2rem 0;"><span>${s}</span><span>${c}Q</span></div>`).join('')}</div>
      `).join('') || '<p class="text-sm text-muted">No questions.</p>';
    }

    function getFilteredQuestions(allQuestions) {
      let filtered = allQuestions;
      const fExam = filterExam.value;
      const fSubject = filterSubject.value;
      const fTopic = filterTopic.value;
      if (fExam) filtered = filtered.filter(q => q.exam === fExam);
      if (fSubject) filtered = filtered.filter(q => q.subject === fSubject);
      if (fTopic) filtered = filtered.filter(q => q.topic === fTopic);
      return filtered;
    }

    async function loadQL() {
      const el = document.getElementById('questions-list');
      const all = await Store.getAllQuestions();
      const filtered = getFilteredQuestions(all);
      document.getElementById('total-q-count').textContent = `${filtered.length}Q`;
      if (!filtered.length) { el.innerHTML = '<p class="text-sm text-muted" style="padding:1rem;">No questions found</p>'; return; }
      renderQL(filtered);
    }

    function renderQL(qs) {
      const el = document.getElementById('questions-list');
      el.innerHTML = qs.slice(0,50).map(q => `
        <div class="topic-card" style="margin-bottom:0.5rem;cursor:default;overflow:hidden;">
          <div style="flex:1;min-width:0;overflow:hidden;"><div class="text-sm font-semibold" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${q.question}</div>
          <div class="text-xs text-muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${q.exam} • ${q.subject} • ${q.topic}</div></div>
          <div class="flex items-center gap-sm" style="flex-shrink:0;margin-left:0.5rem;"><span class="badge badge-${q.difficulty==='easy'?'easy':q.difficulty==='medium'?'medium':'hard'}">${q.difficulty}</span>
          <button class="btn btn-ghost btn-sm js-del-q" data-qid="${q.id}" type="button">🗑️</button></div>
        </div>
      `).join('');
      // Delete buttons
      el.querySelectorAll('.js-del-q').forEach(btn => {
        btn.addEventListener('click', async (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          const qid = btn.getAttribute('data-qid');
          const ok = await showConfirm('Delete this question?');
          if (ok) {
            await Store.deleteQuestion(qid);
            showToast('Deleted','success');
            loadStats(); loadQL();
          }
        });
      });
    }

    document.getElementById('search-questions').addEventListener('input', async e => {
      const s = e.target.value.toLowerCase().trim();
      const all = await Store.getAllQuestions();
      const filtered = getFilteredQuestions(all);
      if (!s) { renderQL(filtered); return; }
      renderQL(filtered.filter(q => q.question.toLowerCase().includes(s)||q.topic.toLowerCase().includes(s)||q.subject.toLowerCase().includes(s)));
    });
    document.getElementById('refresh-stats').addEventListener('click', () => { loadStats(); loadQL(); });
    loadStats(); loadQL();
  }
}

// --- Helpers ---
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function parseQuestions(input, exam, subject, topic) {
  const questions = [];
  const blocks = input.split(/\n\s*\n/).filter(b => b.trim());
  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim());
    let question='',solution='',difficulty='medium',correctAnswer=0;
    const options = [];
    for (const line of lines) {
      if (line.match(/^Q:\s*/i)) question = line.replace(/^Q:\s*/i,'').trim();
      else if (line.match(/^A:\s*/i)) options[0] = line.replace(/^A:\s*/i,'').trim();
      else if (line.match(/^B:\s*/i)) options[1] = line.replace(/^B:\s*/i,'').trim();
      else if (line.match(/^C:\s*/i)) options[2] = line.replace(/^C:\s*/i,'').trim();
      else if (line.match(/^D:\s*/i)) options[3] = line.replace(/^D:\s*/i,'').trim();
      else if (line.match(/^ANS:\s*/i)) { const a = line.replace(/^ANS:\s*/i,'').trim().toUpperCase(); correctAnswer = {'A':0,'B':1,'C':2,'D':3}[a]??0; }
      else if (line.match(/^DIFF:\s*/i)) { difficulty = line.replace(/^DIFF:\s*/i,'').trim().toLowerCase(); if (!['easy','medium','hard'].includes(difficulty)) difficulty='medium'; }
      else if (line.match(/^SOL:\s*/i)) solution = line.replace(/^SOL:\s*/i,'').trim();
    }
    if (question && options.length===4 && options.every(o=>o)) {
      questions.push({ id: generateId('q'), exam, subject, topic, question, options, correctAnswer, difficulty, solution });
    }
  }
  return questions;
}
