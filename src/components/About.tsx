import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function About() {
  const [content, setContent] = useState<any>({
    subtitle: 'About the Studio',
    title: 'Creating joyful, layered spaces that reflect the people who live in them.',
    p1: 'We approach each project with a fresh perspective, combining classical principles with unexpected details. Our studio believes that a well-designed space should not only look beautiful but completely function around your lifestyle.',
    p2: 'From historic renovations to modern new builds, our work is defined by bespoke craftsmanship, rich textures, and a profound respect for architectural integrity.',
    image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=800',
    est_year: '2016'
  });

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', 'about')
        .single();
      
      if (data) {
        setContent((prev: any) => ({ 
          ...prev, 
          ...data, 
          subtitle: data.subtitle ?? prev.subtitle,
          title: data.title ?? prev.title,
          p1: data.p1 ?? prev.p1,
          p2: data.p2 ?? prev.p2,
          image: data.image ?? prev.image,
          est_year: data.est_year ?? prev.est_year
        }));
      }
    };

    fetchContent();

    const channel = supabase.channel('about_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content', filter: 'id=eq.about' }, (payload) => {
        if (payload.new) {
          const d = payload.new as any;
          setContent((prev: any) => ({ 
            ...prev, 
            ...d, 
            subtitle: d.subtitle ?? prev.subtitle,
            title: d.title ?? prev.title,
            p1: d.p1 ?? prev.p1,
            p2: d.p2 ?? prev.p2,
            image: d.image ?? prev.image,
            est_year: d.est_year ?? prev.est_year
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section id="about" className="py-24 md:py-40 px-6 lg:px-12 bg-alabaster">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="bg-pale-white p-4 pb-16 md:p-6 md:pb-20 shadow-xl shadow-black/5 rotate-[-2deg] relative z-10"
            >
              <img 
                src={content.image} 
                alt="Studio image"
                className="w-full h-auto aspect-square object-cover grayscale opacity-90"
              />
              {content.est_year && (
                <p className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 font-sans text-xs tracking-widest text-black/60 uppercase">
                  Est. {content.est_year}
                </p>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="font-sans text-sm tracking-widest uppercase text-dark-khaki mb-6">{content.subtitle}</h2>
            <h3 className="font-serif text-3xl md:text-5xl lg:text-6xl text-black leading-tight mb-8 whitespace-pre-wrap">
              {content.title}
            </h3>
            
            <p className="font-sans text-stone-600 leading-relaxed mb-8 whitespace-pre-wrap">
              {content.p1}
            </p>
            
            <p className="font-sans text-stone-600 leading-relaxed mb-12 whitespace-pre-wrap">
              {content.p2}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
