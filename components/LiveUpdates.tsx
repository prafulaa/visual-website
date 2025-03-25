import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CosmicUpdate {
  id: number;
  title: string;
  description: string;
  source: string;
  date: string;
  type: 'exoplanet' | 'star' | 'galaxy' | 'event';
}

const LiveUpdates: React.FC = () => {
  const [updates, setUpdates] = useState<CosmicUpdate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchCosmicUpdates = () => {
      setLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const mockUpdates: CosmicUpdate[] = [
          {
            id: 1,
            title: 'New Exoplanet Discovered',
            description: 'Astronomers have discovered a new Earth-like exoplanet in the habitable zone of its star, located just 40 light-years away.',
            source: 'NASA Exoplanet Program',
            date: '2023-10-15',
            type: 'exoplanet'
          },
          {
            id: 2,
            title: 'Supernova Detected in Andromeda Galaxy',
            description: 'A bright supernova has been observed in the Andromeda Galaxy, providing valuable data about stellar evolution.',
            source: 'European Space Agency',
            date: '2023-10-12',
            type: 'star'
          },
          {
            id: 3,
            title: 'Perseid Meteor Shower Peak',
            description: 'The annual Perseid meteor shower will reach its peak tonight, with up to 100 meteors per hour visible in dark sky locations.',
            source: 'International Meteor Organization',
            date: '2023-10-11',
            type: 'event'
          },
          {
            id: 4,
            title: 'Black Hole Merger Detected',
            description: 'Gravitational wave observatories have detected the merger of two black holes, each approximately 30 times the mass of our Sun.',
            source: 'LIGO Scientific Collaboration',
            date: '2023-10-05',
            type: 'galaxy'
          }
        ];
        
        setUpdates(mockUpdates);
        setLoading(false);
      }, 1000);
    };
    
    fetchCosmicUpdates();
  }, []);

  const getTypeIcon = (type: CosmicUpdate['type']) => {
    switch (type) {
      case 'exoplanet':
        return (
          <svg className="w-5 h-5 text-space-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" strokeWidth="2" />
          </svg>
        );
      case 'star':
        return (
          <svg className="w-5 h-5 text-space-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'galaxy':
        return (
          <svg className="w-5 h-5 text-space-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v20M2 12h20" />
          </svg>
        );
      case 'event':
        return (
          <svg className="w-5 h-5 text-space-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update, index) => (
        <motion.div 
          key={update.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="p-4 bg-space-navy/50 rounded-lg border border-white/5 hover:border-white/20 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {getTypeIcon(update.type)}
            </div>
            <div>
              <h4 className="text-lg font-medium text-white mb-1">{update.title}</h4>
              <p className="text-gray-300 text-sm mb-2">{update.description}</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{update.source}</span>
                <span>{update.date}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LiveUpdates; 