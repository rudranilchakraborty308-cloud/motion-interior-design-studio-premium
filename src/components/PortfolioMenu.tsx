import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight } from 'lucide-react';

const categories = [
  { id: 'residential', title: 'Residential', count: '12 Projects', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800' },
  { id: 'commercial', title: 'Commercial', count: '08 Projects', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' },
  { id: 'hospitality', title: 'Hospitality', count: '05 Projects', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800' },
  { id: 'objects', title: 'Objects & Art', count: '24 Pieces', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800' },
];

export default function PortfolioMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: '-100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-pale-white pt-24 pb-12 px-6 lg:px-12 flex flex-col"
        >
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-sans text-lg tracking-widest uppercase text-dark-khaki">Portfolio Dimensions</h2>
            <button 
              onClick={onClose}
              className="group flex items-center gap-2 font-sans tracking-widest uppercase text-sm hover:text-dark-khaki transition-colors"
            >
              Close <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-full">
              {categories.map((cat, i) => (
                <motion.a
                  href="#portfolio"
                  onClick={onClose}
                  key={cat.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1), duration: 0.8, ease: "easeOut" }}
                  className="group block h-[50vh] md:h-full relative overflow-hidden"
                >
                  <img 
                    src={cat.image} 
                    alt={cat.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <h3 className="font-serif text-3xl text-pale-white mb-2">{cat.title}</h3>
                    <div className="flex justify-between items-center text-pale-white/80 font-sans text-xs tracking-widest uppercase border-t border-pale-white/30 pt-4 mt-4">
                      <span>{cat.count}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
