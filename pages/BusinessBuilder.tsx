import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Image as ImageIcon, 
  Plus, 
  Save, 
  Trash2, 
  Upload,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';

export default function BusinessBuilder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [businessPage, setBusinessPage] = useState({
    id: '',
    business_name: '',
    slug: '',
    category: '',
    description: '',
    phone: '',
    whatsapp: '',
    address: '',
    logo_url: '',
    cover_url: ''
  });

  const [services, setServices] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      // Fetch business page
      const { data: pageData, error: pageError } = await supabase
        .from('business_pages')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (pageData) {
        setBusinessPage(pageData);
        
        // Fetch services
        const { data: servicesData } = await supabase
          .from('business_services')
          .select('*')
          .eq('business_id', pageData.id);
        if (servicesData) setServices(servicesData);

        // Fetch gallery
        const { data: galleryData } = await supabase
          .from('business_gallery')
          .select('*')
          .eq('business_id', pageData.id);
        if (galleryData) setGallery(galleryData);
      }

    } catch (err: any) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBusinessPage(prev => {
      const updates = { ...prev, [name]: value };
      if (name === 'business_name' && !prev.id) {
        updates.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return updates;
    });
  };

  const handleFileUpload = async (file: File, bucket: string, field: 'logo_url' | 'cover_url') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setBusinessPage(prev => ({ ...prev, [field]: publicUrl }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGalleryUpload = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('business-gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-gallery')
        .getPublicUrl(filePath);

      setGallery(prev => [...prev, { image_url: publicUrl }]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addService = () => {
    setServices(prev => [...prev, { service_name: '', price: '', description: '' }]);
  };

  const updateService = (index: number, field: string, value: string) => {
    setServices(prev => {
      const newServices = [...prev];
      newServices[index] = { ...newServices[index], [field]: value };
      return newServices;
    });
  };

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const removeGalleryImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save Business Page
      let pageId = businessPage.id;
      const pageData = {
        owner_id: user.id,
        business_name: businessPage.business_name,
        slug: businessPage.slug,
        category: businessPage.category,
        description: businessPage.description,
        phone: businessPage.phone,
        whatsapp: businessPage.whatsapp,
        address: businessPage.address,
        logo_url: businessPage.logo_url,
        cover_url: businessPage.cover_url
      };

      if (pageId) {
        const { error } = await supabase.from('business_pages').update(pageData).eq('id', pageId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('business_pages').insert(pageData).select().single();
        if (error) throw error;
        pageId = data.id;
        setBusinessPage(prev => ({ ...prev, id: pageId }));
      }

      // Save Services
      await supabase.from('business_services').delete().eq('business_id', pageId);
      if (services.length > 0) {
        const servicesData = services.map(s => ({
          business_id: pageId,
          service_name: s.service_name,
          price: s.price,
          description: s.description
        }));
        await supabase.from('business_services').insert(servicesData);
      }

      // Save Gallery
      await supabase.from('business_gallery').delete().eq('business_id', pageId);
      if (gallery.length > 0) {
        const galleryData = gallery.map(g => ({
          business_id: pageId,
          image_url: g.image_url
        }));
        await supabase.from('business_gallery').insert(galleryData);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save business page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Business Page Builder</h1>
        <p className="text-gray-500 mt-1">Create your public business showcase page.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Section 1: Business Details */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Business Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                name="business_name"
                value={businessPage.business_name}
                onChange={handlePageChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Coffee Corner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page URL Slug</label>
              <div className="flex items-center">
                <span className="px-4 py-2 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                  /b/
                </span>
                <input
                  type="text"
                  name="slug"
                  value={businessPage.slug}
                  onChange={handlePageChange}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="coffee-corner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={businessPage.category}
                  onChange={handlePageChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Cafe & Bakery"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={businessPage.phone}
                  onChange={handlePageChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={businessPage.whatsapp}
                  onChange={handlePageChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={businessPage.address}
                  onChange={handlePageChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="123 Main St, City"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={businessPage.description}
                onChange={handlePageChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Tell customers about your business..."
              />
            </div>
          </div>
        </section>

        {/* Section 2 & 3: Images */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Branding & Images</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative group">
                {businessPage.logo_url ? (
                  <div className="relative w-32 h-32 mx-auto">
                    <img src={businessPage.logo_url} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer text-white">
                      <Upload className="w-6 h-6" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'business-logos', 'logo_url')} />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-8">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">Upload Logo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'business-logos', 'logo_url')} />
                  </label>
                )}
              </div>
            </div>

            {/* Cover Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative group">
                {businessPage.cover_url ? (
                  <div className="relative w-full h-32 mx-auto">
                    <img src={businessPage.cover_url} alt="Cover" className="w-full h-full object-cover rounded-lg" />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer text-white">
                      <Upload className="w-6 h-6" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'business-gallery', 'cover_url')} />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-8">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">Upload Cover</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'business-gallery', 'cover_url')} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Services */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Services / Menu</h2>
            </div>
            <button onClick={addService} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>

          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-xl relative group">
                <button 
                  onClick={() => removeService(index)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Service Name</label>
                    <input
                      type="text"
                      value={service.service_name}
                      onChange={(e) => updateService(index, 'service_name', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Haircut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                    <input
                      type="text"
                      value={service.price}
                      onChange={(e) => updateService(index, 'price', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. $25"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <textarea
                    value={service.description}
                    onChange={(e) => updateService(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="Short description..."
                  />
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No services added yet.</p>
            )}
          </div>
        </section>

        {/* Section 5: Gallery */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Photo Gallery</h2>
            </div>
            <label className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer">
              <Plus className="w-4 h-4" /> Add Photo
              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleGalleryUpload(e.target.files[0])} />
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={img.image_url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {gallery.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                No photos in gallery
              </div>
            )}
          </div>
        </section>

        {/* Save Button */}
        <div className="sticky bottom-20 md:bottom-6 z-10 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white shadow-lg transition-all",
              success ? "bg-green-500 hover:bg-green-600" : "bg-indigo-600 hover:bg-indigo-700",
              saving && "opacity-75 cursor-not-allowed"
            )}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : success ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Saving...' : success ? 'Saved Successfully!' : 'Save Business Page'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-20 pb-12 flex flex-col items-center justify-center border-t border-gray-100 pt-12">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tighter">Scanzo</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Powered by Scanzo</p>
        </div>
      </div>
    </div>
  );
}
