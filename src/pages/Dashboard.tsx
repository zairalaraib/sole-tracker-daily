import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, LogOut, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Shoe = Tables<'shoes'>;

const Dashboard = () => {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }

      await fetchShoes();
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchShoes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load shoes');
      console.error(error);
    } else {
      setShoes(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-secondary">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">My Shoe Collection</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/wear-log')}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Wear Log
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/add-shoe')} 
            size="lg"
            className="w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Shoe
          </Button>
        </div>

        {loading ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground text-lg">Loading...</p>
            </CardContent>
          </Card>
        ) : shoes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground text-lg mb-4">
                No shoes in your collection yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Click "Add New Shoe" to start tracking!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shoes.map((shoe) => (
              <Card 
                key={shoe.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/shoe/${shoe.id}`)}
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  {shoe.image_url ? (
                    <img 
                      src={shoe.image_url} 
                      alt={shoe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{shoe.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{shoe.brand}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{shoe.type || 'N/A'}</span>
                    <span className="font-medium">${shoe.price?.toFixed(2) || '0.00'}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4">
                  <div className="w-full text-sm text-muted-foreground">
                    Worn {shoe.wear_count} {shoe.wear_count === 1 ? 'time' : 'times'}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
