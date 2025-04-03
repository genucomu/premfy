import React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import renderWithTheme from "@flame-ui/utils/render-test-utils";

import { store } from "../redux/store";
import { PrivateLayout } from "./PrivateLayout";
import { availableRoutes } from "../routes/availableRoutes";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../components/headerActions/headerActions", () => {
  return {
    HeaderActions: (props: any) => (
      <div data-testid="mock-header-actions">
        Mock HeaderActions
        <button
          onClick={props.handleBrandChange}
          data-testid="switch-brand-mocked"
        >
          Cambiar de brand
        </button>
        <button onClick={props.onClickLogout} data-testid="logout-mocked">
          Logout
        </button>
      </div>
    ),
  };
});

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

describe("PrivateLayout (mockeando subcomponentes Flame)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  function setup(isAuthenticated: boolean) {
    (useSelector as jest.Mock)
      .mockReturnValueOnce({
        userGivenName: "Name",
      })
      .mockReturnValueOnce([
        { id: 1, name: "Adidas" },
        { id: 2, name: "Nike" },
      ])
      .mockReturnValueOnce({ id: 1, name: "Adidas" })
      .mockReturnValueOnce({ isAuthenticated });

    return renderWithTheme(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/"]}
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <Routes>
            <Route path="/" element={<PrivateLayout />}>
              <Route index element={<div>Mock Child</div>} />
            </Route>
            <Route
              path={availableRoutes.public.login}
              element={<div>Mock Login Page</div>}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  }

  it("redirige a login cuando no está autenticado", () => {
    setup(false);

    expect(mockNavigate).toBeCalledWith(availableRoutes.public.login);
  });

  it("debería hacer ejecutar el dispatch al clickear en el logout", () => {
    setup(true);
    const logoutButton = screen.getByTestId("logout-mocked");
    expect(logoutButton).toBeInTheDocument();
    fireEvent.click(logoutButton);
    expect(mockDispatch).toBeCalled();
  });

  it("debería hacer ejecutar el interior de la función handleBrandChange (dispatch y navigate)", () => {
    setup(true);
    const switchButton = screen.getByTestId("switch-brand-mocked");
    expect(switchButton).toBeInTheDocument();
    fireEvent.click(switchButton);
    expect(mockDispatch).toBeCalled();
    expect(mockNavigate).toBeCalledWith(availableRoutes.private.dashboard);
  });
});
