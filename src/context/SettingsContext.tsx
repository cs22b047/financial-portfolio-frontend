import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTheme } from 'next-themes';

interface UserSettings {
  id?: number;
  userName: string;
  currency: string;
  defaultCurrency: string;
  theme: string;
  timeZone: string;
  wallet: number;
}

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5500';

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/user-settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        // Apply theme from settings
        if (data.theme) {
          setTheme(data.theme);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const response = await fetch(`${apiUrl}/api/user-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        
        // Apply theme change immediately
        if (updates.theme) {
          setTheme(updates.theme);
        }
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
