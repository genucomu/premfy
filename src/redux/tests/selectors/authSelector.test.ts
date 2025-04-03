import {
    selectAuthTokenInfo,
    selectTwoFactorInfo,
    selectUserInfo,
  } from "redux/selectors";
  import { RootState } from "redux/store";
  
  describe("selectAuthTokenInfo", () => {
    it("should select auth token info from state", () => {
      const mockState: RootState = {
        auth: {
          accessToken: "mockAccessToken",
          accessTokenExpiresAt: "2023-12-31T23:59:59.999Z",
          enrollInfo: undefined,
          isAuthenticated: true,
          refreshToken: "mockRefreshToken",
          refreshTokenExpiresAt: "2024-12-31T23:59:59.999Z",
          isTemporaryPassword: false,
          userInfo: {
            userGivenName: "mockUserGivenName",
          },
        },
        brand: {
          brandList: [],
          error: null,
          status: "idle",
        },
        branch: {
          selectedBranches: [],
        },
        axios: {
          activeRequests: 0,
        },
        _persist: {
          version: 1,
          rehydrated: true,
        },
      };
  
      const selected = selectAuthTokenInfo(mockState);
  
      expect(selected).toEqual({
        accessToken: "mockAccessToken",
        accessTokenExpiresAt: "2023-12-31T23:59:59.999Z",
        refreshToken: "mockRefreshToken",
        refreshTokenExpiresAt: "2024-12-31T23:59:59.999Z",
        enrollInfo: undefined,
        isAuthenticated: true,
      });
    });
  
    it("should return undefined for missing auth state", () => {
      const mockState: RootState = {
        auth: {
          accessToken: null,
          accessTokenExpiresAt: undefined,
          enrollInfo: undefined,
          isAuthenticated: false,
          refreshToken: null,
          refreshTokenExpiresAt: undefined,
          isTemporaryPassword: false,
          userInfo: null,
        },
        brand: {
          brandList: [],
          error: null,
          status: "idle",
        },
        branch: {
          selectedBranches: [],
        },
        axios: {
          activeRequests: 0,
        },
        _persist: {
          version: 1,
          rehydrated: true,
        },
      };
  
      const selected = selectAuthTokenInfo(mockState);
  
      expect(selected).toEqual({
        accessToken: null,
        accessTokenExpiresAt: undefined,
        enrollInfo: undefined,
        isAuthenticated: false,
        refreshToken: null,
        refreshTokenExpiresAt: undefined,
      });
    });
  
    it("should return userInfo", () => {
      const mockState: RootState = {
        auth: {
          accessToken: null,
          accessTokenExpiresAt: undefined,
          enrollInfo: undefined,
          isAuthenticated: false,
          refreshToken: null,
          refreshTokenExpiresAt: undefined,
          isTemporaryPassword: false,
          userInfo: {
            userGivenName: "Test Name",
          },
          twoFactorError: "INVALID_CODE",
        },
        brand: {
          brandList: [],
          error: null,
          status: "idle",
        },
        branch: {
          selectedBranches: [],
        },
        axios: {
          activeRequests: 0,
        },
        _persist: {
          version: 1,
          rehydrated: true,
        },
      };
  
      const userInfo = selectUserInfo(mockState);
      const twoFactorInfo = selectTwoFactorInfo(mockState);
  
      expect(userInfo?.userGivenName).toBe(
        mockState.auth.userInfo?.userGivenName
      );
  
      expect(twoFactorInfo.twoFactorError).toBe(mockState.auth.twoFactorError);
    });
  });
  