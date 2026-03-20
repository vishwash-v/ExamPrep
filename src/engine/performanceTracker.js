// ================================
// ExamPrep — Performance Tracker
// ================================

import { EXAMS } from '../data/exams.js';
import { Store } from '../data/store.js';
import { percentage } from '../utils/helpers.js';

export const PerformanceTracker = {

  // Calculate test result with exam-specific marking
  calculateResult(test, answers, timeTaken) {
    const marking = test.marking;
    let score = 0;
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const topicBreakdown = {};
    const questionResults = [];

    test.questions.forEach((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correctAnswer;
      const isUnanswered = userAnswer === undefined || userAnswer === null;

      // Initialize topic tracking
      const topicKey = q.topic;
      if (!topicBreakdown[topicKey]) {
        topicBreakdown[topicKey] = {
          subject: q.subject,
          topic: q.topic,
          total: 0,
          correct: 0,
          incorrect: 0,
          unanswered: 0
        };
      }

      topicBreakdown[topicKey].total++;

      if (isUnanswered) {
        unanswered++;
        score += marking.unanswered;
        topicBreakdown[topicKey].unanswered++;
      } else if (isCorrect) {
        correct++;
        score += marking.correct;
        topicBreakdown[topicKey].correct++;
      } else {
        incorrect++;
        score += marking.incorrect;
        topicBreakdown[topicKey].incorrect++;
      }

      questionResults.push({
        questionId: q.id,
        question: q.question,
        options: q.options,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        isUnanswered,
        topic: q.topic,
        subject: q.subject,
        difficulty: q.difficulty,
        solution: q.solution || ''
      });
    });

    const totalMarks = test.questions.length * marking.correct;
    const accuracy = percentage(correct, test.questions.length);
    const avgTimePerQuestion = test.questions.length > 0
      ? Math.round(timeTaken / test.questions.length)
      : 0;

    return {
      testId: test.id,
      type: test.type,
      exam: test.exam,
      subject: test.subject || 'Mixed',
      topic: test.topic || 'Mock Test',
      totalQuestions: test.questions.length,
      correct,
      incorrect,
      unanswered,
      score,
      totalMarks,
      accuracy,
      timeTaken,
      timeLimit: test.timeLimit * 60,
      avgTimePerQuestion,
      topicBreakdown,
      questionResults,
      marking: test.marking
    };
  },

  // Save result and update tracking
  async saveResult(userId, result) {
    // Save test result (include questionResults for review later)
    await Store.saveTestResult(userId, {
      testId: result.testId,
      type: result.type,
      exam: result.exam,
      subject: result.subject,
      topic: result.topic,
      totalQuestions: result.totalQuestions,
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
      questionResults: result.questionResults,
      marking: result.marking,
      timestamp: Date.now()
    });

    // Save mistakes
    const mistakes = result.questionResults.filter(q => !q.isCorrect && !q.isUnanswered);
    for (const mistake of mistakes) {
      await Store.saveMistake(userId, {
        questionId: mistake.questionId,
        exam: result.exam,
        subject: mistake.subject,
        topic: mistake.topic,
        userAnswer: mistake.userAnswer,
        correctAnswer: mistake.correctAnswer,
        difficulty: mistake.difficulty
      });
    }

    // Mark questions as attempted
    const questionIds = result.questionResults.map(q => q.questionId);
    await Store.markQuestionsAttempted(userId, questionIds);
  },

  // Get performance summary for parent dashboard
  async getPerformanceSummary(userId, examId) {
    const results = await Store.getTestResults(userId);
    const examResults = results.filter(r => r.exam === examId);

    if (examResults.length === 0) {
      return {
        totalTests: 0,
        avgAccuracy: 0,
        avgScore: 0,
        avgSpeed: 0,
        trend: [],
        topicPerformance: [],
        weakTopics: [],
        strongTopics: [],
        recentTests: []
      };
    }

    const totalTests = examResults.length;
    const avgAccuracy = Math.round(
      examResults.reduce((sum, r) => sum + r.accuracy, 0) / totalTests
    );
    const avgScore = Math.round(
      examResults.reduce((sum, r) => sum + r.score, 0) / totalTests
    );
    const avgSpeed = Math.round(
      examResults.reduce((sum, r) => sum + (r.avgTimePerQuestion || 0), 0) / totalTests
    );

    // Trend data (last 20 tests)
    const trend = examResults.slice(0, 20).reverse().map(r => ({
      date: r.timestamp,
      accuracy: r.accuracy,
      score: r.score,
      speed: r.avgTimePerQuestion || 0
    }));

    // Topic performance
    const topicPerformance = await Store.getTopicPerformance(userId, examId);
    const weakTopics = await Store.getWeakTopics(userId, examId);
    const strongTopics = await Store.getStrongTopics(userId, examId);

    return {
      totalTests,
      avgAccuracy,
      avgScore,
      avgSpeed,
      trend,
      topicPerformance,
      weakTopics,
      strongTopics,
      recentTests: examResults.slice(0, 10)
    };
  }
};
