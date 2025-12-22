import axios from 'axios';
import { OrderSide, OrderType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Axios instance with JWT support
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // ---------------- AUTH ----------------

  async login(credentials: { email: string; password: string }) {
    console.log("here");
    const res = await apiClient.post('/auth/login', credentials);

    const { token , user } = res.data;
    localStorage.setItem('token', token);

    return { token , user };
  },

  async register(data: { name : string , email: string; password: string }) {
    const res = await apiClient.post('/auth/register', data);
    const {token , user} = res.data;

    if(token){
      localStorage.setItem('token' , token);
    }

    return { success: true , token , user };
  },
  auth: {
    async google(accessToken: string) {
      const res = await apiClient.post('/auth/google', { access_token: accessToken });
      const { token, user } = res.data;
      if (token) {
        localStorage.setItem('token', token);
      }
      return { token, user };
    }
  } ,
  // ---------------- WALLET ----------------

  async getWallet() {
    // Snapshot only (authoritative state still comes via socket)
    const res = await apiClient.get('/wallet');
    return res.data;
  },

  async topUp(amount: number) {
    await apiClient.post('/wallet/topup', { amount });

    // No balance returned intentionally
    // Wallet update will arrive via WebSocket
    return { status: 'command_accepted' };
  },

  // ---------------- TRADING ----------------

  async placeOrder(order: {
    side: OrderSide;
    type: OrderType;
    price?: number;
    quantity: number;
  }) {
    const res = await apiClient.post('/orders', order);

    // Backend only ACKs receipt
    // Order/trade updates come via socket
    return res.data;
  },


  async getOpenOrders() {
    // Fetches the user's currently active (OPEN/PARTIAL) orders
    const res = await apiClient.get('/orders/open');
    return res.data; // Expected: Array of Order objects
  },

  async getRecentTrades() {
    // Fetches the global recent trade history for the feed
    const res = await apiClient.get('/orders/trades');
    return res.data; // Expected: Array of Trade objects
  },
  
};
