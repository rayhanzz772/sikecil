import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { Child, Measurement, PredictionResponse } from '../types';

interface NakesContextType {
  childrenData: Child[];
  measurements: Measurement[];
  selectedChildId: string;
  setSelectedChildId: (id: string) => void;
  isLoading: boolean;
  fetchChildren: () => Promise<void>;
  fetchMeasurements: (childId: string) => Promise<void>;
  addChild: (child: Omit<Child, 'id'>) => Promise<void>;
  addMeasurement: (measurement: Omit<Measurement, 'id' | 'ageMonths'>) => Promise<void>;
}

const NakesContext = createContext<NakesContextType | undefined>(undefined);

export const NakesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [childrenData, setChildrenData] = useState<Child[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchChildren = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/children');
      const childrenArray = res.data.data || res.data;
      if (Array.isArray(childrenArray)) {
        setChildrenData(childrenArray);
        if (childrenArray.length > 0 && !selectedChildId) {
          setSelectedChildId(childrenArray[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch children', error);
      const saved = localStorage.getItem('sikecil-children');
      if (saved) setChildrenData(JSON.parse(saved));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMeasurements = async (childId: string) => {
    try {
      const res = await api.get(`/measurements?childId=${childId}`);
      const measurementsArray = res.data.data || res.data;
      if (Array.isArray(measurementsArray)) {
        setMeasurements(measurementsArray);
      }
    } catch (error) {
      console.error('Failed to fetch measurements', error);
      const saved = localStorage.getItem('sikecil-measurements');
      if (saved) setMeasurements(JSON.parse(saved));
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchMeasurements(selectedChildId);
    }
  }, [selectedChildId]);

  const addChild = async (child: Omit<Child, 'id'>) => {
    try {
      const res = await api.post('/children', child);
      const newChild = res.data.data || res.data;
      setChildrenData(prev => [...prev, newChild]);
      setSelectedChildId(newChild.id);
    } catch (error) {
      console.error(error);
      const newChild = { ...child, id: `child-${Date.now()}` };
      setChildrenData(prev => [...prev, newChild]);
      setSelectedChildId(newChild.id);
    }
  };

  const addMeasurement = async (measurement: Omit<Measurement, 'id' | 'ageMonths'>) => {
    try {
      const res = await api.post('/measurements', measurement);
      const newMeasurement = res.data.data || res.data;
      setMeasurements(prev => [...prev, newMeasurement]);
    } catch (error) {
      console.error(error);
      const newMeasurement = { ...measurement, id: `meas-${Date.now()}`, ageMonths: 0 };
      setMeasurements(prev => [...prev, newMeasurement]);
    }
  };

  return (
    <NakesContext.Provider value={{
      childrenData,
      measurements,
      selectedChildId,
      setSelectedChildId,
      isLoading,
      fetchChildren,
      fetchMeasurements,
      addChild,
      addMeasurement
    }}>
      {children}
    </NakesContext.Provider>
  );
};

export const useNakes = () => {
  const context = useContext(NakesContext);
  if (context === undefined) {
    throw new Error('useNakes must be used within a NakesProvider');
  }
  return context;
};
