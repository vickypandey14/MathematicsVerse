# MathematicsVerse

MathematicsVerse is a platform built to make exploring mathematical concepts clear and interactive. It uses a modern, technical design language called Aetheric Flux to provide a focused environment for students, teachers, and anyone interested in the logic of the universe.

GitHub Repository: https://github.com/vickypandey14/MathematicsVerse

---

## Core Features

### Math Library
A collection of formulas and principles ranging from basic algebra to advanced physics. Every page includes:
- Clear explanations and real-world applications.
- Interactive calculators for solving equations.
- Dynamic graphs and diagrams to visualize the underlying logic.

### Roman Numerals
A complete reference for the ancient Roman numbering system.
- Grid covering numbers 1 to 100 with dynamic conversion.
- Quick reference for major symbols like M, D, C, L, X, V, and I.
- A simple guide explaining the addition and subtraction rules.

### Units and Measurements
A comprehensive database of universal scales, from the microscopic to the cosmic.
- Categories include Length, Mass, Time, Data, Speed, Force, and Temperature.
- Each unit includes a technical definition and a relatable example to provide context.
- Units are organized by scale to help users understand relative size.

### Kids Corner
A dedicated section designed to help younger learners master multiplication.
- Instant table generator for any number up to 5 digits.
- Tables shown up to the 20th multiple.
- A clean, high-contrast interface built specifically for educational focus.

---

## Technical Setup

### Prerequisites
- Node.js (Latest LTS version recommended)
- npm or yarn

### Installation
1. Clone the repository:
   git clone https://github.com/vickypandey14/MathematicsVerse.git

2. Install dependencies:
   npm install

3. Set up the database:
   npx prisma generate
   npx prisma db push
   npx prisma db seed

4. Run the development server:
   npm run dev

Open http://localhost:3000 in your browser to see the application.

---

## Design and Technology
The project is built with a focus on speed and clarity. It uses Next.js for the core framework, Tailwind CSS for styling, and Prisma for database management. The Aetheric Flux theme uses a deep navy background with high-contrast indigo and fuchsia accents to maintain a professional, data-centric feel.

### Tech Stack
- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- Database: Prisma (SQLite)
- Math Rendering: KaTeX
- Diagrams: Mermaid.js
- Animations: Framer Motion
- Icons: Lucide React

---

## Folder Structure
- /src/app: Pages and routing logic.
- /src/components: Reusable UI components.
- /src/lib: Data utilities and state management.
- /prisma: Database schema and seeding scripts.

---

## License
This project is licensed under the MIT License.
