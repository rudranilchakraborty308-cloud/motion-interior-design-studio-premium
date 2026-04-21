import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';
const fallbackTestimonials = [
  {
    quote: "They completely transformed our Victorian townhouse. The attention to detail and ability to mix contemporary styling with antique pieces is unmatched.",
    author: "Eleanor & James",
    location: "Kensington"
  },
  {
    quote: "A remarkably talented team. They understood our vision perfectly and delivered a space that feels both incredibly luxurious and completely livable.",
    author: "Sarah Harding",
    location: "Notting Hill"
  }
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>(fallbackTestimonials);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setTestimonials(data);
        } else {
          setTestimonials(fallbackTestimonials);
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setTestimonials(fallbackTestimonials);
      }
    };
    
    fetchData();

    const channel = supabase.channel('testimonials_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section className="py-24 md:py-40 px-6 lg:px-12 bg-dark-khaki text-pale-white relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
        <svg width="400" height="400" viewBox="0 0 100 100" className="w-full h-full text-pale-white">
          <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="font-sans text-sm tracking-widest uppercase mb-4 text-pale-white/80">Client Words</h2>
          <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl text-pale-white">Kind Words</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          {testimonials.map((test, index) => (
            <motion.div 
              key={test.id || test.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="relative"
            >
              <Quote className="w-12 h-12 text-pale-white/20 mb-6" />
              <p className="font-serif text-2xl md:text-3xl leading-relaxed mb-8">
                "{test.quote}"
              </p>
              <div className="font-sans tracking-widest text-[11px] uppercase">
                <span className="font-semibold">{test.author}</span>
                <span className="text-pale-white/60 ml-2">/ {test.location}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
