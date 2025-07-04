-- Add latitude and longitude coordinates to drops table
ALTER TABLE public.drops 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add a comment to explain the coordinate fields
COMMENT ON COLUMN public.drops.latitude IS 'Latitude coordinate for drop location (-90 to 90)';
COMMENT ON COLUMN public.drops.longitude IS 'Longitude coordinate for drop location (-180 to 180)';