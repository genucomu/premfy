import { AxiosError, AxiosResponse } from "axios";
import { store } from "../../redux/store";
import { logoutFn } from "redux/thunks";
import { decrementRequests } from "redux/slices/axiosSlice";
import { CustomAxiosRequestConfig } from "./requestInterceptor";

export const responseInterceptor = {
  onFulfilled: (response: AxiosResponse): AxiosResponse => {
    const config = response.config as CustomAxiosRequestConfig;
    if (!config.background) {
      store.dispatch(decrementRequests());
    }
    return response;
  },

  onRejected: (error: AxiosError): Promise<AxiosError> => {
    const statusCode = error.response?.status;
    const dataBody = error.response?.data as any;

    if (statusCode === 401) {
      const errorCode = dataBody?.code;

      if (errorCode === "REFRESH_TOKEN_INVALID") {
        store.dispatch(logoutFn());
        window.location.href = "/login";
      }
    }

    const config = error.config as CustomAxiosRequestConfig;
    if (!config.background) {
      store.dispatch(decrementRequests());
    }

    return Promise.reject(error);
  },
};
