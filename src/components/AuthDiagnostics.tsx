'use client';

/**
 * Authentication Diagnostics Component
 * 
 * Place this in a debug page to test your Supabase setup
 * Access at: /auth-debug (after creating a route for it)
 */

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';

export default function AuthDiagnostics() {
  const [status, setStatus] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: Record<string, any> = {};
      if (!isSupabaseConfigured) {
        results.supabaseConnection = {
          status: '❌ Supabase not configured',
          error: 'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY',
        };
        results.environmentVars = {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
        };
        setStatus(results);
        setLoading(false);
        return;
      }

      const supabase = getSupabaseBrowserClient();

      // 1. Check Supabase connection
      try {
        const { data: { session } } = await supabase.auth.getSession();
        results.supabaseConnection = {
          status: session ? '✅ Connected' : '⚠️ No active session',
          session: session ? { user: session.user?.email, expiresAt: session.expires_at } : null,
        };
      } catch (err: unknown) {
        results.supabaseConnection = {
          status: '❌ Connection failed',
          error: err instanceof Error ? err.message : String(err),
        };
      }

      // 2. Check environment variables
      results.environmentVars = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
          ? `✅ Set (starts with: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...)` 
          : '❌ Missing',
      };

      // 3. Check users table
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .limit(1);

        if (error) {
          results.usersTable = {
            status: '❌ Table not accessible',
            error: error.message,
          };
        } else {
          results.usersTable = {
            status: '✅ Table accessible',
            rowCount: users?.length || 0,
          };
        }
      } catch (err: unknown) {
        results.usersTable = {
          status: '❌ Error querying table',
          error: err instanceof Error ? err.message : String(err),
        };
      }

      // 4. Test authentication (no credentials needed)
      try {
        const { data: testData, error: testError } = await supabase.auth.signUp({
          email: `test-${Date.now()}@debug.local`,
          password: 'TestPassword123!',
        });

        if (testError?.message.includes('secret')) {
          results.authEndpoint = {
            status: '❌ Using SECRET key instead of ANON key!',
            error: testError.message,
            fix: 'Check SUPABASE_KEY_FIX.md',
          };
        } else if (testError) {
          results.authEndpoint = {
            status: '⚠️ Auth endpoint error',
            error: testError.message,
          };
        } else {
          results.authEndpoint = {
            status: '✅ Auth endpoint working',
          };
          // Clean up test user
          if (testData.user?.id) {
            supabase.auth.admin?.deleteUser(testData.user.id).catch(() => {});
          }
        }
      } catch (err: unknown) {
        results.authEndpoint = {
          status: '❌ Auth test failed',
          error: err instanceof Error ? err.message : String(err),
        };
      }

      // 5. Check RLS policies
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: rlsError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id);

          results.rlsPolicies = {
            status: rlsError ? '⚠️ RLS might be blocking access' : '✅ RLS policies OK',
            error: rlsError?.message,
          };
        } else {
          results.rlsPolicies = {
            status: 'ℹ️ Not authenticated (can\'t test)',
          };
        }
      } catch (err: unknown) {
        results.rlsPolicies = {
          status: '❌ RLS check failed',
          error: err instanceof Error ? err.message : String(err),
        };
      }

      setStatus(results);
      setLoading(false);
    };

    runDiagnostics();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>🔍 Running diagnostics...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🔧 Auth Diagnostics</h1>
      
      {Object.entries(status).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h3 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>
            {key.replace(/([A-Z])/g, ' $1')}
          </h3>
          {typeof value === 'object' ? (
            <pre style={{ margin: '0', fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(value, null, 2)}
            </pre>
          ) : (
            <p style={{ margin: '0' }}>{value}</p>
          )}
        </div>
      ))}

      <div style={{ marginTop: '30px', padding: '15px', background: '#f0f0f0', borderRadius: '4px' }}>
        <h3>📋 Next Steps:</h3>
        <ul>
          <li>If any ❌ status shows, check the corresponding .md file:
            <ul>
              <li><strong>Secret key error</strong> → See SUPABASE_KEY_FIX.md</li>
              <li><strong>Table errors</strong> → Run schema from create-schema.sql</li>
              <li><strong>RLS errors</strong> → Check RLS policies in Supabase dashboard</li>
              <li><strong>Connection errors</strong> → See AUTH_TROUBLESHOOTING.md</li>
            </ul>
          </li>
          <li>Check console (F12) for detailed error messages</li>
          <li>Restart dev server after making changes</li>
        </ul>
      </div>
    </div>
  );
}
