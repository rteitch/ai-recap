export type LatexCategory =
  | "math"
  | "calculus"
  | "physics"
  | "algebra"
  | "matrix"
  | "trigonometry"
  | "greek"
  | "symbol"
  | "logic";

export type LatexSuggestion = {
  command: string;
  snippet: string;
  label: string;
  description: string;
  category: LatexCategory;
};

export const LATEX_SUGGESTIONS: LatexSuggestion[] = [
  // --- Fractions & Roots ---
  {
    command: "\\frac",
    snippet: "\\frac{a}{b}",
    label: "Fraction",
    description: "Fraction with numerator a and denominator b",
    category: "math",
  },
  {
    command: "\\cfrac",
    snippet: "\\cfrac{a}{b + \\cfrac{c}{d}}",
    label: "Continued Fraction",
    description: "Cleanly formatted continued fraction",
    category: "math",
  },
  {
    command: "\\sqrt",
    snippet: "\\sqrt{x}",
    label: "Square Root",
    description: "Square root of x",
    category: "math",
  },
  {
    command: "\\sqrtn",
    snippet: "\\sqrt[n]{x}",
    label: "N-th Root",
    description: "N-th root of x",
    category: "math",
  },

  // --- Calculus & Analysis ---
  {
    command: "\\int",
    snippet: "\\int_{a}^{b} f(x)\\,dx",
    label: "Definite Integral",
    description: "Integral of f(x) from a to b",
    category: "calculus",
  },
  {
    command: "\\iint",
    snippet: "\\iint_{D} f(x, y)\\,dx\\,dy",
    label: "Double Integral",
    description: "Double integral over region D",
    category: "calculus",
  },
  {
    command: "\\oint",
    snippet: "\\oint_{C} \\vec{F} \\cdot d\\vec{r}",
    label: "Contour / Line Integral",
    description: "Closed line integral over curve C",
    category: "calculus",
  },
  {
    command: "\\diff",
    snippet: "\\frac{df}{dx}",
    label: "Derivative",
    description: "First derivative of f with respect to x",
    category: "calculus",
  },
  {
    command: "\\partial",
    snippet: "\\frac{\\partial f}{\\partial x}",
    label: "Partial Derivative",
    description: "Partial derivative with respect to x",
    category: "calculus",
  },
  {
    command: "\\lim",
    snippet: "\\lim_{x \\to 0} f(x)",
    label: "Limit of Function",
    description: "Limit of f(x) as x approaches 0",
    category: "calculus",
  },
  {
    command: "\\liminf",
    snippet: "\\lim_{x \\to \\infty} \\frac{1}{x} = 0",
    label: "Limit at Infinity",
    description: "Limit of function as x approaches infinity",
    category: "calculus",
  },
  {
    command: "\\sum",
    snippet: "\\sum_{i=1}^{n} x_i",
    label: "Summation (Sigma)",
    description: "Summation notation from i=1 to n",
    category: "calculus",
  },
  {
    command: "\\prod",
    snippet: "\\prod_{i=1}^{n} x_i",
    label: "Product (Capital Pi)",
    description: "Repeated product notation",
    category: "calculus",
  },
  {
    command: "\\nabla",
    snippet: "\\nabla f(x,y,z)",
    label: "Gradient / Del Operator (Nabla)",
    description: "Vector differential gradient operator",
    category: "calculus",
  },

  // --- Physics & Science ---
  {
    command: "\\einstein",
    snippet: "E = mc^2",
    label: "Mass-Energy Equivalence",
    description: "Special relativity: Energy = mass x c²",
    category: "physics",
  },
  {
    command: "\\gasideal",
    snippet: "PV = nRT",
    label: "Ideal Gas Law",
    description: "Thermodynamics ideal gas state equation",
    category: "physics",
  },
  {
    command: "\\newton2",
    snippet: "\\vec{F} = m\\vec{a}",
    label: "Newton's Second Law",
    description: "Force = mass x acceleration",
    category: "physics",
  },
  {
    command: "\\gravitasi",
    snippet: "F = G \\frac{m_1 m_2}{r^2}",
    label: "Newton's Universal Gravitation",
    description: "Gravitational force between two masses",
    category: "physics",
  },
  {
    command: "\\kalor",
    snippet: "Q = mc\\Delta T",
    label: "Thermal Heat Equation",
    description: "Heat = mass x specific heat x temperature delta",
    category: "physics",
  },
  {
    command: "\\glbb",
    snippet: "s = v_0 t + \\frac{1}{2}at^2",
    label: "Kinematic Distance Equation",
    description: "Uniformly accelerated linear motion",
    category: "physics",
  },
  {
    command: "\\debroglie",
    snippet: "\\lambda = \\frac{h}{p}",
    label: "De Broglie Wavelength",
    description: "Quantum mechanics: matter wavelength",
    category: "physics",
  },
  {
    command: "\\coulomb",
    snippet: "F = k \\frac{|q_1 q_2|}{r^2}",
    label: "Coulomb's Law",
    description: "Electrostatic force between charges",
    category: "physics",
  },

  // --- Algebra & Polynomials ---
  {
    command: "\\kuadratik",
    snippet: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    label: "Quadratic Formula",
    description: "Roots of ax² + bx + c = 0",
    category: "algebra",
  },
  {
    command: "\\binomial",
    snippet: "(a + b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k",
    label: "Binomial Theorem",
    description: "Binomial algebraic expansion",
    category: "algebra",
  },
  {
    command: "\\binom",
    snippet: "\\binom{n}{k} = \\frac{n!}{k!(n-k)!}",
    label: "Combinations (n choose k)",
    description: "Combinatorial binomial notation",
    category: "algebra",
  },
  {
    command: "\\log",
    snippet: "\\log_{a}(b)",
    label: "Logarithm (Base a)",
    description: "Logarithm with specified base",
    category: "algebra",
  },
  {
    command: "\\ln",
    snippet: "\\ln(x)",
    label: "Natural Logarithm (ln)",
    description: "Logarithm base e",
    category: "algebra",
  },

  // --- Linear Algebra & Matrices ---
  {
    command: "\\matrix2",
    snippet: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
    label: "2x2 Matrix (Parentheses)",
    description: "Two-by-two square matrix",
    category: "matrix",
  },
  {
    command: "\\matrix3",
    snippet: "\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}",
    label: "3x3 Matrix (Brackets)",
    description: "Three-by-three square matrix",
    category: "matrix",
  },
  {
    command: "\\det",
    snippet: "\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc",
    label: "Matrix Determinant",
    description: "Determinant of a 2x2 matrix",
    category: "matrix",
  },
  {
    command: "\\vec",
    snippet: "\\vec{v} = \\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}",
    label: "3D Column Vector",
    description: "Three-dimensional spatial vector",
    category: "matrix",
  },
  {
    command: "\\dotprod",
    snippet: "\\vec{u} \\cdot \\vec{v} = |\\vec{u}||\\vec{v}|\\cos\\theta",
    label: "Dot Product (Scalar)",
    description: "Vector dot product scalar",
    category: "matrix",
  },
  {
    command: "\\crossprod",
    snippet: "\\vec{u} \\times \\vec{v}",
    label: "Cross Product (Vector)",
    description: "Perpendicular vector cross product",
    category: "matrix",
  },

  // --- Trigonometry ---
  {
    command: "\\sin",
    snippet: "\\sin(\\theta)",
    label: "Sine (sin)",
    description: "Sine trigonometric function",
    category: "trigonometry",
  },
  {
    command: "\\cos",
    snippet: "\\cos(\\theta)",
    label: "Cosine (cos)",
    description: "Cosine trigonometric function",
    category: "trigonometry",
  },
  {
    command: "\\tan",
    snippet: "\\tan(\\theta) = \\frac{\\sin\\theta}{\\cos\\theta}",
    label: "Tangent (tan)",
    description: "Tangent trigonometric ratio",
    category: "trigonometry",
  },
  {
    command: "\\trigident",
    snippet: "\\sin^2\\theta + \\cos^2\\theta = 1",
    label: "Pythagorean Trigonometric Identity",
    description: "Fundamental sin² + cos² = 1 identity",
    category: "trigonometry",
  },
  {
    command: "\\arctan",
    snippet: "\\arctan(x)",
    label: "Arctangent (Inverse Tan)",
    description: "Inverse trigonometric tangent",
    category: "trigonometry",
  },

  // --- Greek Letters ---
  {
    command: "\\pi",
    snippet: "\\pi",
    label: "Pi (π ≈ 3.14159)",
    description: "Circle circumference ratio constant",
    category: "greek",
  },
  {
    command: "\\theta",
    snippet: "\\theta",
    label: "Theta (θ Angle)",
    description: "Trigonometric angle symbol",
    category: "greek",
  },
  {
    command: "\\alpha",
    snippet: "\\alpha",
    label: "Alpha (α Coefficient)",
    description: "Alpha coefficient or angle",
    category: "greek",
  },
  {
    command: "\\beta",
    snippet: "\\beta",
    label: "Beta (β Radiation / Angle)",
    description: "Beta symbol or particle",
    category: "greek",
  },
  {
    command: "\\gamma",
    snippet: "\\gamma",
    label: "Gamma (γ Relativity)",
    description: "Lorentz factor or gamma ray",
    category: "greek",
  },
  {
    command: "\\Delta",
    snippet: "\\Delta",
    label: "Capital Delta (Δ Change / Discriminant)",
    description: "Change or discriminant symbol",
    category: "greek",
  },
  {
    command: "\\delta",
    snippet: "\\delta",
    label: "Small Delta (δ Variation)",
    description: "Infinitesimal variation or Dirac delta",
    category: "greek",
  },
  {
    command: "\\lambda",
    snippet: "\\lambda",
    label: "Lambda (λ Wavelength)",
    description: "Wavelength or eigenvalue",
    category: "greek",
  },
  {
    command: "\\mu",
    snippet: "\\mu",
    label: "Mu (μ Micro / Friction)",
    description: "Friction coefficient or micro prefix (10⁻⁶)",
    category: "greek",
  },
  {
    command: "\\rho",
    snippet: "\\rho",
    label: "Rho (ρ Density / Resistivity)",
    description: "Mass density or electrical resistivity",
    category: "greek",
  },
  {
    command: "\\sigma",
    snippet: "\\sigma",
    label: "Small Sigma (σ Standard Deviation)",
    description: "Standard deviation or stress symbol",
    category: "greek",
  },
  {
    command: "\\omega",
    snippet: "\\omega",
    label: "Small Omega (ω Angular Velocity)",
    description: "Angular frequency or velocity",
    category: "greek",
  },
  {
    command: "\\Omega",
    snippet: "\\Omega",
    label: "Capital Omega (Ω Ohm Resistance)",
    description: "Electrical resistance unit (Ohm)",
    category: "greek",
  },

  // --- Logic & Sets ---
  {
    command: "\\le",
    snippet: "\\le",
    label: "Less than or equal (≤)",
    description: "Less than or equal inequality relation",
    category: "logic",
  },
  {
    command: "\\ge",
    snippet: "\\ge",
    label: "Greater than or equal (≥)",
    description: "Greater than or equal inequality relation",
    category: "logic",
  },
  {
    command: "\\ne",
    snippet: "\\ne",
    label: "Not Equal (≠)",
    description: "Inequality relation",
    category: "logic",
  },
  {
    command: "\\equiv",
    snippet: "\\equiv",
    label: "Identical / Equivalent (≡)",
    description: "Equivalence or identity relation",
    category: "logic",
  },
  {
    command: "\\approx",
    snippet: "\\approx",
    label: "Approximately Equal (≈)",
    description: "Approximation symbol",
    category: "symbol",
  },
  {
    command: "\\pm",
    snippet: "\\pm",
    label: "Plus-Minus (±)",
    description: "Tolerance or dual root symbol",
    category: "symbol",
  },
  {
    command: "\\times",
    snippet: "\\times",
    label: "Multiplication (×)",
    description: "Multiplication or dimension symbol",
    category: "symbol",
  },
  {
    command: "\\cdot",
    snippet: "\\cdot",
    label: "Dot Multiplication (⋅)",
    description: "Algebraic dot multiplication",
    category: "symbol",
  },
  {
    command: "\\div",
    snippet: "\\div",
    label: "Division (÷)",
    description: "Arithmetic division symbol",
    category: "symbol",
  },
  {
    command: "\\infty",
    snippet: "\\infty",
    label: "Infinity (∞)",
    description: "Mathematical infinity concept",
    category: "symbol",
  },
  {
    command: "\\in",
    snippet: "x \\in A",
    label: "Element Of (∈)",
    description: "Set membership: x is an element of A",
    category: "logic",
  },
  {
    command: "\\notin",
    snippet: "x \\notin A",
    label: "Not An Element (∉)",
    description: "Not a member of set",
    category: "logic",
  },
  {
    command: "\\subset",
    snippet: "A \\subset B",
    label: "Subset (⊂)",
    description: "Proper or general subset",
    category: "logic",
  },
  {
    command: "\\cup",
    snippet: "A \\cup B",
    label: "Set Union (∪)",
    description: "Union of two sets",
    category: "logic",
  },
  {
    command: "\\cap",
    snippet: "A \\cap B",
    label: "Set Intersection (∩)",
    description: "Intersection of two sets",
    category: "logic",
  },
  {
    command: "\\forall",
    snippet: "\\forall x \\in \\mathbb{R}",
    label: "For All / Universal (∀)",
    description: "Universal logical quantifier",
    category: "logic",
  },
  {
    command: "\\exists",
    snippet: "\\exists x",
    label: "Exists (∃)",
    description: "Existential logical quantifier",
    category: "logic",
  },
  {
    command: "\\implies",
    snippet: "P \\implies Q",
    label: "Implies (⟹ If P then Q)",
    description: "Logical implication",
    category: "logic",
  },
  {
    command: "\\iff",
    snippet: "P \\iff Q",
    label: "If and only if (⟺)",
    description: "Bidirectional logical equivalence",
    category: "logic",
  },
];
