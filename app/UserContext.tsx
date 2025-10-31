import React, { createContext, useContext, useState, ReactNode } from "react";

// Kiểu dữ liệu user, bạn có thể thêm các trường khác nếu cần
type User = {
  id?: string;
  email?: string;
  [key: string]: any;
};

type UserContextType = {
  user?: User;
  token?: string;
  login: (user: User, token?: string) => void;
  logout: () => void;
};

// Tạo context mặc định
const UserContext = createContext<UserContextType>({
  login: () => {},
  logout: () => {},
});

// Provider
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);

  const login = (userData: User, jwt?: string) => {
    setUser(userData);
    setToken(jwt);
  };

  const logout = () => {
    setUser(undefined);
    setToken(undefined);
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook dùng trong component
export const useUser = () => useContext(UserContext);
