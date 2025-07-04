-- Add minimum GHOX requirement field to drops table
ALTER TABLE public.drops 
ADD COLUMN min_ghox_required numeric DEFAULT 0;