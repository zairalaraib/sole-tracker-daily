-- Create shoes table
CREATE TABLE public.shoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC(10, 2),
  size TEXT,
  color TEXT,
  occasion TEXT,
  type TEXT,
  purchase_date DATE,
  image_url TEXT,
  wear_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shoes ENABLE ROW LEVEL SECURITY;

-- Create policies for shoes table
CREATE POLICY "Users can view their own shoes"
  ON public.shoes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shoes"
  ON public.shoes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shoes"
  ON public.shoes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shoes"
  ON public.shoes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create wear_logs table
CREATE TABLE public.wear_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shoe_id UUID NOT NULL REFERENCES public.shoes(id) ON DELETE CASCADE,
  worn_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wear_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for wear_logs table
CREATE POLICY "Users can view their own wear logs"
  ON public.wear_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wear logs"
  ON public.wear_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wear logs"
  ON public.wear_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on shoes
CREATE TRIGGER update_shoes_updated_at
  BEFORE UPDATE ON public.shoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_shoes_user_id ON public.shoes(user_id);
CREATE INDEX idx_wear_logs_user_id ON public.wear_logs(user_id);
CREATE INDEX idx_wear_logs_shoe_id ON public.wear_logs(shoe_id);
CREATE INDEX idx_wear_logs_worn_at ON public.wear_logs(worn_at DESC);