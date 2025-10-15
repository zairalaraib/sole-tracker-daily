import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (storage.isLoggedIn()) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null;
};

export default Index;
