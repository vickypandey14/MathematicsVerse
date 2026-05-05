import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calculator } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex items-center justify-center pt-20">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-slate-800">
            <Calculator className="text-primary w-12 h-12" />
          </div>
          <h1 className="text-6xl font-heading font-black text-white mb-6">404</h1>
          <h2 className="text-2xl font-bold text-slate-300 mb-8">This formula hasn't been discovered yet.</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-10">
            The page you're looking for doesn't exist or has been moved to another dimension.
          </p>
          <Link
            href="/"
            className="px-10 py-5 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-transform inline-block"
          >
            Back to Reality
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
