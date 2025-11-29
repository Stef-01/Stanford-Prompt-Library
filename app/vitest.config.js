import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // Use happy-dom for fast DOM simulation
    environment: 'happy-dom',

    // Global test utilities
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'dist/',
        'src/config/',
        'src/games/', // Game code not critical for testing
        'src/animations/', // Animation code low priority
      ],
      // Aim for 80% coverage on services
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },

    // Test file patterns
    include: ['tests/**/*.test.js'],

    // Setup files
    setupFiles: ['./tests/setup.js'],

    // Test timeout
    testTimeout: 10000,

    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
})
