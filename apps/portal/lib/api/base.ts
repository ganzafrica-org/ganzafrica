import { toast } from 'sonner';
import { TRPCClientError } from '@trpc/client';
import { queryClient } from '@/lib/api/trpc';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        details?: any;
    };
}

export interface ApiErrorDetails {
    code: string;
    message: string;
    details?: any;
}

export type ApiErrorHandler = (
    error: ApiErrorDetails
) => { message: string; showToast: boolean } | null;

const defaultErrorHandler: ApiErrorHandler = (error) => {
    return {
        message: error.message || 'An unexpected error occurred',
        showToast: true,
    };
};

/**
 * Error handlers for specific error codes
 */
const errorHandlers: Record<string, ApiErrorHandler> = {
    UNAUTHORIZED: (error) => ({
        message: 'You need to log in to access this resource',
        showToast: true,
    }),
    FORBIDDEN: (error) => ({
        message: 'You do not have permission to perform this action',
        showToast: true,
    }),
    NOT_FOUND: (error) => ({
        message: 'The requested resource was not found',
        showToast: true,
    }),
    CONFLICT: (error) => ({
        message: error.message || 'A conflict occurred with the requested operation',
        showToast: true,
    }),
    BAD_REQUEST: (error) => ({
        message: error.message || 'The request was invalid',
        showToast: true,
    }),
    TOO_MANY_REQUESTS: (error) => ({
        message: 'Too many requests. Please try again later',
        showToast: true,
    }),
    INTERNAL_SERVER_ERROR: (error) => ({
        message: 'An unexpected server error occurred. Please try again later',
        showToast: true,
    }),
};

export function handleApiError(error: unknown): ApiErrorDetails {
    console.error('API Error:', error);

    if (error instanceof TRPCClientError) {
        const tRPCError = error;
        // Extract error information from tRPC error
        const code = tRPCError.data?.code || 'INTERNAL_SERVER_ERROR';
        const message = tRPCError.message || 'An unexpected error occurred';
        const details = tRPCError.data;

        // Handle the error
        const handler = errorHandlers[code] || defaultErrorHandler;
        const handlerResult = handler({ code, message, details });

        if (handlerResult?.showToast) {
            toast.error(handlerResult.message);
        }

        return {
            code,
            message: handlerResult?.message || message,
            details,
        };
    }

    // Handle non-tRPC errors
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    toast.error(errorMessage);

    return {
        code: 'UNKNOWN_ERROR',
        message: errorMessage,
    };
}

/**
 * A wrapper function to handle API calls with error handling and response processing
 */
export async function apiCall<T>(
    apiFunction: () => Promise<any>,
    options: {
        successMessage?: string;
        errorMessage?: string;
        showSuccessToast?: boolean;
        showErrorToast?: boolean;
        onSuccess?: (data: T) => void;
        queryKey?: string | string[];
    } = {}
): Promise<ApiResponse<T>> {
    const {
        successMessage,
        showSuccessToast = true,
        onSuccess,
        queryKey,
    } = options;

    try {
        const response = await apiFunction();

        // If the API returns a structured response with success/data/message fields,
        // use that structure. Otherwise, create a standard response.
        const result: ApiResponse<T> = response?.success !== undefined
            ? response
            : { success: true, data: response as T };

        // Show success toast if requested and there's a message
        if (showSuccessToast && (successMessage || result.message)) {
            toast.success(successMessage || result.message);
        }

        // Invoke success callback if provided
        if (onSuccess && result.data) {
            onSuccess(result.data);
        }

        // Invalidate related queries if needed
        if (queryKey) {
            const keys = Array.isArray(queryKey) ? queryKey : [queryKey];
            keys.forEach(key => {
                queryClient.invalidateQueries({ queryKey: [key] });
            });
        }

        return result;
    } catch (error) {
        const errorDetails = handleApiError(error);

        return {
            success: false,
            error: {
                code: errorDetails.code,
                details: errorDetails.details,
            },
            message: errorDetails.message,
        };
    }
}

/**
 * Utility function to invalidate related queries
 */
export function invalidateQueries(keys: string | string[]) {
    const queryKeys = Array.isArray(keys) ? keys : [keys];
    queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
    });
}