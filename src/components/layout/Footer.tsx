import { Calculator, Code, Send, Play, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Calculator className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-heading font-bold tracking-tight">
                Mathematics<span className="gradient-text">Verse</span>
              </span>
            </Link>
            <p className="text-foreground/60 text-lg mb-8 max-w-sm">
              Discover the beauty and power of mathematical formulas with our premium interactive platform.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/50 hover:bg-primary hover:text-white transition-all">
                <Send className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/50 hover:bg-primary hover:text-white transition-all">
                <Code className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/50 hover:bg-primary hover:text-white transition-all">
                <Play className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-foreground/60">
              <li><Link href="/formulas" className="hover:text-primary transition-colors">Explore Formulas</Link></li>
              <li><Link href="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link href="/bookmarks" className="hover:text-primary transition-colors">My Bookmarks</Link></li>
              <li><Link href="/recent" className="hover:text-primary transition-colors">Recently Viewed</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold mb-6">Newsletter</h4>
            <p className="text-foreground/50 text-sm mb-4">Stay updated with new formulas and features.</p>
            <form className="relative">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-foreground/5 border border-border rounded-xl py-3 px-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button className="absolute right-2 top-2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center hover:bg-primary/80 transition-colors">
                <Mail className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:row items-center justify-between space-y-4 md:space-y-0 text-foreground/40 text-xs">
          <p>© 2026 MathematicsVerse. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
