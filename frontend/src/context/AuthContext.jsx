import React, { createContext, useContext, useState, useEffect, useCallback, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, userApi, workerApi, providerApi } from '../api/services';
import { normalizeUser } from '../api/normalizers';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);
const STORAGE_KEY = 'gigmart_user';

export function AuthProvider({ children }) {
  const [, startTransition] = useTransition();
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? normalizeUser(JSON.parse(stored)) : null;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const fetchProfileForUser = useCallback(async (targetUser) => {
    if (!targetUser) {
      setProfile(null);
      setProfileError(null);
      return null;
    }

    if (targetUser.role === 'ADMIN') {
      setProfile(null);
      setProfileError(null);
      return null;
    }

    try {
      setProfileError(null);
      let prof = null;
      if (targetUser.role === 'WORKER') {
        prof = await workerApi.getByUserId(targetUser.id);
      } else if (targetUser.role === 'PROVIDER') {
        prof = await providerApi.getByUserId(targetUser.id);
      }
      setProfile(prof);
      return prof;
    } catch (err) {
      setProfile(null);
      setProfileError(err.message || 'Failed to load profile');
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      return await fetchProfileForUser(user);
    }
    return null;
  }, [user, fetchProfileForUser]);

  // Initial validation effect
  useEffect(() => {
    let ignore = false;

    async function initSession() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        if (!ignore) {
          setUser(null);
          setProfile(null);
          setInitializing(false);
        }
        return;
      }

      let parsedUser = null;
      try {
        parsedUser = JSON.parse(stored);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        if (!ignore) {
          setUser(null);
          setProfile(null);
          setInitializing(false);
        }
        return;
      }

      try {
        // Validate user with server
        const freshUserRaw = await userApi.getById(parsedUser.id);
        const freshUser = normalizeUser(freshUserRaw);

        if (!ignore) {
          setUser(freshUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(freshUser));
          await fetchProfileForUser(freshUser);
        }
      } catch (err) {
        if (err.status === 404) {
          // User deleted or DB reset
          localStorage.removeItem(STORAGE_KEY);
          if (!ignore) {
            setUser(null);
            setProfile(null);
          }
        } else {
          // Network failure or other error: keep cached user, show toast
          toastError('Cannot reach server to verify session. Using offline state.');
          if (!ignore && parsedUser) {
            await fetchProfileForUser(parsedUser);
          }
        }
      } finally {
        if (!ignore) {
          setInitializing(false);
        }
      }
    }

    initSession();

    return () => {
      ignore = true;
    };
  }, [fetchProfileForUser, toastError]);

  const login = useCallback(
    async (email, password) => {
      const rawUser = await authApi.login({ email, password });
      const normalized = normalizeUser(rawUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      setUser(normalized);
      await fetchProfileForUser(normalized);
      return normalized;
    },
    [fetchProfileForUser]
  );

  const register = useCallback(
    async (payload) => {
      await authApi.register(payload);
      // Auto-login to obtain identical stored user shape
      return await login(payload.email, payload.password);
    },
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setProfile(null);
    setProfileError(null);
    startTransition(() => {
      navigate('/login');
    });
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        initializing,
        profileError,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

