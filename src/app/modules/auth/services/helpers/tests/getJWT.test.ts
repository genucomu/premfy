import { isAboutToExpire } from "../../../../../../utils/dateUtils";
import { getJWT } from "../getJWT";
import { refreshTokenHelper } from "../refreshTokenHelper";
import dayjs from "dayjs";
import { store } from "redux/store";
import { logoutFn } from "redux/thunks";
import { availableRoutes } from "routes/availableRoutes";

jest.mock("../../../../../../utils/dateUtils", () => ({
  isAboutToExpire: jest.fn(),
}));

jest.mock("../refreshTokenHelper", () => ({
  refreshTokenHelper: jest.fn(),
}));

jest.mock("redux/thunks", () => ({
  logoutFn: jest.fn(),
}));

jest.mock("redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(),
  },
}));

// Mockear la API de navegación
Object.defineProperty(window, "location", {
  value: {
    href: "",
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
});

describe("getJWT", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  it("debería retornar al login si no tiene token", async () => {
    (store.getState as jest.Mock).mockReturnValue({
      auth: {
        accessToken: "",
        accessTokenExpiresAt: "",
        refreshToken: "",
        refreshTokenExpiresAt: "",
      },
    });

    await getJWT();

    expect(window.location.href).toBe(availableRoutes.public.login);
    expect(isAboutToExpire).not.toHaveBeenCalled();
    expect(refreshTokenHelper).not.toHaveBeenCalled();
  });

  it("debería retornar el accessToken cuando no está por expirar", async () => {
    // Preparamos valores de prueba
    const fakeAccessToken = "token-valido";
    const fakeRefreshToken = "refresh-token-valido";
    const validExpiresAt = dayjs().add(10, "minute").toString();
    const validRefreshExpiresAt = dayjs().add(30, "minute").toString();

    (store.getState as jest.Mock).mockReturnValue({
      auth: {
        accessToken: fakeAccessToken,
        accessTokenExpiresAt: validExpiresAt,
        refreshToken: fakeRefreshToken,
        refreshTokenExpiresAt: validRefreshExpiresAt,
      },
    });

    // Mock para isAboutToExpire que retorne false
    (isAboutToExpire as jest.Mock).mockReturnValue(false);

    const result = await getJWT();

    expect(result).toBe(fakeAccessToken);
    expect(isAboutToExpire).toHaveBeenCalledWith(validExpiresAt, 1);
    expect(refreshTokenHelper).not.toHaveBeenCalled();
  });

  it("debería llamar a refreshTokenHelper cuando el token está por expirar", async () => {
    const fakeAccessToken = "token-por-expirar";
    const expiresSoon = dayjs().add(1, "minute").toString();
    const fakeRefreshToken = "refresh-token-123";
    const validRefreshExpiresAt = dayjs().add(30, "minute").toString();

    (store.getState as jest.Mock).mockReturnValue({
      auth: {
        accessToken: fakeAccessToken,
        accessTokenExpiresAt: expiresSoon,
        refreshToken: fakeRefreshToken,
        refreshTokenExpiresAt: validRefreshExpiresAt,
      },
    });

    // isAboutToExpire -> true (está por expirar)
    (isAboutToExpire as jest.Mock).mockReturnValue(true);

    // refreshTokenHelper -> "nuevo-token"
    (refreshTokenHelper as jest.Mock).mockResolvedValue("nuevo-token");

    const result = await getJWT();

    expect(refreshTokenHelper).toHaveBeenCalledWith(fakeRefreshToken);
    expect(result).toBe("nuevo-token");
  });

  it("debería retornar cadena vacía si refreshTokenHelper no devuelve un nuevo token (token por expirar)", async () => {
    const fakeAccessToken = "token-por-expirar";
    const expiresSoon = dayjs().add(1, "minute").toISOString();
    const fakeRefreshToken = "refresh-token-123";
    const refreshExpires = dayjs().add(31, "minute").toISOString();

    (store.getState as jest.Mock).mockReturnValue({
      auth: {
        accessToken: fakeAccessToken,
        accessTokenExpiresAt: expiresSoon,
        refreshToken: fakeRefreshToken,
        refreshTokenExpiresAt: refreshExpires,
      },
    });

    // isAboutToExpire -> true
    (isAboutToExpire as jest.Mock).mockReturnValue(true);

    // refreshTokenHelper -> null, simulando que no se pudo refrescar
    (refreshTokenHelper as jest.Mock).mockResolvedValue("");

    const result = await getJWT();

    expect(result).toBeUndefined();
    expect(refreshTokenHelper).toHaveBeenCalledWith(fakeRefreshToken);
    expect(store.dispatch).toHaveBeenCalledWith(logoutFn());
  });
});
