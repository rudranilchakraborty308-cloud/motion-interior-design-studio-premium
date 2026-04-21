import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
export default function Hero() {
  const [content, setContent] = useState<any>({
    subtitle: 'Original & Creative Design',
    title: 'Spaces that\nInspire & Endure.',
    ctaText: 'Explore Projects',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000'
  });

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from('content').select('*').eq('id', 'hero').single();
      if (data) {
        setContent((prev: any) => ({
          ...prev,
          ...data,
          title: data.title || prev.title,
          ctaText: data.cta_text || prev.ctaText,
          image: data.image || prev.image
        }));
      }
    };
    fetchContent();

    const channel = supabase.channel('hero_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content', filter: 'id=eq.hero' }, (payload) => {
        if (payload.new) {
          const d = payload.new as any;
          setContent((prev: any) => ({
            ...prev,
            ...d,
            title: d.title || prev.title,
            ctaText: d.cta_text || prev.ctaText,
            image: d.image || prev.image
          }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax feel */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={content.image} 
          alt="Elegant interior" 
          className="w-full h-full object-cover"
        />
        {/* Subtle overlay to make text readable */}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 mt-16 max-w-4xl mx-auto">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-pale-white/90 font-serif italic tracking-wide text-lg md:text-xl lg:text-2xl mb-4 drop-shadow-md"
        >
          {content.subtitle}
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-pale-white text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-tight mb-8 drop-shadow-lg font-sans whitespace-pre-wrap"
        >
          {content.title}
        </motion.h1>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 1, delay: 1 }}
        >
          <a 
            href="#portfolio" 
            className="inline-block border border-pale-white text-pale-white font-sans uppercase tracking-widest text-xs py-4 px-10 hover:bg-pale-white hover:text-black transition-colors duration-300 backdrop-blur-sm"
          >
            {content.ctaText}
          </a>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-pale-white flex flex-col items-center gap-2"
      >
        <span className="font-sans text-[10px] tracking-widest uppercase">Scroll</span>
        <div className="w-[1px] h-12 bg-pale-white/50 relative overflow-hidden">
          <motion.div 
            animate={{ top: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute left-0 w-full h-1/2 bg-pale-white"
          />
        </div>
      </motion.div>
    </section>
  );
}
