import { RDSDataClient } from '@aws-sdk/client-rds-data';
import { drizzle } from 'drizzle-orm/aws-data-api/pg';
import * as schema from './schema';


let rdsDataClient: RDSDataClient | null = null;
let drizzleDb: ReturnType<typeof drizzle> | null = null;


export async function getDb() {
    if (!drizzleDb) {
        const clusterArn = process.env.DB_CLUSTER_ARN;
        const secretArn = process.env.DB_SECRET_ARN;
        const database = process.env.DB_NAME || 'itemsdb';

        if (!clusterArn) {
            throw new Error('DB_CLUSTER_ARN environment variable is not set');
        }

        if (!secretArn) {
            throw new Error('DB_SECRET_ARN environment variable is not set');
        }

        if (!rdsDataClient) {
            rdsDataClient = new RDSDataClient({});
        }

        drizzleDb = drizzle(rdsDataClient, {
            database,
            secretArn,
            resourceArn: clusterArn,
            schema,
        });
    }

    return drizzleDb;
}

// Export schema for use in handlers
export { schema };