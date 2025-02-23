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
      const host = configService.get<string>('POSTGRES_HOST');
      const port = parseInt(
        configService.get<string>('POSTGRES_PORT') || '5432',
      );
      const user = configService.get<string>('POSTGRES_USER');
      const password = configService.get<string>('POSTGRES_PASSWORD');
      const database = configService.get<string>('POSTGRES_DB');

      const isDBSettingComplete = host && port && user && password && database;

      if (!isDBSettingComplete) {
        throw new Error(
          'Missing environment variable to  connect to DB \n Check if POSTGRES_HOST, POSTGRES_PORT POSTGRES_USER POSTGRES_PASSWORD DB_NAME are defined',
        );
      }

      try {
        const pool = new Pool({
          host,
          port,
          user,
          password,
          database,
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
        console.error(database,'Failed to connect to database:', error);
        throw error;
      }
    },
  },
];
