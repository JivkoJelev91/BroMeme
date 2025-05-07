import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 
                    (typeof window !== 'undefined' && window.__SUPABASE_URL__) || 
                    'https://ghdffrmmrunnwmnjwhji.supabase.co';

const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 
                        (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__) || 
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZGZmcm1tcnVubndtbmp3aGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MTY0NjEsImV4cCI6MjA2MjE5MjQ2MX0.UfPKCV9M_oxJe0dAlkIi9rbSMRioJxYhRs0Jif55Scc';

                        export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
                            auth: {
                              persistSession: true,
                              storageKey: 'bromeme-auth',
                            }
                          });