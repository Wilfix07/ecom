import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

/**
 * ProtectedRoute component - Protects routes that require authentication
 * @param {Object} children - Child components to render
 * @param {String} requiredRole - Optional role requirement (e.g., 'admin', 'vendor')
 */
const ProtectedRoute = ({ children, requiredRole = null, fallback = null }) => {
  const { user, profile, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user role:', error);
        } else if (data) {
          setUserRole(data.role || 'customer');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, profile]);

  // Show loading state while checking authentication
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show fallback or null
  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Pou Ou Bezwen Konekte</h2>
          <p className="text-gray-600">Tanpri konekte pou aksede paj sa a.</p>
        </div>
      </div>
    );
  }

  // Check role requirement if specified
  if (requiredRole) {
    if (userRole !== requiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Aksè Entèdi</h2>
            <p className="text-gray-600 mb-4">
              Ou pa gen wòl nesesè (Bézwen: {requiredRole})
            </p>
            <p className="text-sm text-gray-500">
              Wòl ou: {userRole || 'customer'}
            </p>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has the required role (if any)
  return <>{children}</>;
};

export default ProtectedRoute;

