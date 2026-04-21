import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Save, Globe, Layout, Info, Wrench, Image as ImageIcon, X } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';

type TabType = 'hero' | 'about' | 'services';

export default function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('hero');
  
  // Settings States
  const [heroParams, setHeroParams] = useState({
    subtitle: '',
    title: '',
    cta_text: '',
    image: ''
  });
  const [heroFile, setHeroFile] = useState<File | null>(null);

  const [aboutParams, setAboutParams] = useState({
    subtitle: '',
    title: '',
    p1: '',
    p2: '',
    image: '',
    est_year: ''
  });
  const [aboutFile, setAboutFile] = useState<File | null>(null);

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

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data } = await supabase.from('content').select('*');
      if (data) {
        const hero = data.find(i => i.id === 'hero');
        const about = data.find(i => i.id === 'about');
        const services = data.find(i => i.id === 'services');

        if (hero) setHeroParams({ ...hero });
        if (about) setAboutParams({ ...about });
        if (services) setServicesParams({ ...services });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalHeroImg = heroParams.image;
      if (heroFile) finalHeroImg = await compressImage(heroFile);

      let finalAboutImg = aboutParams.image;
      if (aboutFile) finalAboutImg = await compressImage(aboutFile);

      let finalServicesImg = servicesParams.image;
      if (servicesFile) finalServicesImg = await compressImage(servicesFile);

      const updates = [
        { id: 'hero', ...heroParams, image: finalHeroImg },
        { id: 'about', ...aboutParams, image: finalAboutImg },
        { id: 'services', ...servicesParams, image: finalServicesImg }
      ];

      for (const item of updates) {
        await supabase.from('content').upsert(item);
      }

      alert('Content updated successfully!');
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-dark-khaki" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="font-serif text-4xl text-black">Manage Site Content</h1>
          <p className="font-sans text-stone-500 text-sm mt-2">Edit text and images for specific sections.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-8 py-4 font-sans text-xs tracking-widest uppercase hover:bg-dark-khaki transition-all shadow-xl"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Content</>}
        </button>
      </div>

      <div className="flex border-b border-stone-200 mb-10 overflow-x-auto">
        <button onClick={() => setActiveTab('hero')} className={`px-8 py-4 text-xs uppercase tracking-widest font-bold border-b-2 ${activeTab === 'hero' ? 'border-black text-black' : 'border-transparent text-stone-400'}`}>Hero</button>
        <button onClick={() => setActiveTab('about')} className={`px-8 py-4 text-xs uppercase tracking-widest font-bold border-b-2 ${activeTab === 'about' ? 'border-black text-black' : 'border-transparent text-stone-400'}`}>About</button>
        <button onClick={() => setActiveTab('services')} className={`px-8 py-4 text-xs uppercase tracking-widest font-bold border-b-2 ${activeTab === 'services' ? 'border-black text-black' : 'border-transparent text-stone-400'}`}>Services</button>
      </div>

      <div className="space-y-8 bg-white p-10 border border-stone-100 shadow-sm">
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif">Hero Section</h2>
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Subtitle</label>
              <input type="text" value={heroParams.subtitle} onChange={e => setHeroParams({...heroParams, subtitle: e.target.value})} className="w-full border-b border-stone-200 py-2 focus:outline-none focus:border-black bg-transparent" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Main Title</label>
              <textarea value={heroParams.title} onChange={e => setHeroParams({...heroParams, title: e.target.value})} className="w-full border border-stone-200 p-4 h-24 focus:outline-none focus:border-black" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Button Text</label>
              <input type="text" value={heroParams.cta_text} onChange={e => setHeroParams({...heroParams, cta_text: e.target.value})} className="w-full border-b border-stone-200 py-2 focus:outline-none focus:border-black bg-transparent" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-4">Background Image</label>
              <div className="flex items-center gap-8">
                 {heroParams.image && <img src={heroParams.image} className="w-32 h-20 object-cover" />}
                 <input type="file" accept="image/*" onChange={e => setHeroFile(e.target.files?.[0] || null)} className="text-xs" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif">About Section</h2>
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Section Label</label>
              <input type="text" value={aboutParams.subtitle} onChange={e => setAboutParams({...aboutParams, subtitle: e.target.value})} className="w-full border-b border-stone-200 py-2 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Intro Title</label>
              <textarea value={aboutParams.title} onChange={e => setAboutParams({...aboutParams, title: e.target.value})} className="w-full border border-stone-200 p-4 h-24" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Paragraph 1</label>
                <textarea value={aboutParams.p1} onChange={e => setAboutParams({...aboutParams, p1: e.target.value})} className="w-full border border-stone-200 p-4 h-48 text-sm" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Paragraph 2</label>
                <textarea value={aboutParams.p2} onChange={e => setAboutParams({...aboutParams, p2: e.target.value})} className="w-full border border-stone-200 p-4 h-48 text-sm" />
              </div>
            </div>
            <div>
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">Established Year</label>
                <input type="text" value={aboutParams.est_year} onChange={e => setAboutParams({...aboutParams, est_year: e.target.value})} className="w-full border-b border-stone-200 py-2 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 mb-4">Vertical Side Image</label>
              <div className="flex items-center gap-8">
                 {aboutParams.image && <img src={aboutParams.image} className="w-20 h-24 object-cover" />}
                 <input type="file" accept="image/*" onChange={e => setAboutFile(e.target.files?.[0] || null)} className="text-xs" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif">Services Section</h2>
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-8">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="p-6 bg-stone-50 rounded-xl border border-stone-100">
                    <h3 className="font-serif text-sm mb-4">Service Item {num}</h3>
                    <input type="text" value={(servicesParams as any)[`s${num}_title`]} onChange={e => setServicesParams({...servicesParams, [`s${num}_title`]: e.target.value})} placeholder="Title" className="w-full border-b border-stone-200 py-2 text-sm focus:outline-none bg-transparent mb-4" />
                    <textarea value={(servicesParams as any)[`s${num}_desc`]} onChange={e => setServicesParams({...servicesParams, [`s${num}_desc`]: e.target.value})} placeholder="Description" className="w-full border border-stone-100 p-3 text-xs h-24 rounded-lg focus:outline-none bg-white" />
                  </div>
                ))}
              </div>
              <div className="pt-8 border-t border-stone-100">
                <label className="block text-xs uppercase tracking-widest text-stone-500 mb-4">Services Grid Image</label>
                <div className="flex items-center gap-8">
                  {servicesParams.image && <img src={servicesParams.image} className="w-32 h-40 object-cover" />}
                  <input type="file" accept="image/*" onChange={e => setServicesFile(e.target.files?.[0] || null)} className="text-xs" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
