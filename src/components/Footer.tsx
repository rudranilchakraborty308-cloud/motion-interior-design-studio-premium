import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
export default function Footer() {
  const [globalContent, setGlobalContent] = useState<any>(null);
  const [footerContent, setFooterContent] = useState<any>({
    studioname: 'London Studio',
    addressline1: '15 Design Avenue',
    addressline2: 'Chelsea, London SW3 4ED',
    email: 'hello@studio.com',
    phone: '+44 (0) 20 7123 4567',
    instagram: '#',
    pinterest: '#'
  });

  useEffect(() => {
    const fetchGlobal = async () => {
      const { data } = await supabase.from('content').select('*').eq('id', 'global').single();
      if (data) setGlobalContent(data);
    };
    const fetchFooter = async () => {
      const { data } = await supabase.from('content').select('*').eq('id', 'footer').single();
      if (data) setFooterContent(data);
    };
    fetchGlobal();
    fetchFooter();

    const channelGlobal = supabase.channel('footer_global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content', filter: 'id=eq.global' }, (payload) => {
        if (payload.new) setGlobalContent(payload.new);
      }).subscribe();
      
    const channelFooter = supabase.channel('footer_content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content', filter: 'id=eq.footer' }, (payload) => {
        if (payload.new) setFooterContent(payload.new);
      }).subscribe();

    return () => { 
      supabase.removeChannel(channelGlobal); 
      supabase.removeChannel(channelFooter); 
    };
  }, []);

  return (
    <footer id="contact" className="bg-black text-pale-white pt-24 pb-12 px-6 lg:px-12 relative overflow-hidden">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-24 relative z-10">
          
          <div className="lg:col-span-2">
            <h2 className="font-serif text-5xl md:text-7xl mb-8 leading-tight">
              Ready to <br/>
              <span className="italic text-khaki">transform</span> your space?
            </h2>
            <p className="font-sans text-sm tracking-widest uppercase mb-4 text-pale-white/60">Let's Connect</p>
            <a href={`mailto:${footerContent.email}`} className="group inline-flex items-center gap-4 border-b border-khaki pb-2 font-sans tracking-widest lowercase hover:text-khaki transition-colors">
              {footerContent.email?.toLowerCase()}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </a>
          </div>

          <div>
            <h3 className="font-sans text-xs tracking-widest uppercase text-khaki mb-6">{footerContent.studioname}</h3>
            <ul className="space-y-4 font-sans text-sm text-pale-white/70">
              <li>{footerContent.addressline1}</li>
              <li>{footerContent.addressline2}</li>
              <li className="pt-4">{footerContent.phone}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-xs tracking-widest uppercase text-khaki mb-6">Socials</h3>
            <ul className="space-y-4 font-sans text-sm text-pale-white/70">
              <li><a href={footerContent.instagram} target="_blank" rel="noreferrer" className="hover:text-khaki transition-colors">Instagram</a></li>
              <li><a href={footerContent.pinterest} target="_blank" rel="noreferrer" className="hover:text-khaki transition-colors">Pinterest</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {globalContent?.logo && (
               <img src={globalContent.logo} alt={globalContent.sitename || 'Logo'} className="h-8 md:h-10 object-contain filter brightness-0 invert opacity-80" />
            )}
            <div className="flex flex-col">
               <span className="text-khaki font-sans text-[6px] tracking-widest uppercase">Signature</span>
               <span className="text-xl font-sans tracking-tighter uppercase font-black text-white/90">
                 {globalContent?.sitename || 'Studio'}
               </span>
            </div>
          </div>
          <p className="font-sans text-[10px] tracking-widest uppercase text-pale-white/40">
            &copy; {new Date().getFullYear()} {globalContent?.sitename || 'Studio Interior Design'}. All rights reserved.
          </p>
        </div>
      </div>
      
      {/* Decorative large background text */}
      <h1 className="absolute -bottom-10 -left-4 text-[15VW] font-serif italic text-white/5 whitespace-nowrap pointer-events-none pr-8 select-none">
        {globalContent?.sitename || 'Studio'}
      </h1>
    </footer>
  );
}
