// ================================
// ExamPrep — Firebase Data Store
// with localStorage fallback
// ================================

import { SAMPLE_QUESTIONS } from './sampleQuestions.js';

// ---- Firebase Config ----
// REPLACE THESE with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAz3RfiZ0NdOUqps9GoTsx7fIJGOJ36Ieg",
  authDomain: "examprep-44ab4.firebaseapp.com",
  databaseURL: "https://examprep-44ab4-default-rtdb.firebaseio.com",
  projectId: "examprep-44ab4",
  storageBucket: "examprep-44ab4.firebasestorage.app",
  messagingSenderId: "1082334962458",
  appId: "1:1082334962458:web:eb62104882ea108e4942a3",
  measurementId: "G-DCKVJ981BL"
};

// Detect placeholder config
function isConfigValid() {
  return firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes('YOUR_') &&
    firebaseConfig.projectId;
}

// Initialize Firebase
let db = null;
let firebaseReady = false;

function initFirebase() {
  if (!isConfigValid()) {
    console.warn('Firebase config has placeholders — using localStorage fallback.');
    firebaseReady = false;
    return;
  }
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.database();
      if (typeof firebase.analytics === 'function') {
        firebase.analytics();
      }
      firebaseReady = true;
      console.log('Firebase initialized successfully');
    } else {
      console.warn('Firebase SDK not loaded — using localStorage fallback.');
      firebaseReady = false;
    }
  } catch (err) {
    console.warn('Firebase init failed, using localStorage fallback:', err.message);
    firebaseReady = false;
  }
}

initFirebase();

// ---- localStorage helpers ----
function lsGet() {
  try { return JSON.parse(localStorage.getItem('examprep_data') || '{}'); }
  catch { return {}; }
}
function lsSave(store) {
  localStorage.setItem('examprep_data', JSON.stringify(store));
}

function setNestedValue(obj, path, value) {
  const parts = path.split('/').filter(Boolean);
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  if (value === null || value === undefined) {
    delete current[parts[parts.length - 1]];
  } else {
    current[parts[parts.length - 1]] = value;
  }
}

function getNestedValue(obj, path) {
  const parts = path.split('/').filter(Boolean);
  let current = obj;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return null;
    current = current[part];
  }
  return current ?? null;
}

// ---- Unified data access ----
async function fbSet(path, data) {
  if (firebaseReady) {
    try { await db.ref(path).set(data); return; }
    catch (e) { console.warn('FB set failed, falling back:', e.message); }
  }
  const store = lsGet();
  setNestedValue(store, path, data);
  lsSave(store);
}

async function fbGet(path) {
  if (firebaseReady) {
    try {
      const snap = await db.ref(path).once('value');
      return snap.val();
    } catch (e) { console.warn('FB get failed, falling back:', e.message); }
  }
  return getNestedValue(lsGet(), path);
}

async function fbPush(path, data) {
  if (firebaseReady) {
    try {
      const ref = await db.ref(path).push(data);
      return ref.key;
    } catch (e) { console.warn('FB push failed, falling back:', e.message); }
  }
  const store = lsGet();
  const current = getNestedValue(store, path) || {};
  const key = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  current[key] = data;
  setNestedValue(store, path, current);
  lsSave(store);
  return key;
}

async function fbUpdate(path, data) {
  if (firebaseReady) {
    try { await db.ref(path).update(data); return; }
    catch (e) { console.warn('FB update failed, falling back:', e.message); }
  }
  const store = lsGet();
  const current = getNestedValue(store, path) || {};
  Object.assign(current, data);
  setNestedValue(store, path, current);
  lsSave(store);
}

async function fbRemove(path) {
  if (firebaseReady) {
    try { await db.ref(path).remove(); return; }
    catch (e) { console.warn('FB remove failed, falling back:', e.message); }
  }
  try {
    const store = lsGet();
    setNestedValue(store, path, null);
    lsSave(store);
  } catch (e) {
    console.error('fbRemove localStorage error:', e);
  }
}

// ===============================
// PUBLIC API
// ===============================

