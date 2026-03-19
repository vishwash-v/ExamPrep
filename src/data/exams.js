// ================================
// ExamPrep — Exam Configurations
// NEET 2026 & KCET 2026
// ================================

export const EXAMS = {
  NEET: {
    id: 'NEET',
    name: 'NEET 2026',
    fullName: 'National Eligibility cum Entrance Test',
    examDate: '2026-05-03',
    totalQuestions: 180,
    totalMarks: 720,
    duration: 180, // minutes
    marking: { correct: 4, incorrect: -1, unanswered: 0 },
    hasNegativeMarking: true,
    subjects: {
      Physics: {
        questionCount: 45,
        topics: [
          'Physical World & Measurement',
          'Kinematics',
          'Laws of Motion',
          'Work, Energy & Power',
          'System of Particles & Rotational Motion',
          'Gravitation',
          'Mechanical Properties of Solids',
          'Mechanical Properties of Fluids',
          'Thermal Properties of Matter',
          'Thermodynamics',
          'Kinetic Theory of Gases',
          'Oscillations',
          'Waves',
          'Electrostatics',
          'Current Electricity',
          'Magnetic Effects of Current & Magnetism',
          'Electromagnetic Induction',
          'Alternating Current',
          'Electromagnetic Waves',
          'Ray Optics',
          'Wave Optics',
          'Dual Nature of Radiation & Matter',
          'Atoms',
          'Nuclei',
          'Semiconductor Electronics'
        ]
      },
      Chemistry: {
        questionCount: 45,
        topics: [
          'Some Basic Concepts of Chemistry',
          'Structure of Atom',
          'Classification of Elements',
          'Chemical Bonding & Molecular Structure',
          'States of Matter',
          'Thermodynamics',
          'Equilibrium',
          'Redox Reactions',
          'Hydrogen',
          'The s-Block Elements',
          'The p-Block Elements',
          'Organic Chemistry: Basic Principles',
          'Hydrocarbons',
          'Environmental Chemistry',
          'Solutions',
          'Electrochemistry',
          'Chemical Kinetics',
          'Surface Chemistry',
          'Coordination Compounds',
          'Haloalkanes & Haloarenes',
          'Alcohols, Phenols & Ethers',
          'Aldehydes, Ketones & Carboxylic Acids',
          'Amines',
          'Biomolecules',
          'Polymers'
        ]
      },
      Biology: {
        questionCount: 90,
        topics: [
          'The Living World',
          'Biological Classification',
          'Plant Kingdom',
          'Animal Kingdom',
          'Morphology of Flowering Plants',
          'Anatomy of Flowering Plants',
          'Structural Organisation in Animals',
          'Cell: The Unit of Life',
          'Biomolecules',
          'Cell Cycle & Cell Division',
          'Transport in Plants',
          'Mineral Nutrition',
          'Photosynthesis',
          'Respiration in Plants',
          'Plant Growth & Development',
          'Digestion & Absorption',
          'Breathing & Exchange of Gases',
          'Body Fluids & Circulation',
          'Excretory Products',
          'Locomotion & Movement',
          'Neural Control & Coordination',
          'Chemical Coordination (Endocrine)',
          'Reproduction in Organisms',
          'Sexual Reproduction in Flowering Plants',
          'Human Reproduction',
          'Reproductive Health',
          'Principles of Inheritance & Variation',
          'Molecular Basis of Inheritance',
          'Evolution',
          'Human Health & Diseases',
          'Strategies for Enhancement in Food Production',
          'Microbes in Human Welfare',
          'Biotechnology: Principles & Processes',
          'Biotechnology & its Applications',
          'Organisms & Populations',
          'Ecosystem',
          'Biodiversity & Conservation',
          'Environmental Issues'
        ]
      }
    }
  },

  KCET: {
    id: 'KCET',
    name: 'KCET 2026',
    fullName: 'Karnataka Common Entrance Test',
    examDate: '2026-04-23',
    totalQuestions: 180,
    totalMarks: 180,
    duration: 240, // 80 min × 3 papers
    perSubjectDuration: 80,
    marking: { correct: 1, incorrect: 0, unanswered: 0 },
    hasNegativeMarking: false,
    subjects: {
      Physics: {
        questionCount: 60,
        topics: [
          'Physical World & Measurement',
          'Kinematics',
          'Laws of Motion',
          'Work, Energy & Power',
          'Motion of System of Particles',
          'Gravitation',
          'Properties of Bulk Matter',
          'Thermodynamics',
          'Kinetic Theory of Gases',
          'Oscillations & Waves',
          'Electrostatics',
          'Current Electricity',
          'Magnetic Effects of Current',
          'Electromagnetic Induction & AC',
          'Electromagnetic Waves',
          'Optics',
          'Dual Nature of Matter & Radiation',
          'Atoms & Nuclei',
          'Electronic Devices',
          'Communication Systems'
        ]
      },
      Chemistry: {
        questionCount: 60,
        topics: [
          'Some Basic Concepts of Chemistry',
          'Structure of Atom',
          'Classification of Elements & Periodicity',
          'Chemical Bonding & Molecular Structure',
          'States of Matter',
          'Chemical Thermodynamics',
          'Equilibrium',
          'Redox Reactions & Electrochemistry',
          'Hydrogen & s-Block Elements',
          'p-Block Elements',
          'Organic Chemistry: Basic Principles',
          'Hydrocarbons',
          'Solutions',
          'Chemical Kinetics',
          'Surface Chemistry',
          'Coordination Compounds',
          'Haloalkanes & Haloarenes',
          'Alcohols, Phenols & Ethers',
          'Organic Compounds with Nitrogen',
          'Biomolecules & Polymers'
        ]
      },
      Mathematics: {
        questionCount: 60,
        topics: [
          'Sets & Functions',
          'Trigonometric Functions',
          'Complex Numbers & Quadratic Equations',
          'Linear Inequalities',
          'Permutations & Combinations',
          'Binomial Theorem',
          'Sequences & Series',
          'Coordinate Geometry (Straight Lines)',
          'Conic Sections',
          'Three Dimensional Geometry',
          'Limits & Derivatives',
          'Mathematical Reasoning',
          'Statistics & Probability',
          'Relations & Functions',
          'Inverse Trigonometric Functions',
          'Matrices & Determinants',
          'Continuity & Differentiability',
          'Applications of Derivatives',
          'Integrals',
          'Applications of Integrals',
          'Differential Equations',
          'Vector Algebra',
          'Linear Programming',
          'Probability (Class 12)'
        ]
      },
      Biology: {
        questionCount: 60,
        topics: [
          'The Living World',
          'Biological Classification',
          'Plant Kingdom',
          'Animal Kingdom',
          'Morphology of Flowering Plants',
          'Anatomy of Flowering Plants',
          'Cell Structure & Function',
          'Cell Cycle & Division',
          'Transport in Plants',
          'Mineral Nutrition',
          'Photosynthesis & Respiration',
          'Plant Growth & Development',
          'Human Physiology',
          'Reproduction in Organisms',
          'Genetics & Evolution',
          'Biology in Human Welfare',
          'Biotechnology',
          'Ecology & Environment'
        ]
      }
    }
  }
};

// Get all exam IDs
export function getExamIds() {
  return Object.keys(EXAMS);
}

// Get subjects for an exam
export function getSubjects(examId) {
  return Object.keys(EXAMS[examId]?.subjects || {});
}

// Get topics for a subject in an exam
export function getTopics(examId, subject) {
  return EXAMS[examId]?.subjects?.[subject]?.topics || [];
}

// Calculate days until exam
export function getDaysUntilExam(examId) {
  const exam = EXAMS[examId];
  if (!exam) return null;
  const examDate = new Date(exam.examDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);
  const diff = examDate - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Check if in mock-test mode (last 30 days before exam)
export function isMockTestMode(examId) {
  const days = getDaysUntilExam(examId);
  return days !== null && days <= 30 && days >= 0;
}
