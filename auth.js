import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action, email, password, name } = body;

    switch (action) {
      case 'register': {
        if (!email || !password || !name) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email, password, and name are required' }) };
        }

        const { data, error } = await supabase.auth.admin.createUser({
          email: email.toLowerCase().trim(),
          password,
          email_confirm: true,
          user_metadata: { full_name: name.trim() }
        });

        if (error) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
        }

        // Insert user profile into public.users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({ id: data.user.id, name: name.trim(), email: data.user.email });

        if (profileError) {
          console.error('Profile insert error:', profileError);
        }

                return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Registration successful! You can now log in.',
            user: { id: data.user.id, email: data.user.email, name: name.trim() }
          })
        };
      }

      case 'login': {
        if (!email || !password) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password are required' }) };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password
        });

        if (error) {
          return { statusCode: 401, headers, body: JSON.stringify({ error: error.message }) };
        }

        if (!data.session) {
          return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid email or password' }) };
        }

        // Get user profile from public.users
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', data.user.id)
          .single();

        const user = {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || data.user.user_metadata?.full_name || data.user.email.split('@')[0]
        };

        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Set-Cookie': `auth_token=${data.session.access_token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`
          },
          body: JSON.stringify({ success: true, message: 'Login successful', user, token: data.session.access_token })
        };
      }

      case 'logout': {
        await supabase.auth.signOut();
        return {
          statusCode: 200,
          headers: { ...headers, 'Set-Cookie': 'auth_token=; HttpOnly; Path=/; Max-Age=0' },
          body: JSON.stringify({ success: true, message: 'Logged out' })
        };
      }

      default:
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action. Use register, login, or logout.' }) };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error', details: error.message }) };
  }
}

