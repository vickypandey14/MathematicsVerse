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
      history: 'The quadratic formula was known in various forms to ancient Babylonians as early as 2000 BC. However, the first person to provide a general solution using algebraic methods was the Indian mathematician Brahmagupta in the 7th century AD. It was later refined by Persian mathematician Al-Khwarizmi, whose work "Al-Jabr" gave the subject its name. The modern notation we use today was finalized in the 17th century by Rene Descartes.',
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
      history: 'While the formula e^{ix} = cos x + i sin x was attributed to Leonhard Euler in 1748, the specific identity e^{iπ} + 1 = 0 was likely known to him much earlier. Euler was a Swiss mathematician who made enormous contributions to almost every branch of mathematics. This identity is famous for uniting the five most important mathematical constants in a single, simple equation, a feat that has fascinated mathematicians and philosophers for centuries.',
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
      history: 'Although named after the Greek philosopher Pythagoras (c. 570–495 BC), the theorem was known to Babylonian, Indian, and Chinese mathematicians centuries before him. The earliest known record of the theorem appears in the Baudhayana Sulba Sutra of India, dating between 800 and 400 BC. Pythagoras is credited with bringing the knowledge to the Greek world and providing the first formal proof, though no written proof from his own time survives.',
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
      history: 'The theorem was first discovered by Isaac Barrow (Isaac Newton\'s teacher) in the 1660s. However, it was Newton and Gottfried Wilhelm Leibniz who independently developed the full theory of calculus and recognized the profound importance of this connection between derivatives and integrals. Their work in the late 17th century ignited a mathematical revolution that transformed physics and engineering.',
    },
  });

  const remainingFormulas = [
    { 
      title: 'Area of a Circle', 
      slug: 'area-circle', 
      latex: 'A = \\pi r^2', 
      cat: geometry.id, 
      diff: 'Beginner',
      history: 'The area of a circle has been studied since antiquity. Archimedes, in the 3rd century BC, used the method of exhaustion to prove that the area of a circle is equal to a right-angled triangle with the circumference as its base and the radius as its height. He also provided the first rigorous approximation of π, paving the way for the precise formula we use today.'
    },
    { 
      title: 'Bayes\' Theorem', 
      slug: 'bayes-theorem', 
      latex: 'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}', 
      cat: statistics.id, 
      diff: 'Advanced',
      history: 'Named after Reverend Thomas Bayes (1701–1761), who first used conditional probability to provide an algorithm that used evidence to calculate limits of an unknown parameter. His work was published posthumously in 1763. It was later rediscovered and significantly expanded by Pierre-Simon Laplace, who gave it the modern mathematical form. Today, it is the foundation of Bayesian statistics and modern AI.'
    }
  ];

  for (const f of remainingFormulas) {
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
        history: f.history,
      },
    });
  }

  console.log('Seed completed: Formula history added.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
