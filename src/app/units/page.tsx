'use client';

import MainLayout from '@/components/layout/MainLayout';
import { 
  Ruler, 
  Weight, 
  Clock, 
  Thermometer, 
  Box, 
  Zap, 
  Cpu, 
  ArrowRight,
  Info,
  Maximize2,
  Minimize2,
  Wind,
  Layers,
  CircleDot,
  Volume2,
  Sun,
  Flame
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const unitCategories = [
  {
    id: 'length',
    name: 'Length & Distance',
    icon: Ruler,
    color: 'from-blue-500 to-cyan-500',
    units: [
      { name: 'Nanometer (nm)', scale: 'Micro', value: '10⁻⁹ m', def: 'Atomic-scale measurement for light and particles.', ex: 'Width of a single DNA strand (2.5 nm).' },
      { name: 'Micrometer (μm)', scale: 'Micro', value: '10⁻⁶ m', def: 'Also called a micron; standard in biology.', ex: 'Diameter of a red blood cell (about 7 μm).' },
      { name: 'Millimeter (mm)', scale: 'Small', value: '0.001 m', def: 'Standard for small mechanical parts.', ex: 'Thickness of a standard dime (1.35 mm).' },
      { name: 'Centimeter (cm)', scale: 'Small', value: '0.01 m', def: 'Everyday metric unit for handheld objects.', ex: 'Width of a standard pencil (about 0.7 cm).' },
      { name: 'Meter (m)', scale: 'Base', value: '1 m', def: 'The fundamental SI unit of length.', ex: 'Average height of a kitchen countertop (0.9 m).' },
      { name: 'Kilometer (km)', scale: 'Large', value: '1,000 m', def: 'Primary unit for travel and geography.', ex: 'The height of Mount Everest (8.85 km).' },
      { name: 'Light-year (ly)', scale: 'Macro', value: '9.46 × 10¹² km', def: 'The distance light travels in one year.', ex: 'Distance to our nearest star, Alpha Centauri (4.37 ly).' },
      { name: 'Parsec (pc)', scale: 'Macro', value: '3.26 ly', def: 'Used by astronomers for deep space distances.', ex: 'The center of our galaxy is about 8,000 pc away.' },
    ]
  },
  {
    id: 'area-volume',
    name: 'Area & Volume',
    icon: Box,
    color: 'from-emerald-500 to-teal-500',
    units: [
      { name: 'Square Meter (m²)', scale: 'Base', value: '1 m × 1 m', def: 'Standard unit for surface area.', ex: 'A standard king-size bed is roughly 4 m².' },
      { name: 'Hectare (ha)', scale: 'Large', value: '10,000 m²', def: 'Commonly used for land and farming.', ex: 'A standard international football pitch is ~0.7 ha.' },
      { name: 'Acre', scale: 'Large', value: '4,047 m²', def: 'Imperial unit for land area.', ex: 'A typical suburban house lot is 1/4 of an acre.' },
      { name: 'Milliliter (ml)', scale: 'Small', value: '1 cm³', def: 'Unit for liquid volume.', ex: 'A single teaspoon holds about 5 ml of liquid.' },
      { name: 'Liter (L)', scale: 'Base', value: '1,000 ml', def: 'The standard metric unit for capacity.', ex: 'A standard large soda bottle is 2 liters.' },
      { name: 'Gallon (US)', scale: 'Base', value: '3.785 L', def: 'Standard liquid measure in the US.', ex: 'A typical kitchen sink holds 15-20 gallons.' },
      { name: 'Cubic Meter (m³)', scale: 'Large', value: '1,000 L', def: 'Unit for large-scale volume or storage.', ex: 'An Olympic swimming pool holds 2,500 m³ of water.' },
    ]
  },
  {
    id: 'physics',
    name: 'Force & Energy',
    icon: Zap,
    color: 'from-orange-500 to-rose-500',
    units: [
      { name: 'Newton (N)', scale: 'Base', value: '1 kg·m/s²', def: 'Unit of force required to move mass.', ex: 'Weight of a small apple (approx. 1 Newton).' },
      { name: 'Joule (J)', scale: 'Base', value: '1 N·m', def: 'The basic unit of energy or work.', ex: 'Energy needed to lift an apple 1 meter up (1 J).' },
      { name: 'Watt (W)', scale: 'Base', value: '1 J/s', def: 'Unit of power measuring energy flow.', ex: 'A standard LED light bulb uses about 9 Watts.' },
      { name: 'Pascal (Pa)', scale: 'Small', value: '1 N/m²', def: 'Unit of pressure or stress.', ex: 'A single sheet of paper exerts about 1 Pa on a table.' },
      { name: 'Horsepower (hp)', scale: 'Large', value: '745.7 Watts', def: 'Unit of power used for engines.', ex: 'A small lawnmower engine has about 3-5 hp.' },
      { name: 'Calorie (kcal)', scale: 'Base', value: '4,184 Joules', def: 'Energy needed to heat 1kg of water by 1°C.', ex: 'An average apple contains about 95 calories.' },
    ]
  },
  {
    id: 'temp',
    name: 'Temperature',
    icon: Thermometer,
    color: 'from-red-500 to-orange-500',
    units: [
      { name: 'Celsius (°C)', scale: 'Base', value: 'Metric Scale', def: 'Based on the freezing/boiling of water.', ex: 'Water freezes at 0°C and boils at 100°C.' },
      { name: 'Fahrenheit (°F)', scale: 'Base', value: 'US Scale', def: 'Common temperature scale in the US.', ex: 'Human body temperature is roughly 98.6°F.' },
      { name: 'Kelvin (K)', scale: 'Base', value: 'Absolute Scale', def: 'Used in science; 0 K is Absolute Zero.', ex: 'Outer space has a temperature of about 2.7 K.' },
      { name: 'Planck Temp', scale: 'Macro', value: '1.4 × 10³² K', def: 'The highest possible theoretical temperature.', ex: 'The temperature of the universe at its very birth.' },
    ]
  },
  {
    id: 'speed',
    name: 'Speed & Motion',
    icon: Wind,
    color: 'from-cyan-500 to-blue-500',
    units: [
      { name: 'Meters/Sec (m/s)', scale: 'Base', value: 'Distance/Time', def: 'The standard scientific unit for speed.', ex: 'A fast human runner can reach 10 m/s.' },
      { name: 'Km/Hour (km/h)', scale: 'Large', value: 'Distance/Time', def: 'Standard unit for vehicle speed.', ex: 'Speed limit on a major highway (100 km/h).' },
      { name: 'Knot (kn)', scale: 'Large', value: '1.85 km/h', def: 'Used for maritime and air navigation.', ex: 'A typical cruise ship travels at 20-25 knots.' },
      { name: 'Mach', scale: 'Large', value: 'Speed of Sound', def: 'Ratio of object speed to speed of sound.', ex: 'A fighter jet can fly at Mach 2 (twice sound speed).' },
      { name: 'Speed of Light (c)', scale: 'Macro', value: '299,792 km/s', def: 'The universal speed limit.', ex: 'Light can travel around Earth 7.5 times in 1 sec.' },
    ]
  },
  {
    id: 'angles',
    name: 'Angles & Rotation',
    icon: CircleDot,
    color: 'from-violet-500 to-fuchsia-500',
    units: [
      { name: 'Degree (°)', scale: 'Base', value: '1/360 of circle', def: 'Most common unit for measuring angles.', ex: 'A right angle is exactly 90 degrees.' },
      { name: 'Radian (rad)', scale: 'Base', value: '180/π degrees', def: 'Standard unit for angles in mathematics.', ex: 'A full circle is exactly 2π radians.' },
      { name: 'Arcsecond (")', scale: 'Micro', value: '1/3600 degree', def: 'Extremely precise unit for astronomy.', ex: 'Apparent size of a distant star in a telescope.' },
      { name: 'RPM', scale: 'Large', value: 'Rotations / Min', def: 'Measures how fast something spins.', ex: 'A car engine idles at about 800 RPM.' },
    ]
  },
  {
    id: 'data',
    name: 'Digital Data',
    icon: Cpu,
    color: 'from-slate-500 to-slate-400',
    units: [
      { name: 'Bit (b)', scale: 'Micro', value: 'Binary Digit', def: 'Smallest piece of digital info (0 or 1).', ex: 'A single switch being ON or OFF.' },
      { name: 'Byte (B)', scale: 'Small', value: '8 bits', def: 'Standard unit for storing one character.', ex: 'The letter "A" takes 1 byte of storage.' },
      { name: 'Kilobyte (KB)', scale: 'Small', value: '1,000 bytes', def: 'Common unit for small text files and code documents.', ex: 'A page of plain text is about 2 KB.' },
      { name: 'Megabyte (MB)', scale: 'Base', value: '1 million bytes', def: 'Used for photos and documents.', ex: 'A standard smartphone photo is 2-5 MB.' },
      { name: 'Gigabyte (GB)', scale: 'Large', value: '1 billion bytes', def: 'Unit for movies and modern apps.', ex: 'An HD movie is about 4-8 GB.' },
      { name: 'Terabyte (TB)', scale: 'Large', value: '1 trillion bytes', def: 'Capacity of modern computer drives.', ex: 'A 1TB drive can store 250,000 songs.' },
      { name: 'Petabyte (PB)', scale: 'Large', value: '1 quadrillion bytes', def: 'Used for massive database storage and large-scale cloud operations.', ex: 'All photos on Facebook combined require hundreds of petabytes.' },
      { name: 'Exabyte (EB)', scale: 'Macro', value: '1 quintillion bytes', def: 'Used to measure internet-scale data traffic and storage.', ex: 'Global internet traffic is measured in hundreds of exabytes per month.' },
      { name: 'Zettabyte (ZB)', scale: 'Macro', value: '1 sextillion bytes', def: 'Measures the aggregate sum of all data in the digital universe.', ex: 'The total amount of digital data created globally in 2025 was estimated to be around 175 ZB.' },
      { name: 'Yottabyte (YB)', scale: 'Macro', value: '1 septillion bytes', def: 'The largest officially recognized unit of digital storage.', ex: 'Storing all words ever spoken by humans in HD audio would take about 42 YB.' },
    ]
  }
];

export default function UnitsPage() {
  const [activeCategory, setActiveCategory] = useState(unitCategories[0].id);

  const currentCategory = unitCategories.find(c => c.id === activeCategory)!;

  return (
    <MainLayout>
      <div className="space-y-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-heading font-black text-foreground tracking-tighter mb-4">
              Universal <span className="gradient-text">Measures</span>
            </h1>
            <p className="text-foreground/50 font-medium text-lg max-w-2xl">
              From the quantum vibrations of an atom to the expansion of galaxies. The complete guide to measuring our reality.
            </p>
          </div>
          <div className="flex flex-wrap bg-card/50 p-2 rounded-3xl border border-border backdrop-blur-md max-w-full overflow-x-auto no-scrollbar">
             {unitCategories.map((cat) => (
               <button
                 key={cat.id}
                 onClick={() => setActiveCategory(cat.id)}
                 className={cn(
                   "p-4 rounded-2xl transition-all duration-300 relative group shrink-0",
                   activeCategory === cat.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/50 hover:text-foreground"
                 )}
                 title={cat.name}
               >
                 <cat.icon className="w-5 h-5" />
                 {activeCategory === cat.id && (
                    <motion.div layoutId="active-cat" className="absolute inset-0 bg-primary rounded-2xl -z-10" />
                 )}
               </button>
             ))}
          </div>
        </div>

        {/* Category Hero */}
        <div className={cn(
          "relative p-12 md:p-20 rounded-[56px] overflow-hidden border border-border shadow-2xl",
          "bg-card/40 backdrop-blur-xl"
        )}>
           <div className={cn("absolute top-0 right-0 w-96 h-96 blur-[150px] opacity-20 bg-gradient-to-br", currentCategory.color)} />
           
           <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
              <div className={cn("w-24 h-24 rounded-[32px] flex items-center justify-center border border-border bg-foreground/5")}>
                 <currentCategory.icon className="w-12 h-12 text-foreground" />
              </div>
              <div>
                 <h2 className="text-4xl md:text-5xl font-heading font-black text-foreground uppercase tracking-tight mb-2">
                    {currentCategory.name}
                 </h2>
                 <p className="text-foreground/40 text-lg font-medium">Standard units used to quantify {currentCategory.name.toLowerCase()}.</p>
              </div>
           </div>
        </div>

        {/* Units Grid */}
        <div className="space-y-8">
           <div className="flex items-center justify-between px-6">
              <h3 className="text-xl font-heading font-black text-foreground uppercase tracking-widest">Unit Inventory</h3>
              <div className="flex items-center space-x-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 <div className="flex items-center"><Minimize2 className="w-3 h-3 mr-2" /> Micro-Scale</div>
                 <div className="flex items-center">Macro-Scale <Maximize2 className="w-3 h-3 ml-2" /></div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentCategory.units.map((unit, index) => (
                <motion.div
                  key={unit.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                                    className="group p-8 rounded-[40px] bg-card/40 border border-border hover:border-primary/30 transition-all duration-500 backdrop-blur-md relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 text-primary" />
                   </div>
 
                   <div className="flex items-start justify-between mb-8">
                      <div>
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-4 inline-block shadow-sm",
                          unit.scale === 'Micro' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                          unit.scale === 'Macro' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                          unit.scale === 'Large' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                          "bg-primary/10 text-primary border-primary/20"
                        )}>
                          {unit.scale}
                        </span>
                        <h4 className="text-3xl font-heading font-black text-foreground tracking-tight">{unit.name}</h4>
                      </div>
                      <div className="text-right">
                         <p className="text-xl font-black text-primary">{unit.value}</p>
                         <p className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">Reference</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="p-6 rounded-3xl bg-foreground/5 border border-border shadow-inner">
                         <p className="text-base font-medium text-foreground/80 leading-relaxed">
                            <span className="text-primary font-black uppercase tracking-widest text-[10px] block mb-2 opacity-60">General Definition</span>
                            {unit.def}
                         </p>
                      </div>
                      <div className="p-6 rounded-3xl bg-foreground/5 border border-border group-hover:bg-primary/5 transition-colors">
                         <p className="text-base font-medium text-foreground/60">
                            <span className="text-secondary font-black uppercase tracking-widest text-[10px] block mb-2 opacity-60">Contextual Example</span>
                            &ldquo;{unit.ex}&rdquo;
                         </p>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>

        {/* Informational Footer */}
        <section className="p-16 rounded-[56px] bg-card/40 border border-border shadow-2xl relative overflow-hidden backdrop-blur-md">
           <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5" />
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                 <h3 className="text-4xl font-heading font-black text-foreground mb-6 uppercase tracking-tight">The Precision of Math</h3>
                 <p className="text-foreground/40 text-xl leading-relaxed font-medium mb-10">
                    Measurement is the language of the physical world. Without standard units, we couldn&rsquo;t build skyscrapers, navigate the oceans, or understand the expansion of our universe.
                 </p>
                 <div className="flex flex-wrap gap-4">
                    {['SI Standard', 'Universal Constants', 'Precision Metrics', 'Metric vs Imperial'].map(label => (
                      <div key={label} className="px-6 py-4 rounded-2xl bg-foreground/5 border border-border text-xs font-black text-foreground uppercase tracking-[0.2em]">{label}</div>
                    ))}
                 </div>
              </div>
              <div className="lg:col-span-5 bg-foreground/5 p-10 rounded-[48px] border border-border shadow-inner">
                 <div className="flex items-center space-x-6 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                       <Zap className="text-primary w-8 h-8" />
                    </div>
                    <h4 className="text-2xl font-heading font-black text-foreground">Critical Logic</h4>
                 </div>
                 <p className="text-foreground/50 font-medium text-lg leading-relaxed">
                    &ldquo;When you can measure what you are speaking about, and express it in numbers, you know something about it.&rdquo; 
                    <span className="block mt-4 text-foreground/40 text-sm font-black">— Lord Kelvin</span>
                 </p>
              </div>
           </div>
        </section>
      </div>
    </MainLayout>
  );
}
