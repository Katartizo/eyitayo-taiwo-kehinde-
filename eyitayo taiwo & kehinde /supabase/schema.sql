
-- Enable Row Level Security
ALTER TABLE public.birthday_wishes
ENABLE ROW LEVEL SECURITY;

-- Allow visitors to read birthday wishes
DROP POLICY IF EXISTS "Public can read birthday wishes"
ON public.birthday_wishes;

CREATE POLICY "Public can read birthday wishes"
ON public.birthday_wishes
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow visitors to submit wishes that publish immediately
DROP POLICY IF EXISTS "Public can submit birthday wishes"
ON public.birthday_wishes;

CREATE POLICY "Public can submit birthday wishes"
ON public.birthday_wishes
FOR INSERT
TO anon, authenticated
WITH CHECK (approved = true);

-- Grant the necessary table permissions
GRANT SELECT, INSERT
ON public.birthday_wishes
TO anon, authenticated;

-- Enable Row Level Security
ALTER TABLE public.birthday_wishes
ENABLE ROW LEVEL SECURITY;

-- Allow visitors to read birthday wishes
DROP POLICY IF EXISTS "Public can read birthday wishes"
ON public.birthday_wishes;

CREATE POLICY "Public can read birthday wishes"
ON public.birthday_wishes
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow visitors to submit wishes that publish immediately
DROP POLICY IF EXISTS "Public can submit birthday wishes"
ON public.birthday_wishes;

CREATE POLICY "Public can submit birthday wishes"
ON public.birthday_wishes
FOR INSERT
TO anon, authenticated
WITH CHECK (approved = true);

-- Grant the necessary table permissions
GRANT SELECT, INSERT
ON public.birthday_wishes
TO anon, authenticated;
