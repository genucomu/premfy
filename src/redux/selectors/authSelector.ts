import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";

const selectAuthState = (state: RootState) => state.auth;

export const selectAuthTokenInfo = createSelector([selectAuthState], (auth) => {
  return {
    accessToken: auth.accessToken,
    accessTokenExpiresAt: auth.accessTokenExpiresAt,
    refreshToken: auth.refreshToken,
    refreshTokenExpiresAt: auth.refreshTokenExpiresAt,
    enrollInfo: auth.enrollInfo,
    isAuthenticated: auth.isAuthenticated,
  };
});

export const selectTwoFactorInfo = createSelector([selectAuthState], (auth) => {
  return {
    twoFactorError: auth.twoFactorError,
    isAuthenticated: auth.isAuthenticated,
  };
});

export const selectUserInfo = createSelector(
  [selectAuthState],
  (auth) => auth.userInfo
);
