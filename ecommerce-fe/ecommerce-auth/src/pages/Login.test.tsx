import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Login from "./Login";
import { useAuth } from "../utils/hooks/useAuth";

jest.mock("../assets/Logo.png");

jest.mock("../utils/hooks/useAuth");
jest.mock("../store/reducer", () => ({
  setUser: jest.fn(),
  loginSlice: {
    reducer: (state = {}, _: any) => state,
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockStore = configureStore([]);

describe("Login Component", () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      login: {
        user: {
          isAuthenticated: false,
        },
      },
    });

    (useAuth as jest.Mock).mockReturnValue({
      handleLogin: jest.fn().mockResolvedValue({ isAuthenticated: true }),
    });

    mockNavigate.mockClear();
  });

  const renderLogin = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
  };

  it("renders login form correctly", () => {
    renderLogin();

    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    expect(screen.getByTestId("login-link-text")).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    renderLogin();

    const signInButton = screen.getByTestId("submit-button");
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("shows error for invalid email format", async () => {
    renderLogin();

    const emailInput = screen.getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

    const signInButton = screen.getByTestId("submit-button");
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    const mockHandleLogin = jest.fn().mockResolvedValue({ isAuthenticated: true });
    (useAuth as jest.Mock).mockReturnValue({
      handleLogin: mockHandleLogin,
    });

    renderLogin();

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const signInButton = screen.getByTestId("submit-button");
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(mockHandleLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("navigates to products page after successful login", async () => {
    store = mockStore({
      login: {
        user: {
          isAuthenticated: true,
        },
      },
    });

    renderLogin();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/products");
    });
  });

  it("creates a React element", () => {
    const element = React.createElement("div", null, "Hello, User!");
    expect(element.type).toBe("div");
    expect(element.props.children).toBe("Hello, User!");
  });
});
