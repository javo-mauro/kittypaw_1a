import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { apiRequest } from '../client/src/lib/queryClient';

// Mock server setup
const server = setupServer(
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = await request.json();

    if (username === 'testuser' && password === 'password123') {
      return HttpResponse.json({ success: true, user: { id: 1, username: 'testuser' } });
    }

    return HttpResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('API Authentication', () => {
  it('should login successfully with correct credentials', async () => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'testuser', password: 'password123' }),
    });

    expect(response.success).toBe(true);
    expect(response.user).toBeDefined();
    expect(response.user.username).toBe('testuser');
  });

  it('should fail to login with incorrect credentials', async () => {
    try {
      await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', password: 'wrongpassword' }),
      });
    } catch (error: any) {
      expect(error.status).toBe(401);
      expect(error.message).toContain('Credenciales inválidas');
    }
  });
});
