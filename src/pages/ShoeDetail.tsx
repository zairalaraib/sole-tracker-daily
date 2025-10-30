import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Shoe = Tables<'shoes'>;

const ShoeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    size: '',
    color: '',
    occasion: '',
    type: '',
    purchaseDate: '',
    imageUrl: '',
  });

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }

      if (id) {
        await fetchShoe();
      }
    };

    checkAuthAndFetch();
  }, [id, navigate]);

  const fetchShoe = async () => {
    if (!id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('shoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Shoe not found');
      navigate('/dashboard');
    } else {
      setShoe(data);
      setFormData({
        name: data.name,
        brand: data.brand,
        price: data.price?.toString() || '',
        size: data.size || '',
        color: data.color || '',
        occasion: data.occasion || '',
        type: data.type || '',
        purchaseDate: data.purchase_date || '',
        imageUrl: data.image_url || '',
      });
    }
    setLoading(false);
  };

  const handleWoreToday = async () => {
    if (!shoe) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: logError } = await supabase.from('wear_logs').insert({
      user_id: user.id,
      shoe_id: shoe.id,
    });

    if (logError) {
      toast.error('Failed to log wear');
      return;
    }

    const { error: updateError } = await supabase
      .from('shoes')
      .update({ wear_count: shoe.wear_count + 1 })
      .eq('id', shoe.id);

    if (updateError) {
      toast.error('Failed to update wear count');
    } else {
      setShoe({ ...shoe, wear_count: shoe.wear_count + 1 });
      toast.success(`Logged wear for ${shoe.name}`);
    }
  };

  const handleDelete = async () => {
    if (!shoe) return;

    const { error } = await supabase
      .from('shoes')
      .delete()
      .eq('id', shoe.id);

    if (error) {
      toast.error('Failed to delete shoe');
    } else {
      toast.success('Shoe deleted');
      navigate('/dashboard');
    }
  };

  const handleSave = async () => {
    if (!shoe) return;

    const { error } = await supabase
      .from('shoes')
      .update({
        name: formData.name,
        brand: formData.brand,
        price: formData.price ? parseFloat(formData.price) : null,
        size: formData.size || null,
        color: formData.color || null,
        occasion: formData.occasion || null,
        type: formData.type || null,
        purchase_date: formData.purchaseDate || null,
        image_url: formData.imageUrl || null,
      })
      .eq('id', shoe.id);

    if (error) {
      toast.error('Failed to update shoe');
    } else {
      await fetchShoe();
      setIsEditing(false);
      toast.success('Shoe updated');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!shoe) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-secondary">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <div className="aspect-square bg-muted">
              {shoe.image_url ? (
                <img 
                  src={shoe.image_url} 
                  alt={shoe.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">
                    {isEditing ? 'Edit Shoe' : shoe.name}
                  </CardTitle>
                  {!isEditing && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete shoe?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size">Size</Label>
                        <Input id="size" name="size" value={formData.size} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input id="color" name="color" value={formData.color} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="occasion">Occasion</Label>
                        <Input id="occasion" name="occasion" value={formData.occasion} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Input id="type" name="type" value={formData.type} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="purchaseDate">Purchase Date</Label>
                        <Input id="purchaseDate" name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSave} className="flex-1">
                        <Check className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Brand</p>
                      <p className="font-medium">{shoe.brand}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium">${shoe.price?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Size</p>
                        <p className="font-medium">{shoe.size || 'N/A'}</p>
                      </div>
                    </div>
                    {shoe.color && (
                      <div>
                        <p className="text-sm text-muted-foreground">Color</p>
                        <p className="font-medium">{shoe.color}</p>
                      </div>
                    )}
                    {shoe.occasion && (
                      <div>
                        <p className="text-sm text-muted-foreground">Occasion</p>
                        <p className="font-medium">{shoe.occasion}</p>
                      </div>
                    )}
                    {shoe.type && (
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{shoe.type}</p>
                      </div>
                    )}
                    {shoe.purchase_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">Purchase Date</p>
                        <p className="font-medium">{new Date(shoe.purchase_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground mb-2">Wear Count</p>
                      <p className="text-3xl font-bold text-accent">{shoe.wear_count}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {!isEditing && (
              <Button onClick={handleWoreToday} size="lg" className="w-full">
                I Wore This Today
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShoeDetail;
