import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getAuthUser } from '../modules/auth/middleware';
import { UserSession } from '../modules/auth/types';

export interface Context {
    req: Request;
    res: Response;
    user: UserSession | null;
}

export async function createContext({ req, res }: FetchCreateContextFnOptions): Promise<Context> {
    // Get the user session from the request
    const user = await getAuthUser({ req, res } as Context);

    return {
        req,
        res,
        user,
    };
}