import { Pool } from "pg";
import * as schema from "./schema";
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: Pool;
};
export declare function withDbTransaction<T>(callback: (txDb: any) => Promise<T>): Promise<T>;
export declare function setDbContext(userId: number | string | null, ipAddress: string | null): Promise<void>;
export declare function checkDatabaseConnection(): Promise<boolean>;
//# sourceMappingURL=client.d.ts.map