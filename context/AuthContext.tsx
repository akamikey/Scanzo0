import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface OwnerData {
  id: string;
  business_id?: string;
  business_name: string;
  review_link: string;
  public_slug: string;
  location?: string;
  avatar_url?: string;
}

interface SubscriptionData {
  status: string;
  plan: string | null;
  start_date: string | null;
  end_date: string | null;
  isActive: boolean;
}

interface AuthContextType {
  user: any | null;
  session: any | null;
  ownerData: OwnerData | null;
  subscription: SubscriptionData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, businessName: string, reviewLink: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
  updateOwnerLink: (link: string) => void;
  updateBusinessName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [ownerData, setOwnerData] = useState<OwnerData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch business data with retry
  const fetchDataForUser = async (userId: string, retryCount = 0) => {
    try {
      // 1. Fetch Owner Profile (Base Data)
      const { data: owner, error: ownerError } = await supabase
        .from('owners')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); 

      if (ownerError) {
          if (ownerError.message?.includes('Failed to fetch') && retryCount < 3) {
              console.debug(`Retrying owner fetch (${retryCount + 1}/3)...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return fetchDataForUser(userId, retryCount + 1);
          }
          console.error("Error fetching owner:", ownerError);
      }
      
      let finalOwnerData = owner || null;

      // 2. Fetch Business Data (Primary Source for Link)
      if (finalOwnerData) {
          try {
              const { data: businessData, error: bError } = await supabase
                .from('businesses')
                .select('id, review_link, subscription_status')
                .eq('owner_id', userId)
                .maybeSingle();
                
              if (bError) {
                  if (bError.message?.includes('Failed to fetch') && retryCount < 3) {
                      // We don't retry here to avoid complexity, but we could
                  }
                  // If column doesn't exist, try fallback column names
                  const { data: fallbackData } = await supabase
                    .from('businesses')
                    .select('id, google_review_link')
                    .eq('owner_id', userId)
                    .maybeSingle();
                  
                  if (fallbackData) {
                      finalOwnerData = { 
                        ...finalOwnerData, 
                        business_id: fallbackData.id,
                        review_link: (fallbackData as any).google_review_link 
                      };
                  }
              } else if (businessData) {
                  finalOwnerData = { ...finalOwnerData, business_id: businessData.id };
                  if (businessData.review_link) {
                      finalOwnerData = { ...finalOwnerData, review_link: businessData.review_link };
                  }
              }
          } catch (e) {
              console.warn("Business fetch failed, using owner data only", e);
          }
      }

      setOwnerData(finalOwnerData);
      
      // Cache owner data
      if (finalOwnerData) {
        localStorage.setItem('cached_owner_data', JSON.stringify(finalOwnerData));
      }

      // 3. Fetch Subscription (Latest one)
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError && subError.message?.includes('Failed to fetch') && retryCount < 3) {
          // Silent retry for subscription
      }

      if (sub) {
        const now = new Date();
        const endDate = sub.current_period_end ? new Date(sub.current_period_end) : null;
        const isActive = sub.status === 'active' || sub.status === 'authenticated' || sub.status === 'completed';

        let planName = sub.plan_id;
        if (planName === 'plan_STxKdWOYODRHqL') planName = 'Monthly';
        else if (planName === 'plan_STxMY7FBbIvQcJ') planName = '6 Months';
        else if (planName === 'plan_SUIxB3anFaPXYG') planName = 'Yearly';
        else if (planName?.includes('monthly')) planName = 'Monthly';
        else if (planName?.includes('biannual')) planName = '6 Months';
        else if (planName?.includes('annual')) planName = 'Yearly';

        const subData: SubscriptionData = {
          status: sub.status,
          plan: planName,
          start_date: sub.created_at,
          end_date: sub.current_period_end,
          isActive: isActive
        };
        setSubscription(subData);
        localStorage.setItem('cached_subscription', JSON.stringify(subData));
      } else {
        const subData: SubscriptionData = { 
          status: 'inactive', 
          plan: 'Free', 
          start_date: null, 
          end_date: null,
          isActive: false
        };
        setSubscription(subData);
        localStorage.setItem('cached_subscription', JSON.stringify(subData));
      }
    } catch (error) {
      console.error("Critical error refreshing data:", error);
    }
  };

  // Public refresh function
  const refreshData = async () => {
    if (user?.id) {
        await fetchDataForUser(user.id);
    }
  };

  // Immediate local update for better UX
  const updateOwnerLink = (link: string) => {
    if (ownerData) {
        const updated = { ...ownerData, review_link: link };
        setOwnerData(updated);
        localStorage.setItem('cached_owner_data', JSON.stringify(updated));
    } else if (user) {
        // Fallback if ownerData was missing (e.g. first time setup or recovery)
        const newOwner: OwnerData = {
            id: user.id,
            business_name: 'My Business',
            review_link: link,
            public_slug: 'temp-' + Date.now(), // Temporary slug until refresh
        };
        setOwnerData(newOwner);
        localStorage.setItem('cached_owner_data', JSON.stringify(newOwner));
    }
  };

  const updateBusinessName = async (name: string) => {
    if (!user?.id) return;
    
    const { error } = await supabase
        .from('owners')
        .update({ business_name: name })
        .eq('id', user.id);
    
    if (error) {
        console.error("Error updating business name:", error);
        throw error;
    }

    if (ownerData) {
        const updated = { ...ownerData, business_name: name };
        setOwnerData(updated);
        localStorage.setItem('cached_owner_data', JSON.stringify(updated));
    }
  };

  // Helper to retry auth calls on lock contention
  const retryAuthCall = async (
    operation: () => Promise<any>,
    maxRetries = 3,
    delay = 500,
    isGetSession = false
  ): Promise<any> => {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await operation();
        if (!result.error) return result;
        
        // Check if error is lock-related or null access (often internal client state issue)
        const msg = result.error?.message || JSON.stringify(result.error) || '';
        if (msg.includes("Lock broken") || msg.includes("lock") || msg.includes("Cannot read properties of null") || msg.includes("Failed to fetch")) {
          lastError = result.error;
          // Use debug for retries to avoid console noise unless it's the last attempt
          if (i < maxRetries - 1) {
             console.debug(`Auth retry (${i + 1}/${maxRetries}): ${msg}`);
          } else {
             // If it's a lock error during getSession, just return null session instead of failing
             if (isGetSession && (msg.includes("Lock broken") || msg.includes("lock"))) {
                 console.debug(`Auth lock contention resolved by ignoring: ${msg}`);
                 return { data: { session: null, user: null }, error: null };
             }
             console.warn(`Auth failed after retries: ${msg}`);
          }
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        return result; // Return other errors immediately
      } catch (e: any) {
        // Handle unexpected throws
        const msg = e?.message || JSON.stringify(e) || '';
        if (msg.includes("Lock broken") || msg.includes("lock") || msg.includes("Cannot read properties of null") || msg.includes("Failed to fetch")) {
            lastError = e;
            if (i < maxRetries - 1) {
                console.debug(`Auth exception retry (${i + 1}/${maxRetries}): ${msg}`);
            } else {
                if (isGetSession && (msg.includes("Lock broken") || msg.includes("lock"))) {
                    console.debug(`Auth lock exception resolved by ignoring: ${msg}`);
                    return { data: { session: null, user: null }, error: null };
                }
                console.warn(`Auth exception failed: ${msg}`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
        }
        return { data: null as any, error: e };
      }
    }
    
    return { data: null as any, error: lastError };
  };

  useEffect(() => {
    let mounted = true;
    let authResolved = false;

    // Load cached data immediately on mount
    const cachedOwner = localStorage.getItem('cached_owner_data');
    const cachedSub = localStorage.getItem('cached_subscription');
    if (cachedOwner) {
        try { setOwnerData(JSON.parse(cachedOwner)); } catch (e) { console.error("Cache parse error", e); }
    }
    if (cachedSub) {
        try { setSubscription(JSON.parse(cachedSub)); } catch (e) { console.error("Cache parse error", e); }
    }

    const initializeAuth = async () => {
        // Safety timeout: force loading to false after 10 seconds no matter what
        const forceLoadingTimeout = setTimeout(() => {
            if (mounted) {
                console.warn("Auth initialization taking too long, forcing loading to false");
                setLoading(false);
            }
        }, 10000);

        try {
            // 1. Get Session with retry logic
            const result = await retryAuthCall(() => supabase.auth.getSession(), 3, 500, true);
            const error = result.error;
            const session = result.data?.session;
            
            if (error) {
                const msg = error.message || String(error);
                if (msg.includes("Refresh Token Not Found") || msg.includes("Invalid Refresh Token")) {
                    console.warn("Stale refresh token detected, clearing session");
                    await supabase.auth.signOut();
                    if (mounted) {
                        setSession(null);
                        setUser(null);
                        setOwnerData(null);
                        setSubscription(null);
                    }
                    return;
                }
                throw error;
            }
            
            if (mounted) {
                authResolved = true;
                setSession(session || null);
                setUser(session?.user ?? null);
                
                // 2. If User exists, Fetch Data
                if (session?.user) {
                    // Don't await this, let it load in the background
                    fetchDataForUser(session.user.id).catch(err => 
                        console.warn("Initial data fetch failed:", err)
                    );
                }
            }
        } catch (error: any) {
            if (mounted) {
                const msg = error?.message || String(error);
                // If onAuthStateChange already gave us a user (authResolved is true), don't treat this as a fatal error
                if (authResolved) {
                    console.warn("getSession failed but auth was already resolved:", error);
                } else if (msg.includes("Refresh Token Not Found") || msg.includes("Invalid Refresh Token")) {
                    console.warn("Stale session detected during initialization:", msg);
                    supabase.auth.signOut().catch(() => {});
                    setSession(null);
                    setUser(null);
                    setOwnerData(null);
                    setSubscription(null);
                } else if (msg.includes("Lock broken") || msg.includes("lock")) {
                    // Lock errors are common in React Strict Mode due to concurrent getSession/onAuthStateChange
                    console.warn("Auth initialization warning (lock contention):", msg);
                    // We don't set session to null here because onAuthStateChange might still succeed
                } else {
                    console.error("Auth initialization error:", error);
                    setSession(null);
                    setUser(null);
                }
            }
        } finally {
            clearTimeout(forceLoadingTimeout);
            if (mounted) setLoading(false);
        }
    };

    initializeAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
          authResolved = true;
          if ((event as string) === 'TOKEN_REFRESH_REVOKED') {
             console.warn("Token revoked");
             setSession(null); setUser(null); setOwnerData(null); setSubscription(null);
             setLoading(false);
             return;
          }

          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                // Don't await this, let it load in the background so we don't block the UI
                fetchDataForUser(session.user.id);
            }
          } else {
            setOwnerData(null);
            setSubscription(null);
          }
          
          setLoading(false);
      }
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await retryAuthCall(() => supabase.auth.signInWithPassword({ email, password }));
    
    if (!error && data?.user) {
        // Don't await this, let it load in the background
        fetchDataForUser(data.user.id).catch(err => console.warn("SignIn data fetch failed:", err));
    }
    return { error };
  };

  const signUp = async (email: string, password: string, businessName: string, reviewLink: string) => {
    const { data: authData, error: authError } = await retryAuthCall(() => supabase.auth.signUp({
      email,
      password,
    }));

    if (authError) return { error: authError };
    if (!authData?.user) return { error: { message: "User creation failed" } };

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + crypto.randomUUID().slice(0, 6);

    const { error: dbError } = await supabase.from('owners').insert({
      id: authData.user.id,
      business_name: businessName,
      public_slug: slug,
    });

    if (dbError) {
        console.error("DB Create Error:", dbError);
        return { error: dbError };
    }

    // Also create business entry with review link
    await supabase.from('businesses').insert({
      owner_id: authData.user.id,
      name: businessName,
      review_link: reviewLink
    });

    // Don't await this, let it load in the background
    fetchDataForUser(authData.user.id).catch(err => console.warn("SignUp data fetch failed:", err));

    return { error: null };
  };

  const signOut = async () => {
    // 1. Clear local artifacts first for instant feedback
    if (user?.id) {
        localStorage.removeItem(`chat_history_${user.id}`);
        // We DO NOT remove 'cached_owner_data' or 'cached_subscription' here
        // to persist details even after logout as requested.
        // They will be overwritten when a new user logs in and fetchDataForUser is called.
    }
    
    // 2. Clear Context State
    setUser(null);
    setSession(null);
    // We keep ownerData and subscription in state if we want them visible, 
    // but typically UI depends on 'user' being present. 
    // If the goal is to just have them ready for next login, we leave them in localStorage (done above).
    // If the goal is to show them on a public profile even when logged out, that's handled by PublicReviewPage.
    // For now, we clear the React state to ensure the UI reflects "Logged Out" status,
    // but the data remains in localStorage for the next session.
    setOwnerData(null);
    setSubscription(null);
    
    // 3. Call Supabase SignOut (Fire and forget if needed, but awaiting is safer)
    try {
        await supabase.auth.signOut();
    } catch (error) {
        console.warn("Sign out warning:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, ownerData, subscription, loading, signIn, signUp, signOut, refreshData, updateOwnerLink, updateBusinessName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};