import dayjs from "dayjs";
import { isAboutToExpire } from "../../../../../utils/dateUtils";
import { refreshTokenHelper } from "./refreshTokenHelper";
import { store } from "redux/store";
import { logoutFn } from "redux/thunks";
import { resetAllState } from "redux/actions/resetActions";
import { availableRoutes } from "routes/availableRoutes";

export async function getJWT(): Promise<string | void> {
  const state = store.getState();
  const accessToken = state.auth.accessToken || "";
  const accessTokenExpiresAt = state.auth.accessTokenExpiresAt || "";
  const refreshToken = state.auth.refreshToken || "";
  const refreshTokenExpiresAt = state.auth.refreshTokenExpiresAt || "";

  if (
    !accessToken ||
    !accessTokenExpiresAt ||
    !refreshToken ||
    !refreshTokenExpiresAt
  ) {
    window.location.href = availableRoutes.public.login;
    return;
  }

  const now = dayjs();
  const expiresAtDate = dayjs(accessTokenExpiresAt);
  const refreshExpiresDate = dayjs(refreshTokenExpiresAt);

  if (refreshExpiresDate.isBefore(now)) {
    store.dispatch(resetAllState());
    return;
  }

  const accessExpiredAndRefreshIsActive =
    expiresAtDate.isBefore(now) && refreshExpiresDate.isAfter(now);

  if (
    accessExpiredAndRefreshIsActive ||
    isAboutToExpire(accessTokenExpiresAt, 1) ||
    isAboutToExpire(refreshTokenExpiresAt, 1)
  ) {
    const newAccessToken = await refreshTokenHelper(refreshToken);
    if (newAccessToken) {
      return newAccessToken;
    }
    store.dispatch(logoutFn());
    store.dispatch(resetAllState());
    return;
  }

  return accessToken;
}
