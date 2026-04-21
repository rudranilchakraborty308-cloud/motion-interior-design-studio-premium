import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Trash2, ImagePlus, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { compressImage, compressPortfolioImage } from '../lib/imageUtils';

export default function DashboardPortfolio() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingGalleryId, setUploadingGalleryId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from('portfolio').select('*');
      if (data) {
        const fetched = data as any[];
        // Filter out any softly-deleted items and sort by creation
        setProjects(fetched.filter((p: any) => !p.is_deleted).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const deleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this entire project?')) return;
    
    // Optimistically remove from UI
    setProjects(projects.filter(p => p.id !== id));
    
    try {
      // Primary Action: Try standard delete
      const { error } = await supabase.from('portfolio').delete().eq('id', id);
      if (error) throw error;
    } catch (e: any) {
      console.warn("Hard delete blocked. Applying Soft Delete fallback...", e.message);
      try {
        // Fallback Action: Soft delete
        await supabase.from('portfolio').update({ is_deleted: true, image: '' }).eq('id', id); 
      } catch (fallbackError) {
        console.error("Soft delete also failed:", fallbackError);
      }
    }
  };

  const deleteGalleryImage = async (projectId: string, imageIndex: number) => {
    if (!window.confirm('Delete this image from gallery?')) return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedGallery = project.gallery.filter((_: any, i: number) => i !== imageIndex);

    try {
      const { error } = await supabase.from('portfolio').update({ gallery: updatedGallery }).eq('id', projectId);
      if (error) throw error;

      setProjects(projects.map(p => p.id === projectId ? { ...p, gallery: updatedGallery } : p));
    } catch (err: any) {
      alert("Failed to delete image: " + err.message);
    }
  };

  const triggerGalleryUpload = (projectId: string) => {
    setUploadingGalleryId(projectId);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // reset
      fileInputRef.current.click();
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !uploadingGalleryId) return;

    setIsUploading(true);
    try {
      const targetProject = projects.find(p => p.id === uploadingGalleryId);
      if (!targetProject) throw new Error("Project not found");

      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressPortfolioImage(files[i]);
        newImages.push(compressed);
      }

      const updatedGallery = [...(targetProject.gallery || []), ...newImages];
      
      const { error } = await supabase.from('portfolio').update({
        gallery: updatedGallery
      }).eq('id', uploadingGalleryId);
      if (error) throw error;

      setProjects(projects.map(p => 
        p.id === uploadingGalleryId ? { ...p, gallery: updatedGallery } : p
      ));

    } catch (err: any) {
      alert("Failed to upload gallery images. " + err.message);
    } finally {
      setIsUploading(false);
      setUploadingGalleryId(null);
    }
  };

  // Add Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert("Please select a main image");
    
    setIsUploading(true);
    try {
      const base64Image = await compressPortfolioImage(imageFile);

      const newProj = {
        title,
        category,
        description,
        image: base64Image,
        gallery: [base64Image] 
      };

      const { data, error } = await supabase.from('portfolio').insert([newProj]).select();
      if (error) throw error;
      if (data && data.length > 0) {
        setProjects([data[0], ...projects]);
      }
      setModalOpen(false);
      setTitle(''); setCategory(''); setDescription(''); setImageFile(null);
    } catch (err: any) {
      alert('Failed to add project. Error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center mt-20"><Loader2 className="w-8 h-8 animate-spin text-dark-khaki" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32">
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleGalleryUpload} 
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="font-serif text-4xl text-black">Portfolio Manager</h1>
          <p className="font-sans text-stone-500 text-sm mt-2">Manage your showcased projects & galleries.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-8 py-4 font-sans text-xs tracking-widest uppercase hover:bg-dark-khaki transition-all shadow-xl"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white p-20 text-center text-stone-300 font-sans border-2 border-dashed border-stone-100 rounded-3xl">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="uppercase tracking-[0.2em] text-[10px] font-bold">No projects in database</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.map(p => (
            <div key={p.id} className="bg-white rounded-3xl overflow-hidden border border-stone-100 group relative shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <button 
                  onClick={() => deleteProject(p.id)}
                  className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white p-3 rounded-full z-10 hover:bg-red-500 transition-all shadow-lg hover:scale-110 active:scale-95"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                   <p className="text-white text-[10px] uppercase tracking-widest font-bold bg-dark-khaki/80 w-fit px-2 py-1 rounded mb-2">{p.category}</p>
                   <h3 className="font-serif text-xl text-white line-clamp-1">{p.title}</h3>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col space-y-4">
                <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">{p.description}</p>
                
                <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Gallery</span>
                    <span className="text-xs font-sans text-black font-semibold">
                      {p.gallery?.length || 0} Photos
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setExpandedProjectId(expandedProjectId === p.id ? null : p.id)}
                      className="text-[10px] uppercase font-bold tracking-wider text-black hover:text-dark-khaki transition-colors"
                    >
                      {expandedProjectId === p.id ? 'Hide' : 'Manage'}
                    </button>
                    <button 
                      onClick={() => triggerGalleryUpload(p.id)}
                      disabled={isUploading && uploadingGalleryId === p.id}
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-stone-50 hover:bg-black hover:text-white px-4 py-2 rounded-full transition-all disabled:opacity-50"
                    >
                      {isUploading && uploadingGalleryId === p.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <ImagePlus className="w-3 h-3" />
                      )}
                      Add
                    </button>
                  </div>
                </div>

                {/* Expanded Gallery View */}
                <AnimatePresence>
                  {expandedProjectId === p.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-stone-50 mt-4">
                        {p.gallery?.map((img: string, idx: number) => (
                          <div key={idx} className="relative aspect-square group/img rounded-lg overflow-hidden border border-stone-100">
                            <img src={img} className="w-full h-full object-cover" />
                            <button 
                              onClick={() => deleteGalleryImage(p.id, idx)}
                              className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group/img:group-hover/img:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-pale-white w-full max-w-2xl p-10 shadow-2xl rounded-[2rem] overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="font-serif text-4xl mb-2">New Project</h2>
                  <p className="text-stone-400 text-xs uppercase tracking-widest">Create a masterpiece showcase</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Project Title</label>
                      <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full border-b-2 border-stone-100 py-3 focus:outline-none focus:border-black bg-transparent text-lg font-serif" placeholder="e.g. Minimalist Villa" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Category</label>
                      <input type="text" required value={category} onChange={e => setCategory(e.target.value)} className="w-full border-b-2 border-stone-100 py-3 focus:outline-none focus:border-black bg-transparent text-sm" placeholder="e.g. Residential" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Project Narrative</label>
                      <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full border-2 border-stone-100 p-4 focus:outline-none focus:border-black bg-stone-50/50 rounded-2xl text-sm" placeholder="Describe the design philosophy..."></textarea>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-3 font-bold">Cover Image</label>
                    <div 
                      className="relative aspect-square rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center group/upload hover:border-black transition-all cursor-pointer overflow-hidden bg-stone-50/50 shadow-inner"
                      onClick={() => document.getElementById('project-image-upload')?.click()}
                    >
                      {imageFile ? (
                        <div className="relative w-full h-full">
                          <img src={URL.createObjectURL(imageFile)} alt="Selected" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <p className="text-white text-[10px] uppercase tracking-widest font-bold">Replace Cover</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto mb-6">
                            <ImageIcon className="w-6 h-6 text-stone-300" />
                          </div>
                          <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">Click to Upload</p>
                        </div>
                      )}
                    </div>
                    <input 
                      id="project-image-upload"
                      type="file" 
                      accept="image/*" 
                      onChange={e => setImageFile(e.target.files?.[0] || null)} 
                      className="hidden" 
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={isUploading} className="flex-1 py-5 bg-black text-white uppercase text-xs tracking-[0.2em] font-bold hover:bg-dark-khaki transition-all shadow-2xl flex justify-center items-center gap-3">
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
