import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Save, Globe, Layout, Info, Wrench, Phone as FooterIcon, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';

type TabType = 'branding' | 'hero' | 'about' | 'services' | 'footer';

export default function DashboardSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('branding');
  
  // Settings States
  const [globalParams, setGlobalParams] = useState({
    sitename: '',
    whatsappnumber: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [currentLogo, setCurrentLogo] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [heroParams, setHeroParams] = useState({
    subtitle: '',
    title: '',
    cta_text: '',
    image: ''
  });
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState('');
  const heroInputRef = useRef<HTMLInputElement>(null);

  const [aboutParams, setAboutParams] = useState({
    subtitle: '',
    title: '',
    p1: '',
    p2: '',
    image: '',
    est_year: ''
  });
  const [aboutFile, setAboutFile] = useState<File | null>(null);
  const [aboutPreview, setAboutPreview] = useState('');
  const aboutInputRef = useRef<HTMLInputElement>(null);

  const [servicesParams, setServicesParams] = useState({
    subtitle: '',
    title: '',
    s1_title: '',
    s1_desc: '',
    s2_title: '',
    s2_desc: '',
    s3_title: '',
    s3_desc: '',
    image: ''
  });
  const [servicesFile, setServicesFile] = useState<File | null>(null);
  const [servicesPreview, setServicesPreview] = useState('');
  const servicesInputRef = useRef<HTMLInputElement>(null);

  const [footer, setFooter] = useState({
    studioname: 'London Studio',
    addressline1: '15 Design Avenue',
    addressline2: 'Chelsea, London SW3 4ED',
    email: 'hello@studio.com',
    phone: '+44 (0) 20 7123 4567',
    instagram: '#',
    pinterest: '#'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (heroPreview) URL.revokeObjectURL(heroPreview);
      if (aboutPreview) URL.revokeObjectURL(aboutPreview);
      if (servicesPreview) URL.revokeObjectURL(servicesPreview);
    };
  }, [logoPreview, heroPreview, aboutPreview, servicesPreview]);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('content').select('*');
      if (data) {
        const global = data.find(i => i.id === 'global');
        const hero = data.find(i => i.id === 'hero');
        const about = data.find(i => i.id === 'about');
        const services = data.find(i => i.id === 'services');
        const footerData = data.find(i => i.id === 'footer');

        if (global) {
          setGlobalParams({ 
            sitename: global.sitename || '',
            whatsappnumber: global.whatsappnumber || ''
          });
          setCurrentLogo(global.logo || '');
        }

        if (hero) setHeroParams({
          subtitle: hero.subtitle || '',
          title: hero.title || '',
          cta_text: hero.cta_text || '',
          image: hero.image || ''
        });

        if (about) setAboutParams({
          subtitle: about.subtitle || '',
          title: about.title || '',
          p1: about.p1 || '',
          p2: about.p2 || '',
          image: about.image || '',
          est_year: about.est_year || ''
        });

        if (services) setServicesParams({
          subtitle: services.subtitle || '',
          title: services.title || '',
          s1_title: services.s1_title || '',
          s1_desc: services.s1_desc || '',
          s2_title: services.s2_title || '',
          s2_desc: services.s2_desc || '',
          s3_title: services.s3_title || '',
          s3_desc: services.s3_desc || '',
          image: services.image || ''
        });

        if (footerData) setFooter({
          studioname: footerData.studioname || '',
          addressline1: footerData.addressline1 || '',
          addressline2: footerData.addressline2 || '',
          email: footerData.email || '',
          phone: footerData.phone || '',
          instagram: footerData.instagram || '',
          pinterest: footerData.pinterest || ''
        });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleFileChange = (file: File | null, type: TabType) => {
    if (!file) return;
    
    const previewUrl = URL.createObjectURL(file);
    
    switch(type) {
      case 'branding':
      case 'footer':
        setLogoFile(file);
        setLogoPreview(previewUrl);
        break;
      case 'hero':
        setHeroFile(file);
        setHeroPreview(previewUrl);
        break;
      case 'about':
        setAboutFile(file);
        setAboutPreview(previewUrl);
        break;
      case 'services':
        setServicesFile(file);
        setServicesPreview(previewUrl);
        break;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Process Logo
      let finalLogo = currentLogo;
      if (logoFile) {
        finalLogo = await compressImage(logoFile, true);
        setCurrentLogo(finalLogo);
        setLogoPreview('');
        setLogoFile(null);
      }

      // 2. Process Hero Image
      let finalHeroImage = heroParams.image;
      if (heroFile) {
        finalHeroImage = await compressImage(heroFile);
        setHeroParams(prev => ({ ...prev, image: finalHeroImage }));
        setHeroPreview('');
        setHeroFile(null);
      }

      // 3. Process About Image
      let finalAboutImage = aboutParams.image;
      if (aboutFile) {
        finalAboutImage = await compressImage(aboutFile);
        setAboutParams(prev => ({ ...prev, image: finalAboutImage }));
        setAboutPreview('');
        setAboutFile(null);
      }

      // 4. Process Services Image
      let finalServicesImage = servicesParams.image;
      if (servicesFile) {
        finalServicesImage = await compressImage(servicesFile);
        setServicesParams(prev => ({ ...prev, image: finalServicesImage }));
        setServicesPreview('');
        setServicesFile(null);
      }

      // UPSERT ALL
      const updates = [
        { id: 'global', ...globalParams, logo: finalLogo },
        { id: 'hero', ...heroParams, image: finalHeroImage },
        { id: 'about', ...aboutParams, image: finalAboutImage },
        { id: 'services', ...servicesParams, image: finalServicesImage },
        { id: 'footer', ...footer }
      ];

      for (const item of updates) {
        const { error } = await supabase.from('content').upsert(item, { onConflict: 'id' });
        if (error) throw new Error(`${item.id} save failed: ${error.message}`);
      }

      localStorage.removeItem('studio_global_content');
      localStorage.removeItem('studio_footer_content');
      
      alert('All changes saved successfully!');
    } catch (e: any) {
      alert('Error saving settings: ' + e.message);
      console.error('Save error:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center mt-20"><Loader2 className="w-8 h-8 animate-spin text-dark-khaki" /></div>;

  const tabs: {id: TabType, label: string, icon: any}[] = [
    { id: 'branding', label: 'Branding', icon: Globe },
    { id: 'hero', label: 'Hero', icon: Layout },
    { id: 'about', label: 'About', icon: Info },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'footer', label: 'Footer', icon: FooterIcon }
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto font-sans pb-32 relative">
      {/* Hidden File Inputs - Moved here to ensure refs are always available across all tabs */}
      <input 
        ref={logoInputRef}
        type="file" 
        accept="image/*"
        onChange={e => handleFileChange(e.target.files?.[0] || null, 'branding')}
        className="hidden" 
      />
      <input 
        ref={heroInputRef}
        type="file" 
        accept="image/*"
        onChange={e => handleFileChange(e.target.files?.[0] || null, 'hero')}
        className="hidden" 
      />
      <input 
        ref={aboutInputRef}
        type="file" 
        accept="image/*"
        onChange={e => handleFileChange(e.target.files?.[0] || null, 'about')}
        className="hidden" 
      />
      <input 
        ref={servicesInputRef}
        type="file" 
        accept="image/*"
        onChange={e => handleFileChange(e.target.files?.[0] || null, 'services')}
        className="hidden" 
      />

      {/* Saving Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center border border-stone-100">
            <Loader2 className="w-12 h-12 animate-spin text-black mb-4" />
            <h3 className="font-serif text-2xl mb-2">Publishing Changes</h3>
            <p className="text-stone-500 text-sm max-w-xs">Optimizing images and updating your website. This won't take long...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="font-serif text-4xl text-black">Master Dashboard</h1>
          <p className="font-sans text-stone-500 text-sm mt-2">The single source of truth for all your website content.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="group relative flex items-center gap-2 bg-black text-white px-10 py-5 font-sans text-xs tracking-widest uppercase hover:bg-dark-khaki transition-all duration-500 disabled:opacity-50 overflow-hidden shadow-2xl"
        >
          <span className="relative z-10 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save All Changes</>}
          </span>
          <div className="absolute inset-0 bg-dark-khaki translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-stone-100 mb-10 no-scrollbar gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-8 py-5 text-xs uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-black text-black font-bold' 
                : 'border-transparent text-stone-300 hover:text-stone-600'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-dark-khaki' : 'text-stone-300'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        
        {/* BRANDING TAB */}
        {activeTab === 'branding' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Business Name Section */}
            <div className="bg-white p-10 border border-stone-200 shadow-xl rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-black group-hover:bg-dark-khaki transition-colors" />
              <div className="flex flex-col md:flex-row justify-between gap-12">
                <div className="flex-1 space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-stone-50 rounded-xl"><Globe className="w-6 h-6 text-black" /></div>
                    <h2 className="text-2xl font-serif">Identity & Presence</h2>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-4 font-bold">Business Display Name</label>
                    <input 
                      type="text" 
                      value={globalParams.sitename} 
                      onChange={e => setGlobalParams({...globalParams, sitename: e.target.value})}
                      className="w-full text-3xl font-sans font-black tracking-tighter border-b-2 border-stone-50 py-4 focus:outline-none focus:border-black transition-all bg-transparent placeholder:text-stone-200" 
                      placeholder="e.g. LUXE INTERIORS"
                    />
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg flex gap-3 items-center">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <p className="text-amber-800 text-[10px]">This name is styled with a permanent premium gold effect in the website header.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-4 font-bold">Global WhatsApp Number</label>
                    <div className="flex items-center gap-3 border-b-2 border-stone-50 focus-within:border-black transition-all">
                      <span className="text-stone-300 font-mono text-xl">+</span>
                      <input 
                        type="text" 
                        value={globalParams.whatsappnumber} 
                        onChange={e => setGlobalParams({...globalParams, whatsappnumber: e.target.value})}
                        className="w-full py-4 focus:outline-none bg-transparent font-mono text-lg" 
                        placeholder="CountryCode + Number (e.g. 917070692077)"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-80 bg-stone-50/50 rounded-3xl p-8 border border-stone-100 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                   <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center mb-6">
                     <span className="text-2xl font-serif text-dark-khaki">Aa</span>
                   </div>
                   <h3 className="text-[10px] uppercase tracking-widest font-bold mb-2 text-stone-400">Typography Preview</h3>
                   <div className="text-3xl font-sans font-black tracking-tighter mt-4 break-all px-4 text-black" style={{ textShadow: '1px 1px 0px #fff, 2px 2px 10px rgba(0,0,0,0.1)' }}>
                     {globalParams.sitename || 'Your Brand'}
                   </div>
                   <div className="mt-8 pt-8 border-t border-stone-200 w-full">
                     <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 uppercase tracking-widest">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       Live Connection
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Logo Section */}
            <div className="bg-white p-10 border border-stone-200 shadow-xl rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-dark-khaki group-hover:bg-black transition-colors" />
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-stone-50 rounded-xl"><ImageIcon className="w-6 h-6 text-black" /></div>
                <h2 className="text-2xl font-serif">Brand Logo</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-8">
                  <div 
                    className="relative aspect-square md:aspect-auto md:h-64 rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center group/upload hover:border-dark-khaki transition-all cursor-pointer overflow-hidden bg-stone-50/30"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {(logoPreview || currentLogo) ? (
                      <div className="relative w-full h-full p-10 flex items-center justify-center">
                        <img 
                          src={logoPreview || currentLogo} 
                          alt="Logo" 
                          className={`max-h-full max-w-full object-contain transition-all duration-500 ${logoPreview ? 'scale-95 blur-[1px]' : ''}`} 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <p className="text-white text-xs uppercase tracking-widest font-bold">Replace Branding Logo</p>
                        </div>
                        {logoPreview && (
                          <div className="absolute top-4 right-4 bg-black text-white text-[8px] px-2 py-1 uppercase tracking-widest rounded-full">New Selection</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto mb-6">
                          <ImageIcon className="w-8 h-8 text-stone-300" />
                        </div>
                        <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">Click to Upload Logo</p>
                      </div>
                    )}
                  </div>
                  
                  {logoPreview && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 animate-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-green-700 font-medium truncate">
                          Logo selected & ready to save
                        </span>
                      </div>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setLogoFile(null); 
                          setLogoPreview(''); 
                          if (logoInputRef.current) logoInputRef.current.value = ''; 
                        }} 
                        className="p-1 bg-white text-green-500 hover:text-red-500 rounded-full shadow-sm transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
                    <Info className="w-4 h-4 text-stone-400 mt-0.5" />
                    <p className="text-xs text-stone-500 leading-relaxed italic">
                      For best results, use a **Transparent PNG**. <br/>Our system will automatically preserve your logo's transparency.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Header Rendering Preview</h3>
                  <div className="p-10 rounded-3xl bg-pale-white border border-stone-100 shadow-2xl flex items-center gap-6">
                    <div className="h-14 w-14 flex items-center justify-center bg-white rounded-xl shadow-xl overflow-hidden p-2">
                       {(logoPreview || currentLogo) ? <img src={logoPreview || currentLogo} className="max-h-full max-w-full object-contain" /> : <div className="w-full h-full bg-stone-50" />}
                    </div>
                    <div className="flex flex-col">
                        <span 
                          style={{ 
                            fontFamily: "'Playfair Display', 'Didot', 'Georgia', serif",
                            fontWeight: 700,
                            fontSize: '24px',
                            letterSpacing: '1px',
                            color: '#C5A059'
                          }}
                        >
                          {globalParams.sitename || 'STUDIO'}
                        </span>
                        <span className="text-[8px] uppercase tracking-[0.3em] text-stone-400 mt-1">Interior Architecture</span>
                    </div>
                  </div>
                  
                  <div className="bg-black text-white p-8 rounded-3xl space-y-4">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-dark-khaki">Pro Tip</h4>
                    <p className="text-[11px] leading-relaxed text-stone-300">
                      Your logo is the first thing clients see. Ensure it is high resolution (at least 512px). We handle the compression automatically so your site stays fast.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HERO TAB */}
        {activeTab === 'hero' && (
          <div className="bg-white p-10 border border-stone-200 shadow-xl rounded-3xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-serif">Hero Section</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Introduction Subtitle</label>
                  <input 
                    type="text" 
                    value={heroParams.subtitle} 
                    onChange={e => setHeroParams({...heroParams, subtitle: e.target.value})}
                    className="w-full border-b border-stone-100 py-3 focus:outline-none focus:border-black bg-transparent text-lg font-serif italic" 
                    placeholder="Designing Spaces that Tell Your Story"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Main Hero Headline</label>
                  <textarea 
                    value={heroParams.title} 
                    onChange={e => setHeroParams({...heroParams, title: e.target.value})}
                    className="w-full border border-stone-100 p-4 h-32 focus:outline-none focus:border-black bg-stone-50 rounded-xl text-xl font-serif leading-snug" 
                    placeholder="Interior Architecture & Design"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Call to Action Button</label>
                  <input 
                    type="text" 
                    value={heroParams.cta_text} 
                    onChange={e => setHeroParams({...heroParams, cta_text: e.target.value})}
                    className="w-full border-b border-stone-100 py-3 focus:outline-none focus:border-black bg-transparent tracking-widest uppercase text-xs font-bold" 
                    placeholder="Explore Projects"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Background Cinematic Image</label>
                <div 
                  className="mt-2 aspect-video border-2 border-dashed border-stone-200 flex flex-col items-center justify-center overflow-hidden rounded-3xl cursor-pointer hover:border-black transition-all bg-stone-50/50 group/upload shadow-inner"
                  onClick={() => heroInputRef.current?.click()}
                >
                  {(heroPreview || heroParams.image) ? (
                    <div className="relative w-full h-full">
                      <img src={heroPreview || heroParams.image} alt="Hero Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity backdrop-blur-sm">
                         <p className="text-white text-xs uppercase tracking-widest font-bold">Change Image</p>
                      </div>
                      {heroPreview && (
                        <div className="absolute top-6 left-6 bg-green-500 text-white text-[10px] px-3 py-1 uppercase tracking-widest rounded-full shadow-lg">New selection ready</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 text-stone-200 mx-auto mb-4" />
                      <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">Upload Cinematic Background</p>
                    </div>
                  )}
                </div>
                {heroPreview && (
                   <button 
                    onClick={() => { setHeroFile(null); setHeroPreview(''); }}
                    className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                   >
                     <X className="w-3 h-3" /> Cancel selection
                   </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="bg-white p-10 border border-stone-200 shadow-xl rounded-3xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-serif">About Studio</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Section Subtitle</label>
                  <input 
                    type="text" 
                    value={aboutParams.subtitle} 
                    onChange={e => setAboutParams({...aboutParams, subtitle: e.target.value})}
                    className="w-full border-b border-stone-100 py-3 focus:outline-none focus:border-black bg-transparent" 
                    placeholder="The Studio"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Primary Quote</label>
                  <textarea 
                    value={aboutParams.title} 
                    onChange={e => setAboutParams({...aboutParams, title: e.target.value})}
                    className="w-full border border-stone-100 p-4 h-32 focus:outline-none focus:border-black bg-stone-50 rounded-xl font-serif text-lg" 
                  />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Main Description Paragraph</label>
                    <textarea 
                      value={aboutParams.p1} 
                      onChange={e => setAboutParams({...aboutParams, p1: e.target.value})}
                      className="w-full border border-stone-100 p-4 h-40 focus:outline-none focus:border-black bg-stone-50 rounded-xl text-sm leading-relaxed" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Secondary Paragraph</label>
                    <textarea 
                      value={aboutParams.p2} 
                      onChange={e => setAboutParams({...aboutParams, p2: e.target.value})}
                      className="w-full border border-stone-100 p-4 h-40 focus:outline-none focus:border-black bg-stone-50 rounded-xl text-sm leading-relaxed" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Established Year Badge</label>
                  <input 
                    type="text" 
                    value={aboutParams.est_year} 
                    onChange={e => setAboutParams({...aboutParams, est_year: e.target.value})}
                    placeholder="e.g. 2016"
                    className="w-full border-b border-stone-100 py-3 focus:outline-none focus:border-black bg-transparent font-serif text-xl italic text-dark-khaki" 
                  />
                  <p className="text-stone-400 text-[10px] mt-3 italic">Displays as "EST. {aboutParams.est_year || 'YEAR'}" over the about image.</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">About Studio Image</label>
                <div 
                  className="mt-2 aspect-[4/5] border-2 border-dashed border-stone-200 flex flex-col items-center justify-center overflow-hidden rounded-3xl cursor-pointer hover:border-black transition-all bg-stone-50/50 group/upload shadow-xl"
                  onClick={() => aboutInputRef.current?.click()}
                >
                  {(aboutPreview || aboutParams.image) ? (
                    <div className="relative w-full h-full">
                      <img src={aboutPreview || aboutParams.image} alt="About Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity backdrop-blur-sm">
                         <p className="text-white text-xs uppercase tracking-widest font-bold">Change Image</p>
                      </div>
                      {aboutPreview && (
                        <div className="absolute inset-0 ring-4 ring-green-400/50 ring-inset pointer-events-none" />
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <ImageIcon className="w-10 h-10 text-stone-200 mx-auto mb-4" />
                      <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">Upload Vertical Studio Image</p>
                    </div>
                  )}
                </div>
                {aboutPreview && (
                   <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-widest">
                     <span className="text-green-600 font-bold flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500" /> Image Selected
                     </span>
                     <button onClick={() => { setAboutFile(null); setAboutPreview(''); }} className="text-stone-400 hover:text-black transition-colors">Discard</button>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="bg-white p-10 border border-stone-200 shadow-xl rounded-3xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-serif">Services & Offerings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Vertical Label</label>
                    <input 
                      type="text" 
                      value={servicesParams.subtitle} 
                      onChange={e => setServicesParams({...servicesParams, subtitle: e.target.value})}
                      className="w-full border-b border-stone-100 py-3 focus:outline-none focus:border-black bg-transparent" 
                      placeholder="Our Approach"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Section Heading</label>
                    <input 
                      type="text" 
                      value={servicesParams.title} 
                      onChange={e => setServicesParams({...servicesParams, title: e.target.value})}
                      className="w-full border-b border-stone-100 py-3 focus:outline-none focus:border-black bg-transparent text-lg font-serif" 
                      placeholder="Comprehensive Services"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="p-6 bg-stone-50/50 rounded-2xl border border-stone-100 space-y-4 hover:border-dark-khaki/30 transition-colors">
                      <h3 className="font-serif text-sm flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-sans">0{num}</span>
                        Service Item {num}
                      </h3>
                      <input 
                        type="text" 
                        value={(servicesParams as any)[`s${num}_title`]} 
                        onChange={e => setServicesParams({...servicesParams, [`s${num}_title`]: e.target.value})}
                        placeholder="Service Title"
                        className="w-full border-b border-stone-200 py-2 text-sm focus:outline-none bg-transparent font-bold" 
                      />
                      <textarea 
                        value={(servicesParams as any)[`s${num}_desc`]} 
                        onChange={e => setServicesParams({...servicesParams, [`s${num}_desc`]: e.target.value})}
                        placeholder="Short description of this service..."
                        className="w-full border border-stone-100 p-3 text-xs h-24 rounded-lg focus:outline-none focus:border-black bg-white" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Services Visual Image</label>
                <div 
                  className="mt-2 aspect-[3/4] border-2 border-dashed border-stone-200 flex flex-col items-center justify-center overflow-hidden rounded-3xl cursor-pointer hover:border-black transition-all bg-stone-50/50 group/upload shadow-xl"
                  onClick={() => servicesInputRef.current?.click()}
                >
                  {(servicesPreview || servicesParams.image) ? (
                    <div className="relative w-full h-full">
                      <img src={servicesPreview || servicesParams.image} alt="Services Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity backdrop-blur-sm">
                         <p className="text-white text-xs uppercase tracking-widest font-bold">Change Image</p>
                      </div>
                      {servicesPreview && (
                         <div className="absolute bottom-6 right-6 bg-white text-black text-[8px] px-3 py-1.5 uppercase tracking-widest font-bold rounded-full shadow-2xl">New Photo selected</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 text-stone-200 mx-auto mb-4" />
                      <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">Upload Vertical Service Image</p>
                    </div>
                  )}
                </div>
                {servicesPreview && (
                   <button 
                    onClick={() => { setServicesFile(null); setServicesPreview(''); }}
                    className="mt-6 w-full py-3 border border-stone-200 text-[10px] uppercase tracking-widest text-stone-400 hover:text-red-500 hover:border-red-100 transition-all rounded-xl"
                   >
                     Discard new selection
                   </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER TAB */}
        {activeTab === 'footer' && (
          <div className="bg-white p-10 border border-stone-200 shadow-xl rounded-3xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center border-b border-stone-50 pb-6">
              <h2 className="text-3xl font-serif">Footer & Global Contact</h2>
              <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-full border border-stone-100">
                 <div className="w-2 h-2 rounded-full bg-green-500" />
                 <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Global Sync Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-10">
                <div className="space-y-8">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-dark-khaki">Primary Contact</h3>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Studio Title</label>
                    <input 
                      type="text" 
                      value={footer.studioname} 
                      onChange={e => setFooter({...footer, studioname: e.target.value})}
                      className="w-full border-b border-stone-100 py-3 focus:outline-none focus:border-black bg-transparent text-xl font-serif" 
                      placeholder="London Studio"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Email Address</label>
                      <input 
                        type="email" 
                        value={footer.email} 
                        onChange={e => setFooter({...footer, email: e.target.value})}
                        className="w-full border-b border-stone-100 py-3 focus:outline-none focus:border-black bg-transparent text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Phone Number</label>
                      <input 
                        type="text" 
                        value={footer.phone} 
                        onChange={e => setFooter({...footer, phone: e.target.value})}
                        className="w-full border-b border-stone-100 py-3 focus:outline-none focus:border-black bg-transparent text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-dark-khaki">Location Details</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Address Line 1</label>
                      <input 
                        type="text" 
                        value={footer.addressline1} 
                        onChange={e => setFooter({...footer, addressline1: e.target.value})}
                        className="w-full border-b border-stone-100 py-3 focus:outline-none focus:border-black bg-transparent text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Address Line 2</label>
                      <input 
                        type="text" 
                        value={footer.addressline2} 
                        onChange={e => setFooter({...footer, addressline2: e.target.value})}
                        className="w-full border-b border-stone-100 py-3 focus:outline-none focus:border-black bg-transparent text-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                 {/* Logo management mirrored in footer for user convenience */}
                 <div className="p-8 bg-stone-50 rounded-3xl border border-stone-100 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs uppercase tracking-widest font-bold text-black">Footer Logo</h3>
                      <button 
                      onClick={() => logoInputRef.current?.click()}
                      className="bg-black text-white px-6 py-3 font-sans text-xs tracking-widest uppercase hover:bg-dark-khaki transition-colors"
                    >
                      Change Logo
                    </button>
                    {(logoPreview || logoFile) && (
                      <button 
                        onClick={() => { setLogoFile(null); setLogoPreview(''); }}
                        className="text-[10px] uppercase tracking-widest text-red-500 hover:underline"
                      >
                        Cancel Selection
                      </button>
                    )}
                    </div>
                    <div className="h-40 w-full bg-white rounded-2xl shadow-sm flex items-center justify-center p-8 border border-stone-50 relative group/fl">
                       {(logoPreview || currentLogo) ? (
                         <img src={logoPreview || currentLogo} className="max-h-full max-w-full object-contain" />
                       ) : (
                         <ImageIcon className="w-10 h-10 text-stone-100" />
                       )}
                       {logoPreview && (
                         <div className="absolute top-3 left-3 bg-green-500 text-white text-[8px] px-2 py-1 uppercase tracking-widest rounded-full">Pending Save</div>
                       )}
                    </div>
                    <p className="text-[10px] text-stone-400 italic">This logo is synchronized with your global branding logo in the header.</p>
                 </div>

                 <div className="p-8 bg-black text-white rounded-3xl space-y-6">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-dark-khaki">Social Media Links</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-3">Instagram URL</label>
                        <input 
                          type="text" 
                          value={footer.instagram} 
                          onChange={e => setFooter({...footer, instagram: e.target.value})}
                          className="w-full border-b border-stone-800 py-2 focus:outline-none focus:border-dark-khaki bg-transparent font-mono text-xs" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-3">Pinterest URL</label>
                        <input 
                          type="text" 
                          value={footer.pinterest} 
                          onChange={e => setFooter({...footer, pinterest: e.target.value})}
                          className="w-full border-b border-stone-800 py-2 focus:outline-none focus:border-dark-khaki bg-transparent font-mono text-xs" 
                        />
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
