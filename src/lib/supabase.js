import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://wkcvhoszcxblvdyevjyy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY3Zob3N6Y3hibHZkeWV2anl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NjcyODYsImV4cCI6MjA3MjI0MzI4Nn0.iFrj2VoLuRp4AIyU-bfipRyJFLoXVobj0gMnPk2wdu8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

