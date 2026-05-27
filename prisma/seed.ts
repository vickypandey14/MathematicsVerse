import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    key: 'algebra',
    name: 'Algebra',
    slug: 'algebra',
    icon: 'SquareRoot',
    description:
      'The foundation of modern mathematics, dealing with symbols and the rules for manipulating them.',
  },
  {
    key: 'calculus',
    name: 'Calculus',
    slug: 'calculus',
    icon: 'Variable',
    description:
      'The mathematical study of continuous change, focusing on derivatives and integrals.',
  },
  {
    key: 'geometry',
    name: 'Geometry',
    slug: 'geometry',
    icon: 'Shapes',
    description: 'The study of sizes, shapes, positions, and dimensions of things.',
  },
  {
    key: 'trigonometry',
    name: 'Trigonometry',
    slug: 'trigonometry',
    icon: 'Triangle',
    description: 'The study of relationships between side lengths and angles of triangles.',
  },
  {
    key: 'statistics',
    name: 'Statistics',
    slug: 'statistics',
    icon: 'BarChart',
    description:
      'The discipline that concerns the collection, organization, analysis, interpretation, and presentation of data.',
  },
] as const;

type CategoryKey = (typeof categories)[number]['key'];

const formulas: Array<{
  title: string;
  slug: string;
  latex: string;
  explanation: string;
  useCase: string;
  example: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  featured?: boolean;
  category: CategoryKey;
  diagram?: string;
  history?: string;
}> = [
  {
    title: 'Quadratic Formula',
    slug: 'quadratic-formula',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    explanation: 'Finds the real or complex roots of a quadratic equation in standard form.',
    useCase: 'Projectile motion, optimization, finance, and curve intersections.',
    example: 'For x^2 - 5x + 6 = 0, the roots are x = 2 and x = 3.',
    difficulty: 'Beginner',
    featured: true,
    category: 'algebra',
    diagram:
      'graph LR; A[ax^2 + bx + c = 0] --> B{Discriminant}; B --> C[Two roots]; B --> D[One root]; B --> E[Complex roots];',
    history:
      'Quadratic methods were known to Babylonian mathematicians and later formalized through Indian, Persian, and European algebraic traditions.',
  },
  {
    title: "Euler's Identity",
    slug: 'eulers-identity',
    latex: 'e^{i\\pi} + 1 = 0',
    explanation: 'Connects exponential growth, imaginary numbers, circular motion, unity, and zero.',
    useCase: 'Complex analysis, signal processing, Fourier methods, and quantum mechanics.',
    example: "It is a special case of Euler's formula e^{ix} = cos(x) + i sin(x).",
    difficulty: 'Advanced',
    featured: true,
    category: 'algebra',
    diagram: "graph TD; E[e] --- ID[Euler's Identity]; I[i] --- ID; PI[pi] --- ID; ONE[1] --- ID; ZERO[0] --- ID;",
    history:
      'Leonhard Euler published the broader exponential-trigonometric relationship in the eighteenth century.',
  },
  {
    title: 'Pythagorean Theorem',
    slug: 'pythagorean-theorem',
    latex: 'a^2 + b^2 = c^2',
    explanation: 'Relates the side lengths of a right triangle.',
    useCase: 'Construction, surveying, navigation, robotics, and computer graphics.',
    example: 'A right triangle with legs 3 and 4 has hypotenuse 5.',
    difficulty: 'Beginner',
    featured: true,
    category: 'geometry',
    diagram: 'graph TD; A[a^2] --- C[c^2]; B[b^2] --- C;',
    history:
      'Known to Babylonian, Indian, and Chinese mathematicians before its Greek association with Pythagoras.',
  },
  {
    title: 'Fundamental Theorem of Calculus',
    slug: 'fundamental-theorem-calculus',
    latex: '\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)',
    explanation: 'Links accumulation through integration with rates of change through differentiation.',
    useCase: 'Area under curves, work, displacement, probability, and cumulative change.',
    example: 'Integrating 2x from 0 to 2 gives F(2) - F(0) = 4.',
    difficulty: 'Intermediate',
    featured: true,
    category: 'calculus',
    history:
      'Developed through the work of Barrow, Newton, and Leibniz in the seventeenth century.',
  },
  {
    title: 'Area of a Circle',
    slug: 'area-circle',
    latex: 'A = \\pi r^2',
    explanation: 'Computes the space enclosed by a circle from its radius.',
    useCase: 'Design, architecture, manufacturing, landscaping, and physics.',
    example: 'A circle with radius 5 has area 25pi.',
    difficulty: 'Beginner',
    featured: true,
    category: 'geometry',
    history:
      'Archimedes used exhaustion arguments to connect circle area with radius and circumference.',
  },
  {
    title: "Bayes' Theorem",
    slug: 'bayes-theorem',
    latex: 'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}',
    explanation: 'Updates the probability of a hypothesis after observing evidence.',
    useCase: 'Medical testing, spam filters, AI, risk analysis, and decision systems.',
    example: 'A test result changes a prior probability into a posterior probability.',
    difficulty: 'Advanced',
    featured: true,
    category: 'statistics',
    history:
      'Named after Thomas Bayes and later developed into a major statistical framework by Laplace.',
  },
  {
    title: 'Slope-Intercept Form',
    slug: 'slope-intercept-form',
    latex: 'y = mx + b',
    explanation: 'Represents a line using its slope and y-intercept.',
    useCase: 'Linear models, trend lines, forecasting, and coordinate geometry.',
    example: 'For y = 2x + 3, the slope is 2 and the y-intercept is 3.',
    difficulty: 'Beginner',
    category: 'algebra',
  },
  {
    title: 'Discriminant',
    slug: 'discriminant',
    latex: '\\Delta = b^2 - 4ac',
    explanation: 'Determines the nature of roots of a quadratic equation.',
    useCase: 'Classifying solutions before solving a quadratic.',
    example: 'If Delta is negative, the quadratic has no real roots.',
    difficulty: 'Beginner',
    category: 'algebra',
  },
  {
    title: 'Binomial Theorem',
    slug: 'binomial-theorem',
    latex: '(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k}a^{n-k}b^k',
    explanation: 'Expands powers of a binomial into a sum of terms.',
    useCase: 'Combinatorics, probability, algebraic expansion, and approximation.',
    example: '(x + y)^3 = x^3 + 3x^2y + 3xy^2 + y^3.',
    difficulty: 'Intermediate',
    category: 'algebra',
  },
  {
    title: 'Arithmetic Sequence',
    slug: 'arithmetic-sequence',
    latex: 'a_n = a_1 + (n-1)d',
    explanation: 'Finds a term in a sequence with constant difference.',
    useCase: 'Pattern analysis, budgeting, scheduling, and discrete models.',
    example: 'If a1 = 5 and d = 3, then a4 = 14.',
    difficulty: 'Beginner',
    category: 'algebra',
  },
  {
    title: 'Geometric Sequence',
    slug: 'geometric-sequence',
    latex: 'a_n = a_1 r^{n-1}',
    explanation: 'Finds a term in a sequence with constant ratio.',
    useCase: 'Compound growth, depreciation, population models, and finance.',
    example: 'If a1 = 2 and r = 3, then a4 = 54.',
    difficulty: 'Beginner',
    category: 'algebra',
  },
  {
    title: 'Change of Base Formula',
    slug: 'change-of-base',
    latex: '\\log_b(x) = \\frac{\\log_k(x)}{\\log_k(b)}',
    explanation: 'Converts logarithms from one base to another.',
    useCase: 'Calculators, exponential models, chemistry, and information theory.',
    example: 'log_2(8) = log(8) / log(2) = 3.',
    difficulty: 'Intermediate',
    category: 'algebra',
  },
  {
    title: '2x2 Matrix Determinant',
    slug: 'matrix-det-2x2',
    latex: '\\det\\begin{pmatrix}a & b\\\\ c & d\\end{pmatrix}=ad-bc',
    explanation: 'Measures the signed area scaling of a two-dimensional linear transformation.',
    useCase: 'Linear algebra, transformations, graphics, and systems of equations.',
    example: 'For [[1,2],[3,4]], det = 1*4 - 2*3 = -2.',
    difficulty: 'Intermediate',
    category: 'algebra',
  },
  {
    title: 'Power Rule',
    slug: 'power-rule',
    latex: '\\frac{d}{dx}x^n = nx^{n-1}',
    explanation: 'Differentiates a power function quickly.',
    useCase: 'Rates of change, optimization, and curve analysis.',
    example: 'The derivative of x^5 is 5x^4.',
    difficulty: 'Beginner',
    category: 'calculus',
  },
  {
    title: 'Product Rule',
    slug: 'product-rule',
    latex: '(fg)^{\\prime} = f^{\\prime}g + fg^{\\prime}',
    explanation: 'Differentiates a product of two functions.',
    useCase: 'Physics, economics, and any model with multiplied changing quantities.',
    example: 'For x^2 sin(x), derivative is 2x sin(x) + x^2 cos(x).',
    difficulty: 'Intermediate',
    category: 'calculus',
  },
  {
    title: 'Chain Rule',
    slug: 'chain-rule',
    latex: '\\frac{d}{dx}f(g(x)) = f^{\\prime}(g(x))g^{\\prime}(x)',
    explanation: 'Differentiates a composite function.',
    useCase: 'Nested functions, motion models, neural networks, and optimization.',
    example: 'The derivative of sin(x^2) is 2x cos(x^2).',
    difficulty: 'Intermediate',
    category: 'calculus',
  },
  {
    title: 'Integration by Parts',
    slug: 'integration-by-parts',
    latex: '\\int u\\,dv = uv - \\int v\\,du',
    explanation: 'Transforms difficult integrals using the product rule in reverse.',
    useCase: 'Physics, probability, engineering, and advanced integration.',
    example: 'Use u = x and dv = e^x dx to integrate x e^x.',
    difficulty: 'Intermediate',
    category: 'calculus',
  },
  {
    title: 'Taylor Series',
    slug: 'taylor-series',
    latex: 'f(x)=\\sum_{n=0}^{\\infty}\\frac{f^{(n)}(a)}{n!}(x-a)^n',
    explanation: 'Approximates a function near a point using derivatives.',
    useCase: 'Numerical methods, physics, engineering, and computer graphics.',
    example: 'e^x = 1 + x + x^2/2! + x^3/3! + ... around 0.',
    difficulty: 'Advanced',
    category: 'calculus',
  },
  {
    title: 'Arc Length',
    slug: 'arc-length',
    latex: 'L = \\int_a^b \\sqrt{1 + (f^{\\prime}(x))^2}\\,dx',
    explanation: 'Computes the length of a smooth curve over an interval.',
    useCase: 'Engineering, path planning, geometry, and physics.',
    example: 'It measures the true curve distance, not just horizontal displacement.',
    difficulty: 'Advanced',
    category: 'calculus',
  },
  {
    title: 'Circumference of a Circle',
    slug: 'circumference-circle',
    latex: 'C = 2\\pi r',
    explanation: 'Computes the distance around a circle.',
    useCase: 'Wheels, circular tracks, gears, and construction.',
    example: 'A circle with radius 7 has circumference 14pi.',
    difficulty: 'Beginner',
    category: 'geometry',
  },
  {
    title: 'Distance Formula',
    slug: 'distance-formula',
    latex: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
    explanation: 'Finds the straight-line distance between two coordinate points.',
    useCase: 'Maps, graphics, games, robotics, and analytic geometry.',
    example: 'The distance from (0,0) to (3,4) is 5.',
    difficulty: 'Beginner',
    category: 'geometry',
  },
  {
    title: 'Triangle Area',
    slug: 'triangle-area',
    latex: 'A = \\frac{1}{2}bh',
    explanation: 'Computes the area of a triangle from base and height.',
    useCase: 'Architecture, design, land measurement, and geometry proofs.',
    example: 'A triangle with base 10 and height 6 has area 30.',
    difficulty: 'Beginner',
    category: 'geometry',
  },
  {
    title: 'Sphere Surface Area',
    slug: 'sphere-surface',
    latex: 'S = 4\\pi r^2',
    explanation: 'Computes the surface area of a sphere.',
    useCase: 'Packaging, physics, astronomy, and materials science.',
    example: 'A sphere with radius 3 has surface area 36pi.',
    difficulty: 'Intermediate',
    category: 'geometry',
  },
  {
    title: 'Sphere Volume',
    slug: 'sphere-volume',
    latex: 'V = \\frac{4}{3}\\pi r^3',
    explanation: 'Computes the volume enclosed by a sphere.',
    useCase: 'Fluid capacity, astronomy, 3D design, and physics.',
    example: 'A sphere with radius 3 has volume 36pi.',
    difficulty: 'Intermediate',
    category: 'geometry',
  },
  {
    title: 'Law of Sines',
    slug: 'law-of-sines',
    latex: '\\frac{a}{\\sin A}=\\frac{b}{\\sin B}=\\frac{c}{\\sin C}',
    explanation: 'Relates triangle side lengths to the sines of their opposite angles.',
    useCase: 'Surveying, navigation, and solving oblique triangles.',
    example: 'Use it when one side-angle opposite pair is known.',
    difficulty: 'Intermediate',
    category: 'trigonometry',
  },
  {
    title: 'Law of Cosines',
    slug: 'law-of-cosines',
    latex: 'c^2 = a^2 + b^2 - 2ab\\cos C',
    explanation: 'Generalizes the Pythagorean theorem to non-right triangles.',
    useCase: 'Navigation, triangulation, and geometry problems.',
    example: 'When C = 90 degrees, cos C = 0 and it becomes Pythagorean.',
    difficulty: 'Intermediate',
    category: 'trigonometry',
  },
  {
    title: 'Sine Double Angle',
    slug: 'sine-double-angle',
    latex: '\\sin(2\\theta)=2\\sin\\theta\\cos\\theta',
    explanation: 'Expresses the sine of a double angle using sine and cosine.',
    useCase: 'Wave analysis, identities, integration, and trigonometric simplification.',
    example: 'If sin(theta)=3/5 and cos(theta)=4/5, then sin(2theta)=24/25.',
    difficulty: 'Intermediate',
    category: 'trigonometry',
  },
  {
    title: 'Cosine Double Angle',
    slug: 'cosine-double-angle',
    latex: '\\cos(2\\theta)=\\cos^2\\theta-\\sin^2\\theta',
    explanation: 'Expresses the cosine of a double angle in multiple equivalent forms.',
    useCase: 'Signal processing, calculus, and trigonometric simplification.',
    example: 'It can also be written as 2cos^2(theta)-1.',
    difficulty: 'Intermediate',
    category: 'trigonometry',
  },
  {
    title: 'Trig Identity',
    slug: 'trig-identity-1',
    latex: '\\sin^2\\theta + \\cos^2\\theta = 1',
    explanation: 'The foundational identity connecting sine and cosine.',
    useCase: 'Simplifying expressions, solving equations, and wave analysis.',
    example: 'If sin(theta)=3/5, then cos^2(theta)=16/25.',
    difficulty: 'Beginner',
    category: 'trigonometry',
  },
  {
    title: 'Mean',
    slug: 'mean',
    latex: '\\bar{x}=\\frac{1}{n}\\sum_{i=1}^{n}x_i',
    explanation: 'Computes the arithmetic average of a data set.',
    useCase: 'Reports, analytics, experiments, and performance tracking.',
    example: 'The mean of 2, 4, and 9 is 5.',
    difficulty: 'Beginner',
    category: 'statistics',
  },
  {
    title: 'Variance',
    slug: 'variance',
    latex: '\\sigma^2=\\frac{1}{N}\\sum_{i=1}^{N}(x_i-\\mu)^2',
    explanation: 'Measures how spread out values are from the mean.',
    useCase: 'Risk, quality control, finance, and scientific analysis.',
    example: 'Low variance means values cluster close to the mean.',
    difficulty: 'Intermediate',
    category: 'statistics',
  },
  {
    title: 'Standard Deviation',
    slug: 'standard-deviation',
    latex: '\\sigma=\\sqrt{\\frac{1}{N}\\sum_{i=1}^{N}(x_i-\\mu)^2}',
    explanation: 'Expresses typical spread from the mean in original units.',
    useCase: 'Test scores, finance, lab measurements, and uncertainty.',
    example: 'A smaller standard deviation means more consistent values.',
    difficulty: 'Intermediate',
    category: 'statistics',
  },
  {
    title: 'Z-Score',
    slug: 'z-score',
    latex: 'z = \\frac{x-\\mu}{\\sigma}',
    explanation: 'Measures how many standard deviations a value is from the mean.',
    useCase: 'Standardization, normal distributions, and outlier detection.',
    example: 'A z-score of 2 is two standard deviations above the mean.',
    difficulty: 'Intermediate',
    category: 'statistics',
  },
  {
    title: 'Combination Formula',
    slug: 'combination-formula',
    latex: '\\binom{n}{r}=\\frac{n!}{r!(n-r)!}',
    explanation: 'Counts selections where order does not matter.',
    useCase: 'Probability, lotteries, sampling, and combinatorics.',
    example: 'Choosing 2 from 5 gives 10 combinations.',
    difficulty: 'Intermediate',
    category: 'statistics',
  },
  {
    title: 'Permutation Formula',
    slug: 'permutation-formula',
    latex: 'P(n,r)=\\frac{n!}{(n-r)!}',
    explanation: 'Counts arrangements where order matters.',
    useCase: 'Scheduling, passwords, rankings, and combinatorics.',
    example: 'Arranging 3 from 5 gives 60 permutations.',
    difficulty: 'Intermediate',
    category: 'statistics',
  },
  {
    title: 'Normal Distribution',
    slug: 'normal-distribution',
    latex: 'f(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}',
    explanation: 'Models many natural measurements with a symmetric bell-shaped curve.',
    useCase: 'Statistics, quality control, psychology, finance, and science.',
    example: 'Heights and measurement errors are often modeled approximately normally.',
    difficulty: 'Advanced',
    category: 'statistics',
  },
];

async function main() {
  const categoryByKey: Record<CategoryKey, string> = {} as Record<CategoryKey, string>;

  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        icon: category.icon,
        description: category.description,
      },
      create: {
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        description: category.description,
      },
    });

    categoryByKey[category.key] = saved.id;
  }

  for (const formula of formulas) {
    await prisma.formula.upsert({
      where: { slug: formula.slug },
      update: {
        title: formula.title,
        latex: formula.latex,
        explanation: formula.explanation,
        useCase: formula.useCase,
        example: formula.example,
        difficulty: formula.difficulty,
        featured: formula.featured ?? false,
        categoryId: categoryByKey[formula.category],
        diagram: formula.diagram,
        history: formula.history,
      },
      create: {
        title: formula.title,
        slug: formula.slug,
        latex: formula.latex,
        explanation: formula.explanation,
        useCase: formula.useCase,
        example: formula.example,
        difficulty: formula.difficulty,
        featured: formula.featured ?? false,
        categoryId: categoryByKey[formula.category],
        diagram: formula.diagram,
        history: formula.history,
      },
    });
  }

  console.log(`Seed completed: ${formulas.length} formulas available.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
