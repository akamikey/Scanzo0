-- Add automation columns to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS auto_reply_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_reply_prompt TEXT DEFAULT 'Thank you for your review! We appreciate your feedback.';

-- Add reply column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS reply TEXT,
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
