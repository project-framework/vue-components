import Axios, {
    AxiosInstance,
    AxiosRequestConfig,
} from 'axios';
import {
    PureHttpError,
    RequestMethods,
    PureHttpResponse,
    PureHttpRequestConfig,
    HttpPayload,
    HttpResponse,
} from './types.d';
import { stringify } from 'qs';
import { message } from 'ant-design-vue';

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
    // 请求超时时间
    timeout: 10000,
    headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    // 将数组格式的 query params 参数序列化：{ids: [1, 2]} → ids=1&ids=2
    paramsSerializer: {
        // encode: parse,
        // serialize: stringify,
        serialize: (params) => stringify(params, { indices: false }),
    },
};

class PureHttp {
    constructor() {
        this.httpInterceptorsRequest();
        this.httpInterceptorsResponse();
    }
    /** 保存当前Axios实例对象 */
    private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

    /** 统一的错误处理 */
    private errorHandler = (res: PureHttpResponse) => {
        const {
            config,
            data: { resultCode, resultMsg },
            status,
            statusText,
        } = res;
        const code = resultCode || status || 500;
        const msg = resultMsg || statusText || 'Internal Server Error';

        switch (code) {
            // todo: 自定义登录失败后, 清空登录态, 初始化 loginInit, 返回 login 页,
            case 401:
                console.warn('登录失败');
                break;
            default:
                break;
        }

        // 单独自行处理错误的请求, 不需要报错(需要 headers 配置 X-Handler: true)
        if (!config.headers!['X-Handler']) {
            message.error(`${code} ${msg}`);
        }
    };

    /** 请求拦截 */
    private httpInterceptorsRequest(): void {
        PureHttp.axiosInstance.interceptors.request.use(
            async (config) => {
                config.headers['Authorization'] = "XXXXXXXXX";
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    /** 响应拦截 */
    private httpInterceptorsResponse(): void {
        const instance = PureHttp.axiosInstance;
        instance.interceptors.response.use(
            (response: PureHttpResponse) => {
                const { resultCode, data = {} } = response.data;
                if (resultCode === 0) return data || {};
                this.errorHandler(response);
                return Promise.reject(response);
            },
            (error: PureHttpError) => {
                const $error = error;
                $error.isCancelRequest = Axios.isCancel($error); // 给 error 添加“是否取消请求”的判断属性

                if ($error.response) {
                    this.errorHandler($error.response);
                } else {
                    // 服务器崩溃时没有 response 响应
                    // 断网：
                    if (!window.navigator.onLine) {
                        message.error('服务端异常！');
                    }
                    // 超时：
                    if (/timeout/.test($error.message || '')) {
                        message.error('服务端超时！');
                    }
                }

                return Promise.reject($error.response || $error);
            }
        );
    }

    /** 通用请求工具函数 */
    public request<P>(
        method: RequestMethods,
        url: string,
        payload?: HttpPayload,
        axiosConfig?: PureHttpRequestConfig
    ): Promise<P> {
        const config = {
            method,
            url,
            ...payload,
            ...axiosConfig,
        } as PureHttpRequestConfig;

        // 单独处理自定义请求/响应回调
        return new Promise((resolve, reject) => {
            PureHttp.axiosInstance
                .request<HttpResponse<P>>(config)
                .then((response: any) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    /** 单独抽离的post工具函数 */
    public post<P, D = any>(
        url: string,
        payload?: HttpPayload<D>,
        config?: PureHttpRequestConfig
    ): Promise<P> {
        return this.request<P>('post', url, payload, config);
    }

    /** 单独抽离的get工具函数 */
    public get<P>(
        url: string,
        params?: { [key: string]: any },
        config?: PureHttpRequestConfig
    ): Promise<P> {
        return this.request<P>('get', url, { params }, config);
    }
}

export const http = new PureHttp();
