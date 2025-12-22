import React, { useEffect } from 'react';
import { useAuth } from './authContext';
import { socketService } from './socket';

export const SocketManager: React.FC = () => {
  // Listen to the 'user' state from your AuthContext
  const { user } = useAuth();

  useEffect(() => {
    // 1. Retrieve the token from storage (since AuthContext manages state, but token is in LS)
    const token = localStorage.getItem('token');

    // 2. Connection Logic
    // We only connect if we have a valid User object AND a Token
    if (user && token) {
    //   console.log(`🔵 SocketManager: Connecting for user ${user.name || 'User'}`);
      socketService.connect(token);
    } else {
      // If user logs out or state is cleared, cut the connection
    //   console.log('⚪ SocketManager: Disconnecting (No active session)');
      socketService.disconnect();
    }

    // 3. Cleanup (Optional but recommended)
    // When the app unmounts (rare) or user changes, we ensure we clean up
    return () => {
      // We don't necessarily want to disconnect on every re-render, 
      // but the dependency array [user] handles that safely.
    };
  }, [user]); // 👈 CRITICAL: This effect re-runs exactly when the User logs in, logs out, or reloads.

  // This component is "Headless" — it renders nothing to the DOM
  return null;
};