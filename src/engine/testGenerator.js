// ================================
// ExamPrep — Test Generator Engine
// ================================

import { EXAMS } from '../data/exams.js';
import { Store } from '../data/store.js';
import { shuffle, pickRandom } from '../utils/helpers.js';

export const TestGenerator = {
  
  // Generate a topic-based test
  async generateTopicTest(examId, subject, topic, userId) {
    const exam = EXAMS[examId];
    if (!exam) throw new Error('Invalid exam');

    const questions = await Store.getQuestions({ exam: examId, subject, topic });
    if (questions.length === 0) {
      throw new Error(`No questions found for ${topic}`);
    }

    // Get attempted questions to prioritize unattempted
    const attempted = await Store.getAttemptedQuestions(userId);
    
    // Sort: unattempted first, then least-attempted
    const sorted = [...questions].sort((a, b) => {
      const aCount = attempted[a.id] || 0;
      const bCount = attempted[b.id] || 0;
      return aCount - bCount;
    });

    // Take 15-20 questions (or all if fewer)
    const count = Math.min(20, sorted.length);
    let selected = sorted.slice(0, count);

    // Apply difficulty distribution: 40% easy, 40% medium, 20% hard
    selected = this._applyDifficultyDistribution(selected, questions, count);

    // Inject weak-topic questions if available (20% of test)
    const weakTopicQuestions = await this._getWeakTopicQuestions(userId, examId, subject, Math.ceil(count * 0.2));
    if (weakTopicQuestions.length > 0) {
      // Replace some questions with weak-topic questions
      const replaceCount = Math.min(weakTopicQuestions.length, Math.ceil(count * 0.2));
      selected = selected.slice(0, count - replaceCount);
      selected = [...selected, ...weakTopicQuestions.slice(0, replaceCount)];
    }

    // Shuffle and randomize options
    selected = shuffle(selected).map(q => this._randomizeOptions(q));

    // Calculate time limit (1.5 minutes per question for topic test)
    const timeLimit = Math.ceil(selected.length * 1.5);

    return {
      id: `test_${Date.now()}`,
      type: 'topic',
      exam: examId,
      subject,
      topic,
      questions: selected,
      totalQuestions: selected.length,
      timeLimit, // minutes
      marking: exam.marking,
      createdAt: Date.now()
    };
  },

  // Generate a full-length mock test
  async generateMockTest(examId, userId) {
    const exam = EXAMS[examId];
    if (!exam) throw new Error('Invalid exam');

    const allQuestions = await Store.getQuestions({ exam: examId });
    const attempted = await Store.getAttemptedQuestions(userId);

    let selectedQuestions = [];

    // For each subject, pick proportional questions
    for (const [subject, config] of Object.entries(exam.subjects)) {
      const subjectQuestions = allQuestions.filter(q => q.subject === subject);
      
      // Sort by least-attempted
      subjectQuestions.sort((a, b) => {
        const aCount = attempted[a.id] || 0;
        const bCount = attempted[b.id] || 0;
        return aCount - bCount;
      });

      // Take required count or all available
      const needed = config.questionCount;
      let picked = subjectQuestions.slice(0, needed);
      
      // If not enough, recycle
      if (picked.length < needed && subjectQuestions.length > 0) {
        while (picked.length < needed) {
          const recycled = subjectQuestions[picked.length % subjectQuestions.length];
          picked.push({ ...recycled, id: `${recycled.id}_r${picked.length}` });
        }
      }

      selectedQuestions = [...selectedQuestions, ...picked];
    }

    // Inject weak-topic questions (replace ~15% of questions)
    const weakCount = Math.ceil(selectedQuestions.length * 0.15);
    const weakQuestions = await this._getWeakTopicQuestions(userId, examId, null, weakCount);
    
    if (weakQuestions.length > 0) {
      // Remove some questions to make room
      selectedQuestions = selectedQuestions.slice(0, selectedQuestions.length - weakQuestions.length);
      selectedQuestions = [...selectedQuestions, ...weakQuestions];
    }

    // Shuffle within each subject group, then combine
    selectedQuestions = shuffle(selectedQuestions).map(q => this._randomizeOptions(q));

    return {
      id: `mock_${Date.now()}`,
      type: 'mock',
      exam: examId,
      questions: selectedQuestions,
      totalQuestions: selectedQuestions.length,
      timeLimit: exam.duration, // full exam duration
      marking: exam.marking,
      createdAt: Date.now()
    };
  },

  // Apply difficulty distribution
  _applyDifficultyDistribution(selected, pool, targetCount) {
    const easy = pool.filter(q => q.difficulty === 'easy');
    const medium = pool.filter(q => q.difficulty === 'medium');
    const hard = pool.filter(q => q.difficulty === 'hard');

    const easyCount = Math.ceil(targetCount * 0.4);
    const medCount = Math.ceil(targetCount * 0.4);
    const hardCount = targetCount - easyCount - medCount;

    let result = [
      ...pickRandom(easy, Math.min(easyCount, easy.length)),
      ...pickRandom(medium, Math.min(medCount, medium.length)),
      ...pickRandom(hard, Math.min(hardCount, hard.length))
    ];

    // If not enough from difficulty buckets, fill from selected
    if (result.length < targetCount) {
      const existing = new Set(result.map(q => q.id));
      const remaining = selected.filter(q => !existing.has(q.id));
      result = [...result, ...remaining.slice(0, targetCount - result.length)];
    }

    return result.slice(0, targetCount);
  },

  // Get questions from weak topics
  async _getWeakTopicQuestions(userId, examId, subject, count) {
    const weakTopics = await Store.getWeakTopics(userId, examId);
    if (weakTopics.length === 0) return [];

    let weakQuestions = [];
    for (const topic of weakTopics) {
      const filters = { exam: examId, topic: topic.topic };
      if (subject) filters.subject = subject;
      const questions = await Store.getQuestions(filters);
      weakQuestions = [...weakQuestions, ...questions];
    }

    // Also get from mistakes
    const mistakes = await Store.getMistakes(userId, examId);
    const mistakeQIds = new Set(mistakes.map(m => m.questionId));
    const allQ = await Store.getQuestions({ exam: examId });
    const mistakeQuestions = allQ.filter(q => mistakeQIds.has(q.id));
    weakQuestions = [...weakQuestions, ...mistakeQuestions];

    // Deduplicate
    const seen = new Set();
    weakQuestions = weakQuestions.filter(q => {
      if (seen.has(q.id)) return false;
      seen.add(q.id);
      return true;
    });

    return pickRandom(weakQuestions, count);
  },

  // Randomize option order (keep track of answer)
  _randomizeOptions(question) {
    const q = { ...question };
    const correctOption = q.options[q.correctAnswer];
    
    // Create indexed options
    const indexed = q.options.map((opt, i) => ({ text: opt, originalIndex: i }));
    const shuffled = shuffle(indexed);
    
    q.options = shuffled.map(o => o.text);
    q.correctAnswer = shuffled.findIndex(o => o.text === correctOption);
    
    return q;
  }
};
