import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Header } from "../components/header/header";
import { HeaderActions } from "../components/headerActions/headerActions";

import { availableRoutes } from "../routes/availableRoutes";
import { logoutFn } from "../redux/thunks";
import { StyledBox, StyledMainContainer } from "./layout.styles";
import {
  selectBrandList,
  selectCurrentBrand,
  selectUserInfo,
  selectAuthTokenInfo,
} from "../redux/selectors";
import { setSelectedBrand } from "../redux/slices/brandSlice";

export const PrivateLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Selectors
  const userinfo = useSelector(selectUserInfo);
  const brands = useSelector(selectBrandList);
  const currentBrand = useSelector(selectCurrentBrand);
  const { isAuthenticated } = useSelector(selectAuthTokenInfo);

  const handleLogout = () => {
    dispatch(logoutFn());
  };

  const handleBrandChange = ({
    brandId,
    name,
  }: {
    brandId: number;
    name: string;
  }) => {
    dispatch(setSelectedBrand({ id: brandId, name }));
    navigate(availableRoutes.private.dashboard);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(availableRoutes.public.login);
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <Header
        actions={
          <HeaderActions
            brands={brands}
            currentBrand={currentBrand}
            user={{ userGivenName: userinfo?.userGivenName ?? "" }}
            onClickLogout={handleLogout}
            handleBrandChange={handleBrandChange}
            hideBrandsMenu={
              location.pathname === availableRoutes.private.brandSelector
            }
          />
        }
      />
      <main>
        <StyledMainContainer>
          <StyledBox col="1 /span 12" data-testid="dashboard">
            <Outlet />
          </StyledBox>
        </StyledMainContainer>
      </main>
    </>
  );
};
