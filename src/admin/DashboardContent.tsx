import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Save } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';

export default function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // States
  const [heroParams, setHeroParams] = useState({
    subtitle: 'Interior Architecture & Design',
    title: 'Designing Spaces that Tell Your Story',
    cta_text: 'Explore Projects'
  });
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [currentHeroImg, setCurrentHeroImg] = useState('');

  const [aboutParams, setAboutParams] = useState({
    subtitle: 'About the Studio',
    title: 'Creating joyful, layered spaces that reflect the people who live in them.',
    p1: 'We approach each project with a fresh perspective, combining classical principles with unexpected details...',
    p2: 'From historic renovations to modern new builds, our work is defined by bespoke craftsmanship...',
    estYear: '2016'
  });
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [currentAboutImg, setCurrentAboutImg] = useState('');

  const [servicesParams, setServicesParams] = useState({
    subtitle: 'Our Approach',
    title: 'Comprehensive Services',
    s1Title: 'Interior Architecture',
    s1Desc: 'We rethink spatial arrangements and internal flow to maximize light and usability.',
    s2Title: 'Bespoke Furnishing',
    s2Desc: 'Sourcing and creating custom pieces that add character and history to your home.',
    s3Title: 'Project Management',
    s3Desc: 'Overseeing every detail from initial concept to the final styling installation.'
  });
  const [servicesImageFile, setServicesImageFile] = useState<File | null>(null);
  const [currentServicesImg, setCurrentServicesImg] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data: hData, error: hError } = await supabase.from('content').select('*').eq('id', 'hero').single();
      if (hData) {
        setHeroParams({ subtitle: hData.subtitle || '', title: hData.title || '', cta_text: hData.cta_text || '' });
        if (hData.image) setCurrentHeroImg(hData.image);
      }

      const { data: aData, error: aError } = await supabase.from('content').select('*').eq('id', 'about').single();
      if (aData) {
        setAboutParams({ 
          subtitle: aData.subtitle, 
          title: aData.title, 
          p1: aData.p1, 
          p2: aData.p2,
          estYear: aData.est_year || '2016'
        });
        if (aData.image) setCurrentAboutImg(aData.image);
      }

      const { data: sData, error: sError } = await supabase.from('content').select('*').eq('id', 'services').single();
      if (sData) {
        setServicesParams({ 
          subtitle: sData.subtitle, title: sData.title, 
          s1Title: sData.s1_title, s1Desc: sData.s1_desc,
          s2Title: sData.s2_title, s2Desc: sData.s2_desc,
          s3Title: sData.s3_title, s3Desc: sData.s3_desc
        });
        if (sData.image) setCurrentServicesImg(sData.image);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Compress active image selections
      let finalHeroImg = currentHeroImg;
      if (heroImageFile) finalHeroImg = await compressImage(heroImageFile);
      
      let finalAboutImg = currentAboutImg;
      if (aboutImageFile) finalAboutImg = await compressImage(aboutImageFile);

      let finalServicesImg = currentServicesImg;
      if (servicesImageFile) finalServicesImg = await compressImage(servicesImageFile);

      // Save
      await supabase.from('content').upsert({ id: 'hero', subtitle: heroParams.subtitle, title: heroParams.title, cta_text: heroParams.cta_text, image: finalHeroImg });
      await supabase.from('content').upsert({ 
        id: 'about', 
        subtitle: aboutParams.subtitle,
        title: aboutParams.title,
        p1: aboutParams.p1,
        p2: aboutParams.p2,
        est_year: aboutParams.estYear,
        image: finalAboutImg 
      });
      await supabase.from('content').upsert({ 
        id: 'services', 
        subtitle: servicesParams.subtitle,
        title: servicesParams.title,
        s1_title: servicesParams.s1Title,
        s1_desc: servicesParams.s1Desc,
        s2_title: servicesParams.s2Title,
        s2_desc: servicesParams.s2Desc,
        s3_title: servicesParams.s3Title,
        s3_desc: servicesParams.s3Desc,
        image: finalServicesImg 
      });

      setCurrentHeroImg(finalHeroImg);
      setCurrentAboutImg(finalAboutImg);
      setCurrentServicesImg(finalServicesImg);

      setHeroImageFile(null);
      setAboutImageFile(null);
      setServicesImageFile(null);

      alert('All sections content saved successfully!');
    } catch (e: any) {
      alert('Error saving content: ensure images are not too large. ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto font-sans pb-32">
      <div className="flex justify-between items-end mb-10 sticky top-0 bg-alabaster/90 py-4 z-10 backdrop-blur">
        <div>
          <h1 className="font-serif text-4xl text-black">Content Sections</h1>
          <p className="font-sans text-stone-500 text-sm mt-2">Edit text and main images for page sections.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 font-sans text-xs tracking-widest uppercase hover:bg-dark-khaki transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save All</>}
        </button>
      </div>

      <div className="space-y-12">
        {/* HERO SECTION */}
        <div className="bg-white p-8 border border-stone-200 shadow-sm space-y-6">
          <h2 className="text-xl font-serif border-b pb-4">Home / Hero Section</h2>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Small Subtitle</label>
            <input type="text" value={heroParams.subtitle} onChange={e => setHeroParams({...heroParams, subtitle: e.target.value})} className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Main Headline</label>
            <textarea rows={2} value={heroParams.title} onChange={e => setHeroParams({...heroParams, title: e.target.value})} className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Button Text</label>
            <input type="text" value={heroParams.cta_text} onChange={e => setHeroParams({...heroParams, cta_text: e.target.value})} className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Background Image</label>
             {currentHeroImg && <p className="text-xs text-green-600 mb-2">✓ Image currently set</p>}
            <input type="file" accept="image/*" onChange={e => setHeroImageFile(e.target.files?.[0] || null)} className="text-sm" />
          </div>
        </div>

        {/* ABOUT SECTION */}
        <div className="bg-white p-8 border border-stone-200 shadow-sm space-y-6">
          <h2 className="text-xl font-serif border-b pb-4">About Section</h2>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Small Subtitle</label>
            <input type="text" value={aboutParams.subtitle} onChange={e => setAboutParams({...aboutParams, subtitle: e.target.value})} className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Main Heading</label>
            <textarea rows={2} value={aboutParams.title} onChange={e => setAboutParams({...aboutParams, title: e.target.value})} className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Paragraph 1</label>
            <textarea rows={3} value={aboutParams.p1} onChange={e => setAboutParams({...aboutParams, p1: e.target.value})} className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Paragraph 2</label>
            <textarea rows={3} value={aboutParams.p2} onChange={e => setAboutParams({...aboutParams, p2: e.target.value})} className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Established Year (e.g. 2016)</label>
            <input type="text" value={aboutParams.estYear} onChange={e => setAboutParams({...aboutParams, estYear: e.target.value})} className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">About Image (Founder/Studio)</label>
            {currentAboutImg && <p className="text-xs text-green-600 mb-2">✓ Image currently set</p>}
            <input type="file" accept="image/*" onChange={e => setAboutImageFile(e.target.files?.[0] || null)} className="text-sm" />
          </div>
        </div>

        {/* SERVICES SECTION */}
        <div className="bg-white p-8 border border-stone-200 shadow-sm space-y-6">
          <h2 className="text-xl font-serif border-b pb-4">Comprehensive Services Section</h2>
          <div className="grid md:grid-cols-2 gap-6">
             <div>
               <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Vertical Subtitle</label>
               <input type="text" value={servicesParams.subtitle} onChange={e => setServicesParams({...servicesParams, subtitle: e.target.value})} className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" />
             </div>
             <div>
               <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Main Heading</label>
               <input type="text" value={servicesParams.title} onChange={e => setServicesParams({...servicesParams, title: e.target.value})} className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-dark-khaki bg-transparent" />
             </div>
          </div>
          
          <div className="border-l-4 border-stone-100 pl-4 py-2 space-y-4">
             <div>
               <label className="block text-[10px] uppercase font-bold text-dark-khaki mb-1">Service 1</label>
               <input type="text" value={servicesParams.s1Title} onChange={e => setServicesParams({...servicesParams, s1Title: e.target.value})} placeholder="Title" className="w-full font-bold border-b py-1 mb-2" />
               <input type="text" value={servicesParams.s1Desc} onChange={e => setServicesParams({...servicesParams, s1Desc: e.target.value})} placeholder="Description" className="w-full text-sm border-b py-1 text-stone-500" />
             </div>
          </div>

          <div className="border-l-4 border-stone-100 pl-4 py-2 space-y-4">
             <div>
               <label className="block text-[10px] uppercase font-bold text-dark-khaki mb-1">Service 2</label>
               <input type="text" value={servicesParams.s2Title} onChange={e => setServicesParams({...servicesParams, s2Title: e.target.value})} placeholder="Title" className="w-full font-bold border-b py-1 mb-2" />
               <input type="text" value={servicesParams.s2Desc} onChange={e => setServicesParams({...servicesParams, s2Desc: e.target.value})} placeholder="Description" className="w-full text-sm border-b py-1 text-stone-500" />
             </div>
          </div>

          <div className="border-l-4 border-stone-100 pl-4 py-2 space-y-4">
             <div>
               <label className="block text-[10px] uppercase font-bold text-dark-khaki mb-1">Service 3</label>
               <input type="text" value={servicesParams.s3Title} onChange={e => setServicesParams({...servicesParams, s3Title: e.target.value})} placeholder="Title" className="w-full font-bold border-b py-1 mb-2" />
               <input type="text" value={servicesParams.s3Desc} onChange={e => setServicesParams({...servicesParams, s3Desc: e.target.value})} placeholder="Description" className="w-full text-sm border-b py-1 text-stone-500" />
             </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Services Section Image</label>
            {currentServicesImg && <p className="text-xs text-green-600 mb-2">✓ Image currently set</p>}
            <input type="file" accept="image/*" onChange={e => setServicesImageFile(e.target.files?.[0] || null)} className="text-sm" />
          </div>
        </div>

      </div>
    </div>
  );
}
