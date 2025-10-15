import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage, Shoe } from '@/lib/storage';
import { ArrowLeft, Trash2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

const ShoeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    size: '',
    color: '',
    occasion: '',
    type: '',
    purchaseDate: '',
    image: '',
  });

  useEffect(() => {
    if (!storage.isLoggedIn()) {
      navigate('/');
      return;
    }
    if (id) {
      const foundShoe = storage.getShoeById(id);
      if (foundShoe) {
        setShoe(foundShoe);
        setFormData({
          name: foundShoe.name,
          brand: foundShoe.brand,
          price: foundShoe.price.toString(),
          size: foundShoe.size,
          color: foundShoe.color,
          occasion: foundShoe.occasion,
          type: foundShoe.type,
          purchaseDate: foundShoe.purchaseDate,
          image: foundShoe.image,
        });
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, navigate]);

  const handleWoreToday = () => {
    if (shoe) {
      storage.addWearLog(shoe.id);
      const updatedShoe = storage.getShoeById(shoe.id);
      if (updatedShoe) {
        setShoe(updatedShoe);
      }
      toast({
        title: "Logged!",
        description: `You wore ${shoe.name} today.`,
      });
    }
  };

  const handleDelete = () => {
    if (shoe) {
      storage.deleteShoe(shoe.id);
      toast({
        title: "Shoe deleted",
        description: `${shoe.name} has been removed from your collection.`,
      });
      navigate('/dashboard');
    }
  };

  const handleSave = () => {
    if (shoe) {
      storage.updateShoe(shoe.id, {
        ...formData,
        price: parseFloat(formData.price) || 0,
      });
      const updatedShoe = storage.getShoeById(shoe.id);
      if (updatedShoe) {
        setShoe(updatedShoe);
      }
      setIsEditing(false);
      toast({
        title: "Shoe updated",
        description: "Your changes have been saved.",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
              {shoe.image ? (
                <img 
                  src={shoe.image} 
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
                              This action cannot be undone. This will permanently delete this shoe and all wear logs.
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
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size">Size</Label>
                        <Input
                          id="size"
                          name="size"
                          value={formData.size}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input
                          id="color"
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="occasion">Occasion</Label>
                        <Input
                          id="occasion"
                          name="occasion"
                          value={formData.occasion}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Input
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="purchaseDate">Purchase Date</Label>
                        <Input
                          id="purchaseDate"
                          name="purchaseDate"
                          type="date"
                          value={formData.purchaseDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                      />
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
                        <p className="font-medium">${shoe.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Size</p>
                        <p className="font-medium">{shoe.size}</p>
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
                    {shoe.purchaseDate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Purchase Date</p>
                        <p className="font-medium">{new Date(shoe.purchaseDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground mb-2">Wear Count</p>
                      <p className="text-3xl font-bold text-accent">{shoe.wearCount}</p>
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
