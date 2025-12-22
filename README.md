# TradeSim 📈

**Real-Time Trading Platform Simulation**

TradeSim is a high-performance, full-stack trading simulation platform capable of handling real-time order matching, wallet management, and live market updates. Built to simulate the core architecture of a real exchange using a custom Matching Engine and Event-Driven Architecture.

🚀 **Live Demo:** [https://trade-sim-ten.vercel.app/]


## ⚡ Key Features

* **Real-Time Matching Engine:** Custom Node.js engine implementing **Price-Time Priority** matching logic.
* **Order Types:** Supports **LIMIT** (Maker) and **MARKET** (Taker) orders with partial fill support.
* **Live Updates:** Zero-latency UI updates for Order Book, Trades, and Wallet balances using **WebSockets**.
* **Atomic Wallet System:** Redis-backed wallet state using integer arithmetic (cents) to prevent floating-point errors and race conditions.
* **Secure Authentication:** Dual authentication strategy using **JWT** and **Google OAuth 2.0**.
* **Distributed Architecture:** Decoupled Pub/Sub messaging allowing the system to scale across multiple instances.

---

## 🛠 Tech Stack

* **Frontend:** React (Vite), TypeScript, Tailwind CSS, Socket.io Client
* **Backend:** Node.js, Express
* **Database (Persistent):** MongoDB (Users & Auth data)
* **State Management (Hot):** Redis (Order Book, Wallet Balances, Pub/Sub channels)
* **Real-Time Communication:** Socket.io (WebSockets)
* **Infrastructure:** Vercel (Frontend), Render (Backend), Upstash (Redis), MongoDB Atlas

---

## 🧠 System Architecture

The system is designed around a clear separation of concerns to handle high-concurrency trading scenarios.

### 1. The Matching Engine (Pure Logic)
* **Role:** The "Brain" of the exchange.
* **Behavior:** It is purely synchronous and in-memory for speed. It accepts an order and the current book, processes matches based on Price-Time priority, and returns the result (Fills, Partial Fills, Remaining).
* **No Database Side Effects:** It does not touch the DB; it simply returns the resulting state changes.

### 2. The Trading Service (Coordinator)
* **Role:** The "Conductor".
* **Workflow:**
    1. Receives API Request.
    2. **Locks Funds:** Uses Redis atomic operations to reserve funds (for BUY LIMIT).
    3. **Calls Matching Engine:** Gets the trade result.
    4. **Settles Trades:** Updates wallets atomically via `HINCRBY`.
    5. **Publishes Events:** Pushes `trade_executed` and `wallet_updated` to Redis Pub/Sub.

### 3. Event Propagation (Redis → Socket.io)
* **Challenge:** In a distributed environment (e.g., Render), the API server processing the trade might not be the same server holding the user's socket connection.
* **Solution:** We use a dedicated **Redis Subscriber** in the Socket service.
    * **Flow:** `TradingService` → `Redis Pub/Sub` → `Socket Service` → `Client UI`.

---

## 🔄 How It Works: The Trading Lifecycle

Here is the step-by-step process of what happens under the hood when a user places a trade:

### 1. Order Placement 📝
* **User Action:** User submits a `BUY` order for **10 BTC @ $50,000** (Limit Order).
* **API Layer:** The backend receives the request and validates the payload.

### 2. Fund Locking (Atomic) 🔒
* **Wallet Service:** Before the order hits the engine, the system checks the user's Redis wallet.
* **Action:** It atomically **locks** $500,000 (stored as `50000000` cents).
* *Note: MARKET orders do not lock funds upfront; they are settled immediately upon execution.*

### 3. Matching Engine Execution ⚙️
* **Processing:** The `TradingService` passes the order to the `MatchingEngine`.
* **Logic:** The engine scans the **Sell Side** of the Order Book (sorted by Price-Time priority).
* **Scenario A (No Match):** The order is added to the Buy Book. Status: `OPEN`.
* **Scenario B (Match Found):** The engine finds a Seller asking $50,000 or less. A `Trade` object is generated.

### 4. Settlement & Persistence 💰
* **Execution:** The system processes the `Trade` object:
    * **Buyer:** Locked funds are removed; "Asset" balance increases.
    * **Seller:** Wallet balance increases by the trade value.
* **Redis State:** The Order Book is updated (filled orders removed, partial orders updated).

### 5. Real-Time Propagation 📡
* **Event:** The backend publishes `trade_executed` and `wallet_updated` events to Redis Pub/Sub.
* **Socket Service:** The independent Socket service catches these events.
* **UI Update:** The frontend receives the event via WebSocket and updates the **Order Book**, **Trade History**, and **Wallet Balance** instantly without a page refresh.

---

## ⚙️ Engineering Challenges Solved

### 1. The "Race Condition" on Page Refresh
**Problem:** On page reload, the Socket client would attempt to connect before the Auth Context had fully loaded the JWT token, resulting in a failed handshake.

**Solution:** Implemented a **SocketManager** component that acts as a bridge. It listens to the Auth state and only initializes the socket connection once the user session is confirmed and the token is ready.

### 2. Atomic Wallet Operations
**Problem:** Handling money with JavaScript floats (`0.1 + 0.2 !== 0.3`) and ensuring two concurrent trades don't spend the same balance.

**Solution:**
* **Integer Math:** All values stored in Redis as **cents** (Integers). Converted to dollars only at the API boundary.
* **Redis Atomicity:** Strictly used `HINCRBY` (Hash Increment By) for all balance changes. This is an atomic operation, ensuring thread safety without complex locks.

### 3. Distributed Pub/Sub
**Problem:** In production, wallet updates were working locally but failing on deployed servers.

**Solution:** Configured **Dual Redis Clients**. One client is dedicated strictly to `SUBSCRIBE` (blocking mode), and another for standard Commands. This prevents the "connection hanging" issue when mixing modes.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Redis (Local or Upstash)
* MongoDB (Local or Atlas)

### 1. Clone the Repo
```bash
git clone https://github.com/yourusername/tradesim.git
cd tradesim
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

**Backend .env Configuration:**
```
PORT=3000
MONGO_URI=mongodb+srv://...
REDIS_URL=rediss://default:...@...upstash.io:6379
JWT_SECRET=your_super_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
CLIENT_URL=http://localhost:5173
```

**Run the server:**
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
```

**Frontend .env Configuration:**
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**Run the frontend:**
```bash
npm run dev
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google` | Authenticate with Google ID Token |
| GET | `/api/wallet` | Get current wallet balance (Snapshot) |
| POST | `/api/orders` | Place a new LIMIT or MARKET order |
| GET | `/api/orders/open` | Fetch active orders for the user |
| GET | `/api/orders/trades` | Fetch recent market trades |

---

## 📸 Screenshots & Demo

### 1. The Trading Dashboard
*Real-time Order Book, Trade History, and Order Entry form.*

![Trading Dashboard](./asstes/trading-dashboard.png)

### 2. Wallet & Portfolio
*Live wallet balance updates with atomic locking for active orders.*

![Wallet Page](./asstes/wallet-page.png)

---

## 🔮 Future Improvements

* **Candlestick Charts:** Persist trade history to TimescaleDB to generate OHLC candles.
* **Stop-Loss Orders:** Add trigger-based order types to the Matching Engine.
* **Multiple Assets:** Expand Redis keys to support multiple ticker symbols (e.g., BTC/USD, ETH/USD).

---

## 📄 License

MIT