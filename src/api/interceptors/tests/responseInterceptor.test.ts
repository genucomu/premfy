import { AxiosError, AxiosResponse } from "axios";
import { responseInterceptor } from "../responseInterceptor";
import { store } from "../../../redux/store";
import { logoutFn } from "../../../redux/thunks";

jest.mock("../../../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
  },
}));

jest.mock("../../../redux/thunks", () => ({
  logoutFn: jest.fn(),
}));

let originalLocation: Location;

beforeAll(() => {
  originalLocation = window.location;

  delete (window as any).location;

  (window as any).location = { href: "" };
});

afterAll(() => {
  (window as any).location = originalLocation;
});

describe("responseInterceptor", () => {
  describe("onFulfilled", () => {
    it("debe retornar la misma respuesta que recibe", () => {
      const mockResponse = {
        data: { ok: true },
        status: 200,
        config: {},
      } as AxiosResponse;

      const result = responseInterceptor.onFulfilled(mockResponse);

      expect(result).toBe(mockResponse);
    });
  });

  describe("onRejected", () => {
    it("debe hacer dispatch de logoutFn y redirigir a /login si status=401 y code=REFRESH_TOKEN_INVALID", async () => {
      const mockError = {
        response: {
          status: 401,
          data: { code: "REFRESH_TOKEN_INVALID" },
        },
        config: {
          background: false,
        },
      } as AxiosError;

      await expect(responseInterceptor.onRejected(mockError)).rejects.toEqual(
        mockError
      );

      expect(store.dispatch).toHaveBeenCalledTimes(2);

      expect(store.dispatch).toHaveBeenCalledWith(logoutFn());

      expect(window.location.href).toBe("/login");
    });

    it("si no existe response, igual debe retornar la promesa rechazada con ese error", async () => {
      const mockError = {
        config: {},
      } as AxiosError;

      await expect(responseInterceptor.onRejected(mockError)).rejects.toEqual(
        mockError
      );
    });
  });
});