export const Store = {
  // ---- Initialization ----
  async init() {
    // Seed default admin if no users exist
    const users = await fbGet('users');
    if (!users) {
      await fbSet('users', {
        admin1: {
          id: 'admin1',
          username: 'vishwas*2005',
          password: 'vishu1010a',
          role: 'admin',
          name: 'Vishwas (Admin)',
          createdAt: Date.now()
        }
      });
    }

    // Seed sample questions if none exist
    const questions = await fbGet('questions');
    if (!questions) {
      const qMap = {};
      SAMPLE_QUESTIONS.forEach(q => {
        qMap[q.id] = q;
      });
      await fbSet('questions', qMap);
    }
  },

  // ---- Authentication ----
  async authenticate(username, password) {
    const users = await fbGet('users');
    if (!users) return null;
    for (const [id, user] of Object.entries(users)) {
      if (user.username === username && user.password === password) {
        return { ...user, id };
      }
    }
    return null;
  },

  // Session management (always localStorage — per browser)
  setSession(user) {
    localStorage.setItem('examprep_session', JSON.stringify(user));
  },

  getSession() {
    try {
      return JSON.parse(localStorage.getItem('examprep_session'));
    } catch {
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem('examprep_session');
  },

  // ---- User Management ----
  async getUser(userId) {
    return await fbGet(`users/${userId}`);
  },

  async updateUser(userId, updates) {
    await fbUpdate(`users/${userId}`, updates);
    const session = this.getSession();
    if (session && session.id === userId) {
      this.setSession({ ...session, ...updates });
    }
  },

  async getAllUsers() {
    const users = await fbGet('users');
    if (!users) return [];
    return Object.entries(users).map(([id, u]) => ({ ...u, id }));
  },

  async getStudentsList() {
    const all = await this.getAllUsers();
    return all.filter(u => u.role === 'student');
  },

  async getParentsList() {
    const all = await this.getAllUsers();
    return all.filter(u => u.role === 'parent');
  },

  async addStudent({ username, password, name, selectedExam }) {
    const id = 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const student = {
      id, username, password, name,
      role: 'student',
      selectedExam: selectedExam || 'NEET',
      createdAt: Date.now()
    };
    await fbSet(`users/${id}`, student);
    return student;
  },

  async addParent({ username, password, name, linkedStudent }) {
    const id = 'parent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const parent = {
      id, username, password, name,
      role: 'parent',
      linkedStudent: linkedStudent || '',
      createdAt: Date.now()
    };
    await fbSet(`users/${id}`, parent);
    return parent;
  },

  async deleteUser(userId) {
    try {
      await fbRemove(`users/${userId}`);
    } catch (e) {
      console.error('deleteUser error:', e);
      throw e;
    }
  },

  async isUsernameTaken(username) {
    const all = await this.getAllUsers();
    return all.some(u => u.username === username);
  },

  // ---- Questions ----
  async getAllQuestions() {
    const questions = await fbGet('questions');
    if (!questions) return [];
    return Object.values(questions);
  },

  async getQuestions(filters = {}) {
    const all = await this.getAllQuestions();
    return all.filter(q => {
      if (filters.exam && q.exam !== filters.exam) return false;
      if (filters.subject && q.subject !== filters.subject) return false;
      if (filters.topic && q.topic !== filters.topic) return false;
      if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
      return true;
    });
  },

  async addQuestion(question) {
    const id = question.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    question.id = id;
    question.createdAt = Date.now();
    await fbSet(`questions/${id}`, question);
    return id;
  },

  async addQuestionsBulk(questions) {
    const ids = [];
    for (const q of questions) {
      const id = await this.addQuestion(q);
      ids.push(id);
    }
    return ids;
  },

  async deleteQuestion(questionId) {
    try {
      await fbRemove(`questions/${questionId}`);
    } catch (e) {
      console.error('deleteQuestion error:', e);
      throw e;
    }
  },

  async getQuestionStats(examId) {
    const questions = await this.getQuestions({ exam: examId });
    const stats = {};
    questions.forEach(q => {
      const key = `${q.subject}|${q.topic}`;
      if (!stats[key]) {
        stats[key] = { subject: q.subject, topic: q.topic, total: 0, easy: 0, medium: 0, hard: 0 };
      }
      stats[key].total++;
      stats[key][q.difficulty]++;
    });
    return Object.values(stats);
  },

  // ---- Test Results (flag-based incremental saves) ----

  // Step 1: Called when test STARTS — saves ALL questions with answered:0
  async initTestResult(userId, testMeta, questions) {
    const questionResults = questions.map(q => ({
      questionId: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: null,
      isCorrect: false,
      isUnanswered: true,
      answered: 0,
      topic: q.topic,
      subject: q.subject,
      difficulty: q.difficulty,
      solution: q.solution || ''
    }));

    const entry = {
      status: 'in-progress',
      timestamp: Date.now(),
      userId,
      testId: testMeta.testId || '',
      type: testMeta.type || 'topic',
      exam: testMeta.exam || '',
      subject: testMeta.subject || '',
      topic: testMeta.topic || '',
      scheduledTestId: testMeta.scheduledTestId || '',
      totalQuestions: testMeta.totalQuestions || 0,
      timeLimit: testMeta.timeLimit || 0,
      marking: testMeta.marking || {},
      questionResults
    };
    try {
      const key = await fbPush(`testResults/${userId}`, entry);
      return key;
    } catch (e) {
      console.error('initTestResult failed:', e);
      return null;
    }
  },

  // Step 2: Called when student selects/changes an option — just update answer + flag
  async saveAnswerToResult(userId, resultKey, questionIndex, userAnswer, correctAnswer) {
    if (!resultKey) return false;
    try {
      await fbUpdate(`testResults/${userId}/${resultKey}/questionResults/${questionIndex}`, {
        userAnswer,
        isCorrect: userAnswer === correctAnswer,
        isUnanswered: false,
        answered: 1
      });
      return true;
    } catch (e) {
      console.warn('saveAnswerToResult failed:', e.message);
      return false;
    }
  },

  // Step 2b: Called when student clears an answer — flip flag back
  async clearAnswerInResult(userId, resultKey, questionIndex) {
    if (!resultKey) return false;
    try {
      await fbUpdate(`testResults/${userId}/${resultKey}/questionResults/${questionIndex}`, {
        userAnswer: null,
        isCorrect: false,
        isUnanswered: true,
        answered: 0
      });
      return true;
    } catch (e) {
      console.warn('clearAnswerInResult failed:', e.message);
      return false;
    }
  },

  // Step 3: Called on submit — only writes the small summary stats
  async finalizeTestResult(userId, resultKey, summaryData) {
    if (!resultKey) return;
    try {
      await fbUpdate(`testResults/${userId}/${resultKey}`, {
        ...summaryData,
        status: 'completed',
        timestamp: Date.now()
      });
    } catch (e) {
      console.error('finalizeTestResult failed:', e);
      throw e;
    }
  },

  // Legacy: still used as fallback if initTestResult wasn't called
  async saveTestResult(userId, result) {
    result.timestamp = Date.now();
    result.userId = userId;
    try {
      const key = await fbPush(`testResults/${userId}`, result);
      return key;
    } catch (e) {
      console.error('saveTestResult failed:', e);
      try {
        const minimal = { ...result };
        delete minimal.questionResults;
        const key = await fbPush(`testResults/${userId}`, minimal);
        console.warn('Saved test result without questionResults (fallback)');
        return key;
      } catch (e2) {
        console.error('saveTestResult fallback also failed:', e2);
        throw e2;
      }
    }
  },

  // Auto-delete solutions from test results older than 3 days to save memory
  async cleanupOldSolutions(userId) {
    try {
      const results = await fbGet(`testResults/${userId}`);
      if (!results) return;

      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      let cleaned = 0;

      for (const [key, result] of Object.entries(results)) {
        if (result.timestamp && result.timestamp < threeDaysAgo && result.questionResults) {
          // Remove solutions from old results but keep everything else
          const trimmedQR = result.questionResults.map(q => {
            const { solution, ...rest } = (typeof q === 'object' && q) ? q : {};
            return rest;
          });
          await fbUpdate(`testResults/${userId}/${key}`, { questionResults: trimmedQR });
          cleaned++;
        }
      }
      if (cleaned > 0) console.log(`Cleaned solutions from ${cleaned} old test results`);
    } catch (e) {
      console.warn('cleanupOldSolutions failed:', e.message);
    }
  },

  async getTestResults(userId) {
    const results = await fbGet(`testResults/${userId}`);
    if (!results) return [];
    // Only show completed tests (filter out in-progress)
    return Object.values(results)
      .filter(r => r.status !== 'in-progress')
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  },

  // ---- Mistakes Database ----
  async saveMistake(userId, mistake) {
    mistake.timestamp = Date.now();
    await fbPush(`mistakes/${userId}`, mistake);
  },

  async getMistakes(userId, exam) {
    const mistakes = await fbGet(`mistakes/${userId}`);
    if (!mistakes) return [];
    const all = Object.values(mistakes);
    if (exam) return all.filter(m => m.exam === exam);
    return all;
  },

  // ---- Performance Analytics ----
  async getTopicPerformance(userId, examId) {
    const results = await this.getTestResults(userId);
    const examResults = results.filter(r => r.exam === examId);

    const topicStats = {};

    examResults.forEach(result => {
      if (!result.topicBreakdown) return;
      for (const [topic, data] of Object.entries(result.topicBreakdown)) {
        if (!topicStats[topic]) {
          topicStats[topic] = { topic, subject: data.subject, totalQ: 0, correctQ: 0, attempts: 0 };
        }
        topicStats[topic].totalQ += data.total || 0;
        topicStats[topic].correctQ += data.correct || 0;
        topicStats[topic].attempts++;
      }
    });

    for (const topic of Object.values(topicStats)) {
      topic.accuracy = topic.totalQ > 0 ? Math.round((topic.correctQ / topic.totalQ) * 100) : 0;
    }

    return Object.values(topicStats);
  },

  async getWeakTopics(userId, examId) {
    const topicPerf = await this.getTopicPerformance(userId, examId);
    return topicPerf
      .filter(t => t.accuracy < 60 && t.totalQ >= 3)
      .sort((a, b) => a.accuracy - b.accuracy);
  },

  async getStrongTopics(userId, examId) {
    const topicPerf = await this.getTopicPerformance(userId, examId);
    return topicPerf
      .filter(t => t.accuracy >= 75 && t.totalQ >= 3)
      .sort((a, b) => b.accuracy - a.accuracy);
  },

  // ---- Attempted Questions Tracking ----
  async markQuestionsAttempted(userId, questionIds) {
    const existing = await fbGet(`attempted/${userId}`) || {};
    questionIds.forEach(id => {
      existing[id] = (existing[id] || 0) + 1;
    });
    await fbSet(`attempted/${userId}`, existing);
  },

  async getAttemptedQuestions(userId) {
    return await fbGet(`attempted/${userId}`) || {};
  },

  // ---- Scheduled Tests ----
  async createScheduledTest(testData) {
    const id = 'sched_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    testData.id = id;
    testData.createdAt = Date.now();
    testData.status = 'scheduled'; // scheduled | completed
    await fbSet(`scheduledTests/${id}`, testData);
    return id;
  },

  async getAllScheduledTests() {
    const tests = await fbGet('scheduledTests');
    if (!tests) return [];
    return Object.values(tests).sort((a, b) => (a.scheduledDate || 0) - (b.scheduledDate || 0));
  },

  async getScheduledTestsForStudent(studentId) {
    const all = await this.getAllScheduledTests();
    return all.filter(t => t.studentId === studentId);
  },

  async getScheduledTest(testId) {
    return await fbGet(`scheduledTests/${testId}`);
  },

  async updateScheduledTest(testId, updates) {
    await fbUpdate(`scheduledTests/${testId}`, updates);
  },

  async deleteScheduledTest(testId) {
    try {
      await fbRemove(`scheduledTests/${testId}`);
    } catch (e) {
      console.error('deleteScheduledTest error:', e);
      throw e;
    }
  }
};
