import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Phone, 
  MessageSquare, 
  MapPin, 
  Star, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Instagram,
  Globe,
  Facebook,
  Twitter,
  Youtube
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface BusinessPage {
  id: string;
  owner_id: string;
  business_name: string;
  category: string;
  description: string;
  phone: string;
  whatsapp: string;
  address: string;
  logo_url: string;
  cover_url: string;
  theme_color: string;
  slug: string;
}

interface Service {
  id: string;
  service_name: string;
  price: string;
  description: string;
}

interface GalleryImage {
  id: string;
  image_url: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  customer_name: string;
  created_at: string;
}

const PublicBusinessPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<BusinessPage | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isExpired, setIsExpired] = useState(false);
  const [links, setLinks] = useState<any>(null);

  useEffect(() => {
    let subscriptionChannel: any = null;

    if (slug) {
      fetchData().then(() => {
        // Set up real-time listener after initial fetch
        if (page?.owner_id) {
          subscriptionChannel = supabase
            .channel(`business-public-${page.owner_id}`)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'businesses',
                filter: `owner_id=eq.${page.owner_id}`
              },
              (payload) => {
                const newStatus = payload.new.subscription_status;
                setIsExpired(newStatus !== 'active');
              }
            )
            .subscribe();
        }
      });
    }

    return () => {
      if (subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel);
      }
    };
  }, [slug, page?.owner_id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Page
      const { data: pageData, error: pageError } = await supabase
        .from('business_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (pageError || !pageData) {
        setError("Business page not found");
        setLoading(false);
        return;
      }

      setPage(pageData);

      // 2. Check Subscription
      const { data: bizData } = await supabase
        .from('businesses')
        .select('review_link, website_link, subscription_status')
        .eq('owner_id', pageData.owner_id)
        .maybeSingle();

      if (bizData) {
        setLinks({
          website_link: bizData.website_link,
          google_link: bizData.review_link
        });
        setIsExpired(bizData.subscription_status !== 'active');
      }

      // 3. Fetch Services (Try-catch for optional tables)
      try {
        const { data: servicesData } = await supabase
          .from('business_services')
          .select('*')
          .eq('business_id', pageData.id);
        if (servicesData) setServices(servicesData);
      } catch (e) { console.warn("business_services table might not exist"); }

      // 4. Fetch Gallery (Try-catch for optional tables)
      try {
        const { data: galleryData } = await supabase
          .from('business_gallery')
          .select('*')
          .eq('business_id', pageData.id);
        if (galleryData) setGallery(galleryData);
      } catch (e) { console.warn("business_gallery table might not exist"); }

      // 5. Fetch Reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', pageData.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (reviewsData) setReviews(reviewsData);

    } catch (err) {
      console.error("Error fetching public page:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black p-6">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading business page...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black p-6 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{error}</h1>
        <p className="text-gray-500 max-w-xs">The page you are looking for might have been moved or deleted.</p>
      </div>
    );
  }

  const themeColor = page.theme_color || '#3b82f6';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-20">
      {/* Inactive Banner */}
      {isExpired && (
        <div className="bg-amber-500 text-white py-3 px-6 text-center font-bold sticky top-0 z-[100] shadow-lg flex items-center justify-center gap-2">
          <AlertCircle size={20} />
          <span>Business Subscription Inactive - Explore & Reviews are temporarily disabled</span>
        </div>
      )}
      
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {page.cover_url ? (
          <img src={page.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-white/5">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white dark:bg-black border-4 border-white dark:border-zinc-900 shadow-lg overflow-hidden shrink-0">
              {page.logo_url ? (
                <img src={page.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Star size={40} />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">{page.business_name}</h1>
                <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  {page.category || 'Business'}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                {page.description}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                {page.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin size={16} style={{ color: themeColor }} />
                    {page.address}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
            {page.phone && (
              <a 
                href={`tel:${page.phone}`}
                className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold shadow-lg transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: themeColor }}
              >
                <Phone size={24} />
                <span className="text-sm">Call</span>
              </a>
            )}
            {(links?.whatsapp_link || page.whatsapp) && (
              <a 
                href={links?.whatsapp_link || `https://wa.me/${page.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 py-4 bg-green-500 text-white rounded-2xl font-bold shadow-lg transition-all hover:bg-green-600 active:scale-95"
              >
                <MessageSquare size={24} />
                <span className="text-sm">WhatsApp</span>
              </a>
            )}
            {links?.instagram_link && (
              <a 
                href={links.instagram_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 py-4 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white rounded-2xl font-bold shadow-lg transition-all hover:brightness-110 active:scale-95"
              >
                <Instagram size={24} />
                <span className="text-sm">Instagram</span>
              </a>
            )}
            {links?.website_link && (
              <a 
                href={!isExpired ? links.website_link : undefined}
                target={!isExpired ? "_blank" : undefined}
                rel={!isExpired ? "noopener noreferrer" : undefined}
                onClick={(e) => isExpired && e.preventDefault()}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold shadow-lg transition-all ${
                  isExpired 
                    ? 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed grayscale' 
                    : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                }`}
              >
                <Globe size={24} />
                <span className="text-sm">{isExpired ? 'Website Locked' : 'Website'}</span>
              </a>
            )}
            {page.address && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(page.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 py-4 bg-white dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl font-bold shadow-lg transition-all hover:bg-gray-50 dark:hover:bg-white/10 active:scale-95 col-span-2 sm:col-span-1"
              >
                <MapPin size={24} />
                <span className="text-sm">Directions</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Services & Gallery */}
        <div className="lg:col-span-2 space-y-12">
          {/* Services */}
          {services.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: themeColor }} />
                Our Services
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">{service.service_name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
                    </div>
                    <div className="text-lg font-black" style={{ color: themeColor }}>
                      {service.price}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Gallery */}
          {gallery.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: themeColor }} />
                Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((img) => (
                  <div key={img.id} className="aspect-square rounded-2xl overflow-hidden shadow-sm">
                    <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover hover:scale-110 transition-all duration-500" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Reviews */}
        <div className="space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: themeColor }} />
              Reviews
            </h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{review.customer_name || 'Customer'}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-700"} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">\"{review.comment}\"</p>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {reviews.length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                  No reviews yet.
                </div>
              )}
              
              <button 
                onClick={() => !isExpired && window.open(`/r/${slug}`, '_blank')}
                disabled={isExpired}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  isExpired 
                    ? 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {isExpired ? 'Reviews Disabled' : 'Leave a Review'}
                <ChevronRight size={16} />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Social Links Bottom */}
      {links && Object.keys(links).length > 0 && (
        <div className="max-w-4xl mx-auto px-6 mt-12 pt-12 border-t border-gray-200 dark:border-white/10 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Connect with us</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(links).map(([key, url]) => {
              if (!url || typeof url !== 'string') return null;
              const platform = key.replace('_link', '');
              
              let Icon = ExternalLink;
              if (platform === 'instagram') Icon = Instagram;
              if (platform === 'website') Icon = Globe;
              if (platform === 'facebook') Icon = Facebook;
              if (platform === 'twitter') Icon = Twitter;
              if (platform === 'youtube') Icon = Youtube;
              
              return (
                <a 
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-all shadow-sm"
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>
      )}
      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 mt-20 pb-12 flex flex-col items-center justify-center border-t border-gray-200 dark:border-white/10 pt-12">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45" />
          </div>
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">Scanzo</span>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Powered by Scanzo</p>
      </div>
    </div>
  );
};

export default PublicBusinessPage;
