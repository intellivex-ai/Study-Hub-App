// ── Subjects ──────────────────────────────────────────────────────────────────
export const subjects = [
  {
    id: 1,
    name: 'Physics',
    chapters: 12,
    progress: 78,
    color: 'blue',
    icon: 'science',
    colorHex: '#3b82f6',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-500',
    barClass: 'bg-blue-500',
    topic: 'Kinematics & Dynamics',
    accuracy: 92,
    change: '+5%',
  },
  {
    id: 2,
    name: 'Chemistry',
    chapters: 15,
    progress: 45,
    color: 'emerald',
    icon: 'experiment',
    colorHex: '#10b981',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-500',
    barClass: 'bg-emerald-500',
    topic: 'Organic Chemistry',
    accuracy: 76,
    change: '+2%',
  },
  {
    id: 3,
    name: 'Mathematics',
    chapters: 10,
    progress: 92,
    color: 'orange',
    icon: 'functions',
    colorHex: '#f97316',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-500',
    barClass: 'bg-orange-500',
    topic: 'Calculus & Algebra',
    accuracy: 88,
    change: '-1%',
  },
  {
    id: 4,
    name: 'Biology',
    chapters: 8,
    progress: 30,
    color: 'pink',
    icon: 'psychology',
    colorHex: '#ec4899',
    bgClass: 'bg-pink-500/10',
    textClass: 'text-pink-500',
    barClass: 'bg-pink-500',
    topic: 'Cell Biology',
    accuracy: 70,
    change: '+8%',
  },
]

// ── Lessons ────────────────────────────────────────────────────────────────────
export const currentLesson = {
  id: 1,
  subject: 'Physics',
  title: 'Quantum Mechanics: Wave-Particle Duality',
  module: 'Module 4: Schrödinger\'s Equation & Uncertainty',
  progress: 65,
  thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&q=80',
}

export const lessonOutline = [
  { id: 1, title: 'Introduction to Quantum Theory', duration: '8:24', completed: true },
  { id: 2, title: 'Wave-Particle Duality', duration: '12:10', completed: true },
  { id: 3, title: 'The Double-Slit Experiment', duration: '10:45', completed: true },
  { id: 4, title: 'Schrödinger\'s Equation', duration: '15:30', completed: false, active: true },
  { id: 5, title: 'Heisenberg Uncertainty Principle', duration: '11:20', completed: false },
  { id: 6, title: 'Quantum Tunneling', duration: '9:55', completed: false },
]

// ── Quiz Questions ─────────────────────────────────────────────────────────────
export const quizQuestions = [
  {
    id: 1,
    question: 'Which phenomenon demonstrates the wave nature of electrons?',
    options: [
      'Photoelectric Effect',
      'Double-Slit Experiment',
      'Compton Scattering',
      'Pair Production',
    ],
    correct: 1,
    explanation: 'The double-slit experiment shows electrons creating an interference pattern — proof of their wave nature.',
  },
  {
    id: 2,
    question: 'What does the Heisenberg Uncertainty Principle state?',
    options: [
      'Energy is quantized',
      'Light travels in packets',
      'Position and momentum cannot both be precisely known simultaneously',
      'Electrons orbit the nucleus',
    ],
    correct: 2,
    explanation: 'Δx·Δp ≥ ℏ/2 — the more precisely you know position, the less precisely you know momentum.',
  },
  {
    id: 3,
    question: 'The de Broglie wavelength of a particle is inversely proportional to its:',
    options: ['Charge', 'Momentum', 'Energy', 'Spin'],
    correct: 1,
    explanation: 'λ = h/p — wavelength decreases as momentum increases.',
  },
  {
    id: 4,
    question: 'Schrödinger\'s wave equation describes:',
    options: [
      'The path of a photon',
      'The probability amplitude of a quantum state',
      'The spin of an electron',
      'The charge distribution in an atom',
    ],
    correct: 1,
    explanation: 'The wavefunction ψ gives the probability amplitude; |ψ|² is the probability density.',
  },
  {
    id: 5,
    question: 'Which experiment first confirmed wave-particle duality for light?',
    options: ['Millikan Oil Drop', 'Davisson–Germer', 'Young\'s Double Slit', 'Rutherford Scattering'],
    correct: 2,
    explanation: 'Young\'s double-slit experiment (1801) demonstrated the wave nature of light through interference.',
  },
]

// ── Flashcards ─────────────────────────────────────────────────────────────────
export const flashcards = [
  {
    id: 1,
    subject: 'Physics',
    front: 'What is Wave-Particle Duality?',
    back: 'The concept that every quantum entity can be described as either a particle or a wave. Light and electrons exhibit both behaviors depending on the experiment.',
  },
  {
    id: 2,
    subject: 'Physics',
    front: 'State the Heisenberg Uncertainty Principle',
    back: 'Δx · Δp ≥ ℏ/2 — It is impossible to simultaneously know both the exact position and exact momentum of a particle with perfect precision.',
  },
  {
    id: 3,
    subject: 'Chemistry',
    front: 'What is Avogadro\'s Number?',
    back: '6.022 × 10²³ mol⁻¹ — the number of particles (atoms, molecules, ions) in one mole of a substance.',
  },
  {
    id: 4,
    subject: 'Mathematics',
    front: 'Define a Derivative',
    back: 'The derivative f\'(x) represents the instantaneous rate of change of f(x) with respect to x. Geometrically it is the slope of the tangent line at that point.',
  },
  {
    id: 5,
    subject: 'Biology',
    front: 'What is Mitosis?',
    back: 'A type of cell division resulting in two daughter cells each having the same number of chromosomes as the parent nucleus. Phases: Prophase → Metaphase → Anaphase → Telophase.',
  },
]

// ── Schedule ───────────────────────────────────────────────────────────────────
export const todaySchedule = [
  {
    id: 1,
    time: '10:00',
    title: 'Physics Lecture',
    topic: 'Topic: Wave Nature of Matter',
    tag: 'LIVE',
    tagColor: 'blue',
    borderColor: 'border-l-blue-500',
  },
  {
    id: 2,
    time: '14:00',
    title: 'Practice Session',
    topic: 'Subject: Organic Chemistry',
    tag: '60 MINS',
    tagColor: 'slate',
    borderColor: 'border-l-emerald-500',
  },
  {
    id: 3,
    time: '17:00',
    title: 'Flashcard Review',
    topic: 'Quantum Mechanics Deck',
    tag: '30 MINS',
    tagColor: 'purple',
    borderColor: 'border-l-purple-500',
  },
]

// ── Analytics Chart Data ────────────────────────────────────────────────────────
export const weeklyStudyData = [
  { day: 'M', hours: 4.5 },
  { day: 'T', hours: 6.0 },
  { day: 'W', hours: 3.8 },
  { day: 'T', hours: 5.5 },
  { day: 'F', hours: 2.0 },
  { day: 'S', hours: 5.2 },
  { day: 'S', hours: 5.0 },
]

// ── AI Chat ────────────────────────────────────────────────────────────────────
export const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    content: 'Hi Yashlok! 👋 What can I help you study today? I can explain concepts, generate flashcards, or create a mind map.',
  },
]

// ── User Profile ──────────────────────────────────────────────────────────────
export const user = {
  name: 'Yashlok',
  email: 'yashlok@studyhub.app',
  grade: 'Class 12 — JEE Advanced',
  streak: 7,
  totalHours: 248,
  lessonsCompleted: 86,
  accuracy: 85,
  avatar: 'https://i.pravatar.cc/150?img=56',
}
