-- Allow public to view subscriptions (needed for QR code scanning)
DROP POLICY IF EXISTS "Public can view subscriptions" ON public.subscriptions;
CREATE POLICY "Public can view subscriptions" ON public.subscriptions FOR SELECT USING (true);
