import Axios, {
    Method,
    AxiosError,
    AxiosResponse,
    AxiosRequestConfig,
} from 'axios';

export type resultType = {
    accessToken?: string;
};

/**
 * 请求的负载参数(query.params + post.data)
 */
type HttpPayload<D = any> = Pick<AxiosRequestConfig<D>, 'params' | 'data'>;

/**
 * 后端返回的数据结构
 */
interface HttpResponse<D = any> {
    resultCode: number; // 正常: 0, 异常: <0
    resultMsg: string;
    businessCode: number;
    uniqueId: string;
    extendLog: string;
    data: D;
}

export type RequestMethods = Extract<
    Method,
    'get' | 'post' | 'put' | 'delete' | 'patch' | 'option' | 'head'
>;

export interface PureHttpError<T = any> extends AxiosError<HttpResponse<T>> {
    isCancelRequest?: boolean;
}

export interface PureHttpResponse<T = any>
    extends AxiosResponse<HttpResponse<T>> {
    config: PureHttpRequestConfig;
}

export interface PureHttpRequestConfig extends AxiosRequestConfig {
    beforeRequestCallback?: (request: PureHttpRequestConfig) => void;
    beforeResponseCallback?: (response: PureHttpResponse) => void;
}

export default class PureHttp {
    request<T>(
        method: RequestMethods,
        url: string,
        param?: AxiosRequestConfig,
        axiosConfig?: PureHttpRequestConfig
    ): Promise<T>;
    post<T, P>(
        url: string,
        params?: T,
        config?: PureHttpRequestConfig
    ): Promise<P>;
    get<T, P>(
        url: string,
        params?: T,
        config?: PureHttpRequestConfig
    ): Promise<P>;
}
