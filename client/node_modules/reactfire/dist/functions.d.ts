import { ReactFireOptions, ObservableStatus } from './';
import type { HttpsCallableOptions } from 'firebase/functions';
/**
 * Calls a callable function.
 *
 * @param functionName - The name of the function to call
 * @param options
 */
export declare function useCallableFunctionResponse<RequestData, ResponseData>(functionName: string, options?: ReactFireOptions<ResponseData> & {
    httpsCallableOptions?: HttpsCallableOptions;
    data?: RequestData;
}): ObservableStatus<ResponseData>;
