import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const isProduction =
        configService.get<string>('NODE_ENV') === 'production';
      const dbUrl = configService.get<string>('POSTGRES_DB_URL');

      const host = configService.get<string>('POSTGRES_HOST');
      const port = configService.get<string>('POSTGRES_PORT');
      const user = configService.get<string>('POSTGRES_USER');
      const password = configService.get<string>('POSTGRES_PASSWORD');
      const database = configService.get<string>('POSTGRES_DB');
      const isLocalDbSetUp = host && port && user && password && database;

      if (!dbUrl && !isLocalDbSetUp) {
        console.error(
          'Missing environment variable to connect to DB: using default values',
        );
      }
      const connectionString =
        dbUrl ??
        `postgresql://${user ?? 'postgres'}:${password ?? 'postgres'}@${host ?? 'db'}:${port ?? '5432'}/${database ?? 'sddpc-db'}`;
      console.log(connectionString);

      try {
        const pool = new Pool({
          connectionString: connectionString,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
          max: 20, // Maximum number of clients in the pool
          idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
          connectionTimeoutMillis: 2000, // How long to wait for a connection
        });

        // Test the connection
        await pool.connect();
        console.log('Successfully connected to database');

        // List all tables in public schema
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE';
          `);

        console.log(
          'Available tables:',
          tables.rows.map((r) => r.table_name),
        );

        const result = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          );
        `);
        if (!result.rows[0].exists) {
          //console.log('Tables do not exist, pushing schema...');
          // You might want to trigger schema push here or throw a meaningful error
          throw new Error(
            'Database tables not found. Please run: npm run db:push',
          );
        }

        return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
      } catch (error) {
        console.error('Failed to connect to database:', dbUrl, error);
        throw error;
      }
    },
  },
];
