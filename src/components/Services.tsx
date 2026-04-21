import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
export default function Services() {
  const [content, setContent] = useState<any>({
    subtitle: 'Our Approach',
    title: 'Comprehensive Services',
    s1Title: 'Interior Architecture',
    s1Desc: 'Structural planning, space optimization, and architectural detailing to create harmonious environments from the ground up.',
    s2Title: 'Bespoke Joinery & Furniture',
    s2Desc: 'Custom-designed pieces that perfectly fit your space, marrying function with exquisite craftsmanship.',
    s3Title: 'Styling & Sourcing',
    s3Desc: 'Curating art, antiques, and contemporary pieces tailored to your personal taste and the character of the property.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200'
  });

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from('content').select('*').eq('id', 'services').single();
      if (data) {
        setContent((prev: any) => ({ 
          ...prev, 
          ...data, 
          image: data.image || prev.image 
        }));
      }
    };
    fetchContent();

    const channel = supabase.channel('services_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content', filter: 'id=eq.services' }, (payload) => {
        if (payload.new) {
          const d = payload.new as any;
          setContent((prev: any) => ({ 
            ...prev, 
            ...d, 
            image: d.image || prev.image 
          }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const services = [
    { title: content.s1_title || content.s1Title, description: content.s1_desc || content.s1Desc, num: '01' },
    { title: content.s2_title || content.s2Title, description: content.s2_desc || content.s2Desc, num: '02' },
    { title: content.s3_title || content.s3Title, description: content.s3_desc || content.s3Desc, num: '03' }
  ];

  return (
    <section id="services" className="py-24 md:py-40 px-6 lg:px-12 bg-pale-white">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <div className="order-2 lg:order-1">
            <h2 className="font-sans text-4xl md:text-5xl font-light mb-16 text-black">
              {content.title}
            </h2>

            <div className="space-y-12">
              {services.map((service) => (
                <div key={service.num} className="relative pl-12 border-l border-khaki/30">
                  <span className="absolute left-0 top-0 -translate-x-1/2 bg-pale-white py-2 text-xs font-sans tracking-widest text-dark-khaki uppercase">
                    {service.num}
                  </span>
                  <h3 className="font-serif text-2xl text-black mb-3">{service.title}</h3>
                  <p className="font-sans text-sm text-stone-500 leading-relaxed max-w-md">{service.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            {/* Oval Masked Image per Luxury Design Recipe */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-[3/4] w-full max-w-md mx-auto"
              style={{
                maskImage: 'ellipse(48% 48% at 50% 50%)',
                WebkitMaskImage: 'ellipse(48% 48% at 50% 50%)'
              }}
            >
              <img 
                src={content.image} 
                alt="Detailed interior styling"
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <div className="absolute top-1/2 -right-6 lg:-right-12 -translate-y-1/2">
               <span className="writing-vertical-rl rotate-180 transform font-sans tracking-[0.2em] uppercase text-[10px] text-dark-khaki">
                 {content.subtitle}
               </span>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
