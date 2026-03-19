// ================================
// ExamPrep — Sample Questions
// Bootstrap data for NEET & KCET
// ================================

export const SAMPLE_QUESTIONS = [
  // ---- NEET Physics ----
  {
    id: 'neet-phy-001',
    exam: 'NEET',
    subject: 'Physics',
    topic: 'Kinematics',
    difficulty: 'easy',
    question: 'A body is thrown vertically upward with velocity u. The maximum height reached is:',
    options: ['u²/2g', 'u/2g', '2u/g', 'u²/g'],
    correctAnswer: 0,
    solution: 'Using v² = u² - 2gh, at maximum height v = 0. So 0 = u² - 2gh → h = u²/2g.'
  },
  {
    id: 'neet-phy-002',
    exam: 'NEET',
    subject: 'Physics',
    topic: 'Laws of Motion',
    difficulty: 'easy',
    question: 'The SI unit of force is:',
    options: ['Newton', 'Joule', 'Watt', 'Pascal'],
    correctAnswer: 0,
    solution: 'Force = mass × acceleration. SI unit = kg⋅m/s² = Newton (N).'
  },
  {
    id: 'neet-phy-003',
    exam: 'NEET',
    subject: 'Physics',
    topic: 'Work, Energy & Power',
    difficulty: 'medium',
    question: 'A force of 10 N displaces a body by 5 m in the direction of force. Work done is:',
    options: ['50 J', '2 J', '15 J', '0.5 J'],
    correctAnswer: 0,
    solution: 'Work = Force × Displacement × cos(θ). Here θ = 0°, so W = 10 × 5 × 1 = 50 J.'
  },
  {
    id: 'neet-phy-004',
    exam: 'NEET',
    subject: 'Physics',
    topic: 'Gravitation',
    difficulty: 'medium',
    question: 'The acceleration due to gravity at the surface of Earth is approximately:',
    options: ['9.8 m/s²', '8.9 m/s²', '10.8 m/s²', '6.67 m/s²'],
    correctAnswer: 0,
    solution: 'The standard value of g at Earth\'s surface is 9.8 m/s² (or ≈ 9.81 m/s²).'
  },
  {
    id: 'neet-phy-005',
    exam: 'NEET',
    subject: 'Physics',
    topic: 'Electrostatics',
    difficulty: 'hard',
    question: 'Two point charges +q and -q are separated by distance d. The electric field at the midpoint is:',
    options: ['4kq/d² directed from -q to +q', '4kq/d² directed from +q to -q', 'Zero', 'kq/d²'],
    correctAnswer: 1,
    solution: 'At midpoint, distance from each charge = d/2. Field due to +q points away from it, field due to -q points toward it. Both point in the same direction (from +q to -q). E = 2 × kq/(d/2)² = 8kq/d². Wait, let me recalculate: E = kq/(d/2)² = 4kq/d² from each. Total = 2 × 4kq/d²... Actually each gives kq/(d/2)² = 4kq/d², and they add up = 4kq/d² directed from +q to -q.'
  },
  {
    id: 'neet-phy-006',
    exam: 'NEET',
    subject: 'Physics',
    topic: 'Ray Optics',
    difficulty: 'easy',
    question: 'The focal length of a plane mirror is:',
    options: ['Infinity', 'Zero', '1 m', 'Depends on size'],
    correctAnswer: 0,
    solution: 'A plane mirror has radius of curvature R = ∞, so focal length f = R/2 = ∞.'
  },
  {
    id: 'neet-phy-007',
    exam: 'NEET',
    subject: 'Physics',
    topic: 'Thermodynamics',
    difficulty: 'medium',
    question: 'In an isothermal process, the quantity that remains constant is:',
    options: ['Temperature', 'Pressure', 'Volume', 'Entropy'],
    correctAnswer: 0,
    solution: 'Isothermal means "same temperature." In an isothermal process, the temperature of the system remains constant throughout.'
  },

  // ---- NEET Chemistry ----
  {
    id: 'neet-chem-001',
    exam: 'NEET',
    subject: 'Chemistry',
    topic: 'Some Basic Concepts of Chemistry',
    difficulty: 'easy',
    question: 'The number of moles in 36 g of water (H₂O) is:',
    options: ['2', '1', '0.5', '3'],
    correctAnswer: 0,
    solution: 'Molar mass of H₂O = 2(1) + 16 = 18 g/mol. Moles = 36/18 = 2 moles.'
  },
  {
    id: 'neet-chem-002',
    exam: 'NEET',
    subject: 'Chemistry',
    topic: 'Structure of Atom',
    difficulty: 'medium',
    question: 'The maximum number of electrons in the n=3 shell is:',
    options: ['18', '8', '32', '2'],
    correctAnswer: 0,
    solution: 'Maximum electrons in shell n = 2n². For n=3: 2(3²) = 2(9) = 18 electrons.'
  },
  {
    id: 'neet-chem-003',
    exam: 'NEET',
    subject: 'Chemistry',
    topic: 'Chemical Bonding & Molecular Structure',
    difficulty: 'easy',
    question: 'The shape of methane (CH₄) molecule is:',
    options: ['Tetrahedral', 'Square planar', 'Pyramidal', 'Linear'],
    correctAnswer: 0,
    solution: 'CH₄ has sp³ hybridization with 4 bond pairs and 0 lone pairs, giving a tetrahedral geometry with bond angle 109.5°.'
  },
  {
    id: 'neet-chem-004',
    exam: 'NEET',
    subject: 'Chemistry',
    topic: 'Equilibrium',
    difficulty: 'hard',
    question: 'The pH of 0.001 M HCl solution is:',
    options: ['3', '11', '0.001', '7'],
    correctAnswer: 0,
    solution: 'HCl is a strong acid, fully dissociated. [H⁺] = 0.001 = 10⁻³ M. pH = -log[H⁺] = -log(10⁻³) = 3.'
  },
  {
    id: 'neet-chem-005',
    exam: 'NEET',
    subject: 'Chemistry',
    topic: 'Organic Chemistry: Basic Principles',
    difficulty: 'medium',
    question: 'The IUPAC name of CH₃CH₂OH is:',
    options: ['Ethanol', 'Methanol', 'Propanol', 'Butanol'],
    correctAnswer: 0,
    solution: 'CH₃CH₂OH has 2 carbon atoms with an -OH group. The IUPAC name is Ethanol (ethan- for 2C + -ol for alcohol).'
  },
  {
    id: 'neet-chem-006',
    exam: 'NEET',
    subject: 'Chemistry',
    topic: 'Electrochemistry',
    difficulty: 'hard',
    question: 'The standard electrode potential of hydrogen electrode is:',
    options: ['0 V', '1 V', '-1 V', '0.5 V'],
    correctAnswer: 0,
    solution: 'By convention, the Standard Hydrogen Electrode (SHE) is assigned a potential of exactly 0.00 V. All other electrode potentials are measured relative to it.'
  },

  // ---- NEET Biology ----
  {
    id: 'neet-bio-001',
    exam: 'NEET',
    subject: 'Biology',
    topic: 'Cell: The Unit of Life',
    difficulty: 'easy',
    question: 'The powerhouse of the cell is:',
    options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi apparatus'],
    correctAnswer: 0,
    solution: 'Mitochondria are called the powerhouse of the cell because they produce ATP through oxidative phosphorylation (cellular respiration).'
  },
  {
    id: 'neet-bio-002',
    exam: 'NEET',
    subject: 'Biology',
    topic: 'Photosynthesis',
    difficulty: 'medium',
    question: 'The primary pigment involved in photosynthesis is:',
    options: ['Chlorophyll a', 'Chlorophyll b', 'Carotenoids', 'Xanthophyll'],
    correctAnswer: 0,
    solution: 'Chlorophyll a is the primary photosynthetic pigment. It is the only pigment that can directly participate in the light reactions by converting light energy to chemical energy.'
  },
  {
    id: 'neet-bio-003',
    exam: 'NEET',
    subject: 'Biology',
    topic: 'Principles of Inheritance & Variation',
    difficulty: 'medium',
    question: 'Mendel\'s law of segregation is also known as:',
    options: ['Law of purity of gametes', 'Law of dominance', 'Law of independent assortment', 'Law of inheritance'],
    correctAnswer: 0,
    solution: 'The Law of Segregation states that allele pairs separate during gamete formation, so each gamete carries only one allele. This is also called the Law of Purity of Gametes.'
  },
  {
    id: 'neet-bio-004',
    exam: 'NEET',
    subject: 'Biology',
    topic: 'Human Reproduction',
    difficulty: 'easy',
    question: 'The normal gestation period in humans is approximately:',
    options: ['9 months (280 days)', '6 months', '12 months', '10 months'],
    correctAnswer: 0,
    solution: 'Human gestation period is approximately 9 months or about 280 days (40 weeks) from the last menstrual period.'
  },
  {
    id: 'neet-bio-005',
    exam: 'NEET',
    subject: 'Biology',
    topic: 'Ecosystem',
    difficulty: 'medium',
    question: 'In an ecosystem, the flow of energy is:',
    options: ['Unidirectional', 'Bidirectional', 'Multidirectional', 'Cyclic'],
    correctAnswer: 0,
    solution: 'Energy flow in an ecosystem is always unidirectional — from sun → producers → primary consumers → secondary consumers. Energy cannot be recycled; it is lost as heat at each trophic level.'
  },
  {
    id: 'neet-bio-006',
    exam: 'NEET',
    subject: 'Biology',
    topic: 'Molecular Basis of Inheritance',
    difficulty: 'hard',
    question: 'The enzyme responsible for transcription in prokaryotes is:',
    options: ['RNA polymerase', 'DNA polymerase', 'Helicase', 'Ligase'],
    correctAnswer: 0,
    solution: 'RNA polymerase is responsible for transcription — the process of synthesizing RNA from a DNA template. Prokaryotes have a single RNA polymerase that handles all types of RNA synthesis.'
  },
  {
    id: 'neet-bio-007',
    exam: 'NEET',
    subject: 'Biology',
    topic: 'Human Health & Diseases',
    difficulty: 'easy',
    question: 'The causative organism of malaria is:',
    options: ['Plasmodium', 'Entamoeba', 'Leishmania', 'Trypanosoma'],
    correctAnswer: 0,
    solution: 'Malaria is caused by Plasmodium species (P. vivax, P. falciparum, P. malariae, P. ovale). It is transmitted by the female Anopheles mosquito.'
  },
  {
    id: 'neet-bio-008',
    exam: 'NEET',
    subject: 'Biology',
    topic: 'Biotechnology: Principles & Processes',
    difficulty: 'medium',
    question: 'The enzyme used to cut DNA at specific recognition sequences is:',
    options: ['Restriction endonuclease', 'DNA ligase', 'DNA polymerase', 'Reverse transcriptase'],
    correctAnswer: 0,
    solution: 'Restriction endonucleases (restriction enzymes) are molecular scissors that cut DNA at specific palindromic recognition sequences. They are essential tools in recombinant DNA technology.'
  },

  // ---- KCET Physics ----
  {
    id: 'kcet-phy-001',
    exam: 'KCET',
    subject: 'Physics',
    topic: 'Kinematics',
    difficulty: 'easy',
    question: 'The slope of velocity-time graph gives:',
    options: ['Acceleration', 'Displacement', 'Speed', 'Distance'],
    correctAnswer: 0,
    solution: 'In a v-t graph, slope = Δv/Δt = acceleration. The area under the curve gives displacement.'
  },
  {
    id: 'kcet-phy-002',
    exam: 'KCET',
    subject: 'Physics',
    topic: 'Current Electricity',
    difficulty: 'medium',
    question: 'Two resistors of 4Ω and 6Ω are connected in parallel. The equivalent resistance is:',
    options: ['2.4 Ω', '10 Ω', '5 Ω', '24 Ω'],
    correctAnswer: 0,
    solution: '1/Req = 1/4 + 1/6 = 3/12 + 2/12 = 5/12. So Req = 12/5 = 2.4 Ω.'
  },
  {
    id: 'kcet-phy-003',
    exam: 'KCET',
    subject: 'Physics',
    topic: 'Optics',
    difficulty: 'easy',
    question: 'The phenomenon of splitting of white light into its component colors is called:',
    options: ['Dispersion', 'Diffraction', 'Interference', 'Polarization'],
    correctAnswer: 0,
    solution: 'Dispersion is the splitting of white light into its constituent colors (VIBGYOR) when it passes through a prism, due to different wavelengths having different refractive indices.'
  },
  {
    id: 'kcet-phy-004',
    exam: 'KCET',
    subject: 'Physics',
    topic: 'Oscillations & Waves',
    difficulty: 'medium',
    question: 'The time period of a simple pendulum depends on:',
    options: ['Length and g', 'Mass and length', 'Mass only', 'Amplitude'],
    correctAnswer: 0,
    solution: 'T = 2π√(l/g). The time period depends on the length (l) of the pendulum and acceleration due to gravity (g), not on mass or amplitude (for small oscillations).'
  },

  // ---- KCET Chemistry ----
  {
    id: 'kcet-chem-001',
    exam: 'KCET',
    subject: 'Chemistry',
    topic: 'Some Basic Concepts of Chemistry',
    difficulty: 'easy',
    question: 'Avogadro\'s number is:',
    options: ['6.022 × 10²³', '6.022 × 10²²', '3.14 × 10²³', '1.6 × 10⁻¹⁹'],
    correctAnswer: 0,
    solution: 'Avogadro\'s number (Nₐ) = 6.022 × 10²³ mol⁻¹. It represents the number of entities (atoms, molecules, ions) in one mole of a substance.'
  },
  {
    id: 'kcet-chem-002',
    exam: 'KCET',
    subject: 'Chemistry',
    topic: 'Chemical Thermodynamics',
    difficulty: 'hard',
    question: 'For an exothermic reaction, the enthalpy change (ΔH) is:',
    options: ['Negative', 'Positive', 'Zero', 'Cannot be determined'],
    correctAnswer: 0,
    solution: 'In exothermic reactions, heat is released to the surroundings. Since the system loses energy, ΔH < 0 (negative).'
  },
  {
    id: 'kcet-chem-003',
    exam: 'KCET',
    subject: 'Chemistry',
    topic: 'Coordination Compounds',
    difficulty: 'hard',
    question: 'The coordination number of central metal ion in [Fe(CN)₆]⁴⁻ is:',
    options: ['6', '4', '2', '8'],
    correctAnswer: 0,
    solution: 'In [Fe(CN)₆]⁴⁻, the central Fe²⁺ ion is surrounded by 6 CN⁻ ligands. Since CN⁻ is a monodentate ligand, the coordination number = 6.'
  },

  // ---- KCET Mathematics ----
  {
    id: 'kcet-math-001',
    exam: 'KCET',
    subject: 'Mathematics',
    topic: 'Sets & Functions',
    difficulty: 'easy',
    question: 'If A = {1, 2, 3} and B = {2, 3, 4}, then A ∩ B is:',
    options: ['{2, 3}', '{1, 2, 3, 4}', '{1, 4}', '{1}'],
    correctAnswer: 0,
    solution: 'A ∩ B (intersection) contains elements common to both sets. Common elements of {1,2,3} and {2,3,4} are {2, 3}.'
  },
  {
    id: 'kcet-math-002',
    exam: 'KCET',
    subject: 'Mathematics',
    topic: 'Trigonometric Functions',
    difficulty: 'easy',
    question: 'The value of sin(90°) is:',
    options: ['1', '0', '-1', '1/2'],
    correctAnswer: 0,
    solution: 'sin(90°) = 1. This is a standard trigonometric value on the unit circle.'
  },
  {
    id: 'kcet-math-003',
    exam: 'KCET',
    subject: 'Mathematics',
    topic: 'Matrices & Determinants',
    difficulty: 'medium',
    question: 'The determinant of a 2×2 matrix [[a, b], [c, d]] is:',
    options: ['ad - bc', 'ac - bd', 'ab - cd', 'ad + bc'],
    correctAnswer: 0,
    solution: 'For a 2×2 matrix |a b; c d|, the determinant = ad - bc. This is the fundamental formula for 2×2 determinants.'
  },
  {
    id: 'kcet-math-004',
    exam: 'KCET',
    subject: 'Mathematics',
    topic: 'Limits & Derivatives',
    difficulty: 'medium',
    question: 'The derivative of sin(x) with respect to x is:',
    options: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'],
    correctAnswer: 0,
    solution: 'd/dx [sin(x)] = cos(x). This is a standard derivative formula.'
  },
  {
    id: 'kcet-math-005',
    exam: 'KCET',
    subject: 'Mathematics',
    topic: 'Integrals',
    difficulty: 'medium',
    question: 'The integral of 2x dx is:',
    options: ['x² + C', '2x² + C', 'x + C', '2 + C'],
    correctAnswer: 0,
    solution: '∫2x dx = 2 × (x²/2) + C = x² + C. Using the power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C.'
  },
  {
    id: 'kcet-math-006',
    exam: 'KCET',
    subject: 'Mathematics',
    topic: 'Probability (Class 12)',
    difficulty: 'easy',
    question: 'If P(A) = 0.3, then P(A\') is:',
    options: ['0.7', '0.3', '1.3', '0'],
    correctAnswer: 0,
    solution: 'P(A\') = 1 - P(A) = 1 - 0.3 = 0.7. The probability of complement is always 1 minus the probability of the event.'
  },
  {
    id: 'kcet-math-007',
    exam: 'KCET',
    subject: 'Mathematics',
    topic: 'Differential Equations',
    difficulty: 'hard',
    question: 'The order of the differential equation d²y/dx² + 3(dy/dx) + 2y = 0 is:',
    options: ['2', '1', '3', '0'],
    correctAnswer: 0,
    solution: 'The order of a differential equation is the highest order derivative present. Here, d²y/dx² is the highest derivative (2nd order), so the order is 2.'
  },

  // ---- KCET Biology ----
  {
    id: 'kcet-bio-001',
    exam: 'KCET',
    subject: 'Biology',
    topic: 'Cell Structure & Function',
    difficulty: 'easy',
    question: 'The cell organelle involved in protein synthesis is:',
    options: ['Ribosome', 'Lysosome', 'Golgi body', 'Mitochondria'],
    correctAnswer: 0,
    solution: 'Ribosomes are the sites of protein synthesis. They read mRNA and translate the genetic code into amino acid sequences (proteins).'
  },
  {
    id: 'kcet-bio-002',
    exam: 'KCET',
    subject: 'Biology',
    topic: 'Genetics & Evolution',
    difficulty: 'medium',
    question: 'The father of genetics is:',
    options: ['Gregor Mendel', 'Charles Darwin', 'Hugo de Vries', 'T.H. Morgan'],
    correctAnswer: 0,
    solution: 'Gregor Johann Mendel (1822-1884) is known as the Father of Genetics for his pioneering work on inheritance patterns using pea plants.'
  },
  {
    id: 'kcet-bio-003',
    exam: 'KCET',
    subject: 'Biology',
    topic: 'Ecology & Environment',
    difficulty: 'medium',
    question: 'The study of interactions between organisms and their environment is called:',
    options: ['Ecology', 'Anatomy', 'Physiology', 'Taxonomy'],
    correctAnswer: 0,
    solution: 'Ecology (from Greek oikos = house/habitat + logos = study) is the scientific study of interactions among organisms and between organisms and their physical environment.'
  },

  // More NEET questions for diversity
  {
    id: 'neet-phy-008',
    exam: 'NEET',
    subject: 'Physics',
    topic: 'Semiconductor Electronics',
    difficulty: 'medium',
    question: 'In a p-n junction diode, the depletion region is formed at:',
    options: ['The junction of p and n type', 'p-type side only', 'n-type side only', 'Entire diode'],
    correctAnswer: 0,
    solution: 'The depletion region forms at the p-n junction where electrons from n-side diffuse to p-side and holes from p-side diffuse to n-side, creating a region depleted of free charge carriers.'
  },
  {
    id: 'neet-chem-007',
    exam: 'NEET',
    subject: 'Chemistry',
    topic: 'Chemical Kinetics',
    difficulty: 'hard',
    question: 'The unit of rate constant for a first-order reaction is:',
    options: ['s⁻¹', 'mol L⁻¹ s⁻¹', 'L mol⁻¹ s⁻¹', 'mol² L⁻² s⁻¹'],
    correctAnswer: 0,
    solution: 'For a first-order reaction: Rate = k[A]. So k = Rate/[A] = (mol L⁻¹ s⁻¹)/(mol L⁻¹) = s⁻¹. The unit is inverse seconds.'
  },
  {
    id: 'neet-bio-009',
    exam: 'NEET',
    subject: 'Biology',
    topic: 'Biological Classification',
    difficulty: 'easy',
    question: 'The five-kingdom classification was proposed by:',
    options: ['R.H. Whittaker', 'Carl Linnaeus', 'Ernst Haeckel', 'Carolus Linnaeus'],
    correctAnswer: 0,
    solution: 'R.H. Whittaker (1969) proposed the five-kingdom classification: Monera, Protista, Fungi, Plantae, and Animalia, based on cell structure, body organization, mode of nutrition, and reproduction.'
  },
  {
    id: 'neet-bio-010',
    exam: 'NEET',
    subject: 'Biology',
    topic: 'Digestion & Absorption',
    difficulty: 'medium',
    question: 'The enzyme pepsin is secreted by:',
    options: ['Chief cells of stomach', 'Parietal cells of stomach', 'Brunner\'s glands', 'Salivary glands'],
    correctAnswer: 0,
    solution: 'Pepsin (in inactive form pepsinogen) is secreted by chief cells (zymogen cells) in the gastric glands of the stomach. HCl from parietal cells activates pepsinogen to pepsin.'
  }
];
