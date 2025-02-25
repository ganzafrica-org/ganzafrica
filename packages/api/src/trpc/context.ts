import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getAuthUser, UserSession } from '../modules/auth';

export interface Context {
    req: Request;
    resHeaders: Headers;
    user: UserSession | null;
}

export async function createContext({ req }: FetchCreateContextFnOptions): Promise<Context> {
    // Create response headers object
    const resHeaders = new Headers();

    // Get the user session from the request
    // We need to update middleware.ts to accept resHeaders instead of res
    const user = await getAuthUser({ req, resHeaders });

    return {
        req,
        resHeaders,
        user,
    };
}