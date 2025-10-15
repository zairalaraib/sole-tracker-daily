import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { storage, WearLog as WearLogType, Shoe } from '@/lib/storage';
import { ArrowLeft } from 'lucide-react';

interface WearLogWithShoe extends WearLogType {
  shoe: Shoe | null;
}

const WearLog = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<WearLogWithShoe[]>([]);

  useEffect(() => {
    if (!storage.isLoggedIn()) {
      navigate('/');
      return;
    }
    const wearLogs = storage.getWearLogs();
    const logsWithShoes = wearLogs.map(log => ({
      ...log,
      shoe: storage.getShoeById(log.shoeId),
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setLogs(logsWithShoes);
  }, [navigate]);

  const groupedLogs = logs.reduce((acc, log) => {
    const date = new Date(log.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, WearLogWithShoe[]>);

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

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Wear History</h1>

        {logs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground text-lg">
                No wear history yet. Start logging when you wear your shoes!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLogs).map(([date, dateLogs]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold mb-3 text-muted-foreground">{date}</h2>
                <div className="space-y-2">
                  {dateLogs.map((log) => (
                    <Card 
                      key={log.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => log.shoe && navigate(`/shoe/${log.shoe.id}`)}
                    >
                      <CardContent className="flex items-center gap-4 py-4">
                        <div className="w-16 h-16 rounded bg-muted overflow-hidden flex-shrink-0">
                          {log.shoe?.image ? (
                            <img 
                              src={log.shoe.image} 
                              alt={log.shoe.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{log.shoe?.name || 'Unknown Shoe'}</h3>
                          <p className="text-sm text-muted-foreground">{log.shoe?.brand}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WearLog;
