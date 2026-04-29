import AuthDiagnostics from '@/components/AuthDiagnostics';

export default function AuthDebugPage() {
  return (
    <div style={{ padding: '20px' }}>
      <AuthDiagnostics />
      <div style={{ marginTop: '40px', padding: '20px', background: '#fff8dc', borderRadius: '4px', marginBottom: '40px' }}>
        <h3>💡 How to use this page:</h3>
        <ol>
          <li>Check each diagnostic result above</li>
          <li>Any ❌ status? Read the referenced .md files</li>
          <li>Most common issue: Wrong Supabase key (see SUPABASE_KEY_FIX.md)</li>
          <li>After fixing issues, restart dev server and refresh this page</li>
        </ol>
      </div>
    </div>
  );
}
