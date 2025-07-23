declare module "@trim21/gm-fetch" {
    export interface GM_FetchOptions {
        method?: string;
        headers?: Record<string, string>;
        body?: string;
        timeout?: number;
    }

    export interface GM_FetchResponse {
        ok: boolean;
        status: number;
        statusText: string;
        json(): Promise<any>;
        text(): Promise<string>;
        headers: Headers;
    }

    export default function GM_fetch(url: string, options?: GM_FetchOptions): Promise<GM_FetchResponse>;
}