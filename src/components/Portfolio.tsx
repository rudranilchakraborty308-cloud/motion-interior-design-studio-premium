import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
const fallbackProjects = [
  {
    id: '1',
    title: 'The Kensington Townhouse',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200',
    description: 'A complete renovation of a five-story Victorian townhouse, balancing classical proportions with playful, contemporary colors.',
    gallery: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18efc2291?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: '2',
    title: 'Sussex Country House',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
    description: 'A sprawling estate embracing the beauty of the English countryside with organic textures and bespoke furniture.',
    gallery: [
      'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: '3',
    title: 'Soho Members Club',
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200',
    description: 'A vibrant and eclectic space designed for creatives to gather, work, and socialize.',
    gallery: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: '4',
    title: 'Notting Hill Apartment',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200',
    description: 'Maximizing space and light in a charming top-floor apartment overlooking communal gardens.',
    gallery: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

export default function Portfolio() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>(fallbackProjects);
  const [showAll, setShowAll] = useState(false);
  
  // Track active image in modal
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('portfolio')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
        
      if (data && data.length > 0) {
        setProjects(data);
      } else {
        setProjects(fallbackProjects);
      }
    };
    fetchData();

    const channel = supabase.channel('portfolio_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const selectedProject = projects.find(p => p.id === selectedId);
  const displayedProjects = showAll ? projects : projects.slice(0, 4);

  // When a project is selected, set initial active image
  useEffect(() => {
    if (selectedProject) {
      setActiveModalImage(selectedProject.image);
    }
  }, [selectedProject]);

  return (
    <section id="portfolio" className="py-32 px-6 lg:px-12 bg-alabaster relative">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h2 className="font-sans text-4xl md:text-5xl font-light mb-4 text-black">Featured Projects</h2>
            <p className="font-serif text-xl italic text-dark-khaki">A selection of our recent work</p>
          </div>
          {projects.length > 4 && (
             <button 
                onClick={() => setShowAll(!showAll)}
                className="hidden md:flex items-center gap-2 font-sans tracking-widest text-xs uppercase hover:text-dark-khaki transition-colors"
             >
               {showAll ? 'View Less' : 'View All Projects'} <ArrowRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
             </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {displayedProjects.map((project, index) => (
            <motion.div
              layoutId={`card-${project.id}`}
              key={project.id}
              className={`cursor-pointer group ${index % 2 !== 0 ? 'md:mt-24' : ''}`}
              onClick={() => setSelectedId(project.id)}
            >
              <div className="overflow-hidden relative aspect-[4/5] mb-6 shadow-sm border border-black/5 bg-white">
                <motion.img 
                  layoutId={`image-${project.id}`}
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <motion.div layoutId={`title-container-${project.id}`}>
                <p className="font-sans tracking-widest text-[10px] uppercase text-dark-khaki mb-2">{project.category}</p>
                <h3 className="font-serif text-3xl text-black group-hover:italic transition-all">{project.title}</h3>
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        {projects.length > 4 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="md:hidden mt-16 flex items-center gap-2 font-sans tracking-widest text-xs uppercase hover:text-dark-khaki transition-colors mx-auto"
          >
            {showAll ? 'View Less' : 'View All Projects'} <ArrowRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Portfolio Modal */}
      <AnimatePresence>
        {selectedId && selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedId(null)} // Click outside to close
          >
            <motion.div 
              layoutId={`card-${selectedProject.id}`}
              className="bg-pale-white w-full max-w-6xl max-h-[90vh] overflow-hidden relative shadow-2xl flex flex-col md:flex-row"
              style={{ borderRadius: '1rem' }}
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
            >
              <button 
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white text-black transition-colors shadow-sm cursor-pointer"
                onClick={() => setSelectedId(null)}
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-full md:w-1/2 h-[40vh] md:h-[90vh] bg-stone-100 flex items-center justify-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeModalImage ? (
                    <motion.img 
                      key={activeModalImage}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                      src={activeModalImage} 
                      alt={selectedProject.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <motion.img 
                      layoutId={`image-${selectedProject.id}`}
                      src={selectedProject.image} 
                      alt={selectedProject.title} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </AnimatePresence>
              </div>
              
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto max-h-[50vh] md:max-h-[90vh] flex flex-col items-start bg-pale-white relative z-10">
                <motion.div layoutId={`title-container-${selectedProject.id}`} className="mb-6 md:mb-8 mt-4 md:mt-0">
                  <p className="font-sans tracking-widest text-xs uppercase text-dark-khaki mb-2 md:mb-3">{selectedProject.category}</p>
                  <h3 className="font-serif text-3xl md:text-5xl text-black leading-tight pr-10">{selectedProject.title}</h3>
                </motion.div>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-sans text-stone-600 leading-relaxed mb-10 text-sm md:text-base"
                >
                  {selectedProject.description}
                </motion.p>
                
                {(selectedProject.gallery && selectedProject.gallery.length > 0) && (
                  <div className="w-full mt-auto">
                    <h4 className="font-sans tracking-widest text-[10px] md:text-xs uppercase mb-4 border-b border-black/10 pb-3">Gallery</h4>
                    <p className="text-[10px] md:text-xs text-stone-400 mb-4 font-sans tracking-wide">Click thumbnails to view</p>
                    <div className="grid grid-cols-3 gap-3 md:gap-4 pb-8">
                      {selectedProject.gallery.map((img: string, i: number) => (
                        <motion.button 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + (i * 0.1) }}
                          key={i} 
                          onClick={() => setActiveModalImage(img)}
                          className={`w-full aspect-square overflow-hidden border-2 transition-all duration-300 rounded cursor-pointer ${activeModalImage === img ? 'border-dark-khaki scale-95 opacity-50' : 'border-transparent hover:opacity-80 shadow-sm hover:shadow-md'}`}
                        >
                          <img 
                            src={img} 
                            className="w-full h-full object-cover"
                            alt="Gallery item"
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
