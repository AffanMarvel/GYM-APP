// This file is deprecated. Auth is now handled by Firebase.
// See: src/firebase/authService.js and src/context/AuthContext.jsx
//
// Keeping this file to avoid breaking any possible stale imports.
// It exports empty stubs.

export const verifyCredentials = async () => false;
export const createSession = () => null;
export const getSession = () => null;
export const clearSession = () => {};
