import { useCallback, useEffect, useMemo, useState } from "react";
import { dangKy, dangNhap, dangXuat, layHoSo } from "../api/auth";
import { AuthContext } from "./AuthContext";

/**
 * Giữ trạng thái người dùng trong toàn ứng dụng.
 *
 * Khi tải trang, FrontEnd gọi GET /api/ho-so/ một lần để khôi phục phiên
 * đăng nhập từ cookie session của Django.
 */
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dangKhoiTao, setDangKhoiTao] = useState(true);

  useEffect(() => {
    let conHieuLuc = true;

    layHoSo()
      .then((data) => {
        if (conHieuLuc) setUser(data);
      })
      .catch(() => {
        if (conHieuLuc) setUser(null);
      })
      .finally(() => {
        if (conHieuLuc) setDangKhoiTao(false);
      });

    return () => {
      conHieuLuc = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await dangNhap(credentials);
    setUser(data.nguoi_dung);
    return data.nguoi_dung;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await dangKy(payload);
    setUser(data.nguoi_dung);
    return data.nguoi_dung;
  }, []);

  const logout = useCallback(async () => {
    try {
      await dangXuat();
    } finally {
      setUser(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await layHoSo();
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      dangKhoiTao,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refresh,
    }),
    [user, dangKhoiTao, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
