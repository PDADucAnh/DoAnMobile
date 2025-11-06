import React, { createContext, useContext, useState, ReactNode } from "react";

// ======= Kiểu dữ liệu user =======
type User = {
  id?: string;
  email?: string;
  [key: string]: any;
};

// ======= Kiểu dữ liệu giỏ hàng =======
export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  [key: string]: any;
};

// ======= Kiểu context =======
export type UserContextType = {
  user?: User;
  token?: string;
  login: (user: User, token?: string) => void;
  logout: () => void;
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

// ======= Tạo context mặc định =======
const UserContext = createContext<UserContextType>({
  login: () => {},
  logout: () => {},
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

// ======= Provider =======
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const login = (userData: User, jwt?: string) => {
    setUser(userData);
    setToken(jwt);
  };

  const logout = () => {
    setUser(undefined);
    setToken(undefined);
    clearCart();
  };

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => [...prev, item]);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// ======= Hook dùng trong component =======
export const useUser = () => useContext(UserContext);
