import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.bookmark.deleteMany();
  await prisma.formula.deleteMany();
  await prisma.category.deleteMany();

  const algebra = await prisma.category.create({
    data: {
      name: 'Algebra',
      slug: 'algebra',
      icon: 'SquareRoot',
      description: 'The foundation of modern mathematics, dealing with symbols and the rules for manipulating them.',
    },
  });

  const calculus = await prisma.category.create({
    data: {
      name: 'Calculus',
      slug: 'calculus',
      icon: 'Variable',
      description: 'The mathematical study of continuous change, focusing on derivatives and integrals.',
    },
  });

  const geometry = await prisma.category.create({
    data: {
      name: 'Geometry',
      slug: 'geometry',
      icon: 'Shapes',
      description: 'The study of sizes, shapes, positions, and dimensions of things.',
    },
  });

  const trigonometry = await prisma.category.create({
    data: {
      name: 'Trigonometry',
      slug: 'trigonometry',
      icon: 'Triangle',
      description: 'The study of relationships between side lengths and angles of triangles.',
    },
  });

  const statistics = await prisma.category.create({
    data: {
      name: 'Statistics',
      slug: 'statistics',
      icon: 'BarChart',
      description: 'The discipline that concerns the collection, organization, analysis, interpretation, and presentation of data.',
    },
  });

  await prisma.formula.create({
    data: {
      title: 'Quadratic Formula',
      slug: 'quadratic-formula',
      latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      explanation: 'Used to find the roots of a quadratic equation of the form ax² + bx + c = 0.',
      useCase: 'Calculating trajectories, finding maximum/minimum values in economics.',
      example: 'For 1x² - 5x + 6 = 0, the roots are x=2 and x=3.',
      difficulty: 'Beginner',
      featured: true,
      categoryId: algebra.id,
      diagram: 'graph LR; A[ax² + bx + c = 0] --> B{Calculate Δ}; B -->|Δ > 0| C[2 Real Roots]; B -->|Δ = 0| D[1 Real Root]; B -->|Δ < 0| E[Complex Roots];',
    },
  });

  await prisma.formula.create({
    data: {
      title: 'Euler\'s Identity',
      slug: 'eulers-identity',
      latex: 'e^{i\\pi} + 1 = 0',
      explanation: 'Often called the most beautiful theorem in mathematics, linking five fundamental constants.',
      useCase: 'Complex analysis, signal processing, quantum mechanics.',
      example: 'Relates exponential functions to trigonometric functions via Euler\'s formula e^{ix} = cos(x) + i sin(x).',
      difficulty: 'Advanced',
      featured: true,
      categoryId: algebra.id,
      diagram: 'graph TD; E[e] --- ID[Euler\'s Identity]; I[i] --- ID; PI[π] --- ID; ONE[1] --- ID; ZERO[0] --- ID;',
    },
  });

  await prisma.formula.create({
    data: {
      title: 'Binomial Theorem',
      slug: 'binomial-theorem',
      latex: '(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k}b^k',
      explanation: 'Describes the algebraic expansion of powers of a binomial.',
      useCase: 'Probability distributions, polynomial approximations.',
      example: '(x+y)² = x² + 2xy + y².',
      difficulty: 'Intermediate',
      categoryId: algebra.id,
    },
  });

  await prisma.formula.create({
    data: {
      title: 'Power Rule',
      slug: 'power-rule',
      latex: '\\frac{d}{dx}x^n = nx^{n-1}',
      explanation: 'A fundamental rule for finding the derivative of power functions.',
      useCase: 'Finding the rate of change of any polynomial function.',
      example: 'The derivative of x³ is 3x².',
      difficulty: 'Beginner',
      categoryId: calculus.id,
    },
  });

  await prisma.formula.create({
    data: {
      title: 'Fundamental Theorem of Calculus',
      slug: 'fundamental-theorem-calculus',
      latex: '\\int_{a}^{b} f(x) dx = F(b) - F(a)',
      explanation: 'Connects the concept of differentiating a function with the concept of integrating a function.',
      useCase: 'Calculating area under curves, physical work, cumulative change.',
      example: 'Integrating 2x from 0 to 2 gives [x²] from 0 to 2 = 4 - 0 = 4.',
      difficulty: 'Intermediate',
      featured: true,
      categoryId: calculus.id,
    },
  });

  await prisma.formula.create({
    data: {
      title: 'Taylor Series',
      slug: 'taylor-series',
      latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n',
      explanation: 'Represents a function as an infinite sum of terms calculated from the values of its derivatives at a single point.',
      useCase: 'Approximating complex functions (sin, cos, exp) in calculators.',
      example: 'The Taylor series for e^x at a=0 is 1 + x + x²/2! + x³/3! + ...',
      difficulty: 'Advanced',
      categoryId: calculus.id,
    },
  });

  await prisma.formula.create({
    data: {
      title: 'Pythagorean Theorem',
      slug: 'pythagorean-theorem',
      latex: 'a^2 + b^2 = c^2',
      explanation: 'In a right-angled triangle, the square of the hypotenuse is equal to the sum of squares of the other two sides.',
      useCase: 'Navigation, construction, computer graphics.',
      example: 'A triangle with sides 3 and 4 has a hypotenuse of √(3² + 4²) = 5.',
      difficulty: 'Beginner',
      featured: true,
      categoryId: geometry.id,
      diagram: 'graph TD; A[a²] --- C[c²]; B[b²] --- C; style C fill:#6366f1,stroke:#fff,stroke-width:4px; style A fill:#06b6d4,stroke:#fff; style B fill:#06b6d4,stroke:#fff;',
    },
  });

  await prisma.formula.create({
    data: {
      title: 'Area of a Circle',
      slug: 'area-circle',
      latex: 'A = \\pi r^2',
      explanation: 'Calculates the space inside a circle given its radius.',
      useCase: 'Manufacturing, land measurement, circular object design.',
      example: 'A circle with radius 3 has area 9π ≈ 28.27.',
      difficulty: 'Beginner',
      categoryId: geometry.id,
    },
  });

  await prisma.formula.create({
    data: {
      title: 'Law of Sines',
      slug: 'law-of-sines',
      latex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
      explanation: 'Relates the lengths of the sides of any triangle to the sines of its angles.',
      useCase: 'Triangulation in surveying and mapping.',
      example: 'If side a=5, angle A=30°, side b can be found if angle B is known.',
      difficulty: 'Intermediate',
      categoryId: trigonometry.id,
    },
  });

  await prisma.formula.create({
    data: {
      title: 'Law of Cosines',
      slug: 'law-of-cosines',
      latex: 'c^2 = a^2 + b^2 - 2ab \\cos C',
      explanation: 'An extension of the Pythagorean theorem for any triangle.',
      useCase: 'Determining the distance between two points on a map.',
      example: 'If a=3, b=4, and angle C=60°, then c² = 9 + 16 - 2(3)(4)(0.5) = 13, so c ≈ 3.6.',
      difficulty: 'Intermediate',
      categoryId: trigonometry.id,
    },
  });

  await prisma.formula.create({
    data: {
      title: 'Standard Deviation',
      slug: 'standard-deviation',
      latex: '\\sigma = \\sqrt{\\frac{\\sum(x_i - \\mu)^2}{N}}',
      explanation: 'Measures the amount of variation or dispersion of a set of values.',
      useCase: 'Risk assessment in finance, quality control in manufacturing.',
      example: 'A low SD means data points are close to the mean.',
      difficulty: 'Intermediate',
      categoryId: statistics.id,
    },
  });

  await prisma.formula.create({
    data: {
      title: 'Bayes\' Theorem',
      slug: 'bayes-theorem',
      latex: 'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}',
      explanation: 'Describes the probability of an event, based on prior knowledge of conditions that might be related to the event.',
      useCase: 'Spam filtering, medical diagnosis, AI machine learning.',
      example: 'Updating the probability of a disease given a positive test result.',
      difficulty: 'Advanced',
      categoryId: statistics.id,
    },
  });

  const moreFormulas = [
    { title: 'Logarithm Quotient Rule', slug: 'log-quotient', latex: '\\log_b(\\frac{x}{y}) = \\log_b x - \\log_b y', cat: algebra.id, diff: 'Beginner' },
    { title: 'Integration by Parts', slug: 'integration-parts', latex: '\\int u dv = uv - \\int v du', cat: calculus.id, diff: 'Intermediate' },
    { title: 'Gaussian Integral', slug: 'gaussian-integral', latex: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}', cat: calculus.id, diff: 'Advanced' },
    { title: 'Surface Area of a Sphere', slug: 'sphere-surface', latex: 'A = 4\\pi r^2', cat: geometry.id, diff: 'Beginner' },
    { title: 'Trigonometric Identity (Pythagorean)', slug: 'trig-identity-1', latex: '\\sin^2 \\theta + \\cos^2 \\theta = 1', cat: trigonometry.id, diff: 'Beginner' },
    { title: 'Matrix Determinant (2x2)', slug: 'matrix-det-2x2', latex: '\\det \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc', cat: algebra.id, diff: 'Beginner' },
    { title: 'Mean Value Theorem', slug: 'mean-value-theorem', latex: 'f\'(c) = \\frac{f(b)-f(a)}{b-a}', cat: calculus.id, diff: 'Intermediate' },
    { title: 'Normal Distribution (PDF)', slug: 'normal-dist', latex: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}(\\frac{x-\\mu}{\\sigma})^2}', cat: statistics.id, diff: 'Advanced' },
  ];

  for (const f of moreFormulas) {
    await prisma.formula.create({
      data: {
        title: f.title,
        slug: f.slug,
        latex: f.latex,
        explanation: 'Detailed explanation for ' + f.title,
        useCase: 'Real world use case for ' + f.title,
        example: 'Step-by-step example for ' + f.title,
        difficulty: f.diff,
        categoryId: f.cat,
      },
    });
  }

  console.log('Seed completed: 5 categories and 20+ formulas created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
