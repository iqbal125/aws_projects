import type { Config } from 'drizzle-kit';

export default {
    schema: './lib/functions/shared/schema.ts',
    out: './lib/functions/shared/migrations',
    driver: 'pg',
    dbCredentials: {
        // These will be dynamically set by the AWS Data API client
        connectionString: 'placeholder',
    },
} satisfies Config;