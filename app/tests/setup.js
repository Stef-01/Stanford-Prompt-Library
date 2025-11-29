/**
 * Vitest Setup File
 * Runs before all tests
 */

import { vi } from 'vitest'

// Mock Supabase client
export const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
  insert: vi.fn(() => mockSupabaseClient),
  update: vi.fn(() => mockSupabaseClient),
  delete: vi.fn(() => mockSupabaseClient),
  eq: vi.fn(() => mockSupabaseClient),
  single: vi.fn(() => Promise.resolve({ data: null, error: null })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/image.jpg' } })),
    })),
  },
}

// Mock Supabase module
vi.mock('../src/config/supabase.js', () => ({
  supabase: mockSupabaseClient,
}))

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
