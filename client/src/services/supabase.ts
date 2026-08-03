import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uutjbpyoiyflbwnxsrir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1dGpicHlvaXlmbGJ3bnhzcmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMTg5MDksImV4cCI6MjEwMDg5NDkwOX0.g8Bsua4W3Tu1789PTioFF3LGZ7mKsD_WZpj177VJ2Uo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const subscribeToRealtimeTable = (table: string, onUpdate: (payload: any) => void) => {
  const channelId = `realtime_${table}_${Math.random().toString(36).substring(2, 7)}`;
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
      onUpdate(payload);
    })
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
    channel,
  };
};

