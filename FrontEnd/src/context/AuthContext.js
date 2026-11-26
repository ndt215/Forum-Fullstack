import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

/** Truy cập trạng thái đăng nhập ở bất kỳ component nào. */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được dùng bên trong <AuthProvider>.");
  }

  return context;
}
