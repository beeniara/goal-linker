
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [currentUser, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin-slow h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
};

export default Index;
