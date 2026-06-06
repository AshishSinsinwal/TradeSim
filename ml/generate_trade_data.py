import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_trades(num_trades=1000, num_users=50):
    """Generate synthetic trade data with realistic patterns and anomalies."""
    
    trades = []
    
    # Time range: last 7 days
    end_time = datetime.now()
    start_time = end_time - timedelta(days=7)
    
    # Initialize price
    current_price = 50000
    
    # Anomaly tracking
    anomaly_count = 0
    spike_trades = 20
    wash_trades = 20
    large_volume_trades = 10
    
    # For wash trading pairs
    wash_trading_pairs = []
    
    # Generate base trades
    for i in range(num_trades):
        # Timestamp: last 7 days, clustered 9am-5pm IST
        random_day = start_time + timedelta(days=random.random() * 7)
        
        # Cluster to 9am-5pm IST
        if random.random() < 0.85:  # 85% during trading hours
            hour = random.randint(9, 16)  # 9am to 4pm
            minute = random.randint(0, 59)
            second = random.randint(0, 59)
            timestamp = random_day.replace(hour=hour, minute=minute, second=second)
        else:
            # Off-hours trading (5pm-9am next day)
            hour = random.choice(list(range(17, 24)) + list(range(0, 9)))
            minute = random.randint(0, 59)
            second = random.randint(0, 59)
            timestamp = random_day.replace(hour=hour, minute=minute, second=second)
        
        # Price: random walk with noise
        price_change = random.uniform(-500, 500)
        current_price = max(1000, current_price + price_change)  # Prevent negative prices
        price = round(current_price, 2)
        
        # Quantity: log-normal distribution
        quantity = round(np.random.lognormal(mean=-1.5, sigma=0.8), 4)
        quantity = max(0.01, min(quantity, 2))  # Mostly 0.01-2
        
        # Order type: 70% LIMIT, 30% MARKET
        order_type = 'LIMIT' if random.random() < 0.7 else 'MARKET'
        
        # Side: ~50/50 BUY/SELL
        side = random.choice(['BUY', 'SELL'])
        
        # User ID
        user_id = random.randint(1, num_users)
        
        trades.append({
            'timestamp': timestamp,
            'price': price,
            'quantity': quantity,
            'order_type': order_type,
            'side': side,
            'user_id': user_id
        })
    
    # ===== INJECT ANOMALIES =====
    
    # 1. Price spike/crash trades (20 trades, 3x normal volatility)
    spike_indices = random.sample(range(len(trades)), spike_trades)
    for idx in spike_indices:
        if trades[idx]['side'] == 'BUY':
            trades[idx]['price'] = round(trades[idx]['price'] * random.uniform(0.7, 0.85), 2)  # Crash
        else:
            trades[idx]['price'] = round(trades[idx]['price'] * random.uniform(1.15, 1.3), 2)  # Spike
        anomaly_count += 1
    
    # 2. Wash trading pairs (20 trades, 10 pairs)
    wash_user_ids = random.sample(range(1, num_users + 1), 10)
    for user_id in wash_user_ids:
        base_idx = random.randint(0, len(trades) - 2)
        
        # Buy trade
        buy_timestamp = trades[base_idx]['timestamp']
        trades.append({
            'timestamp': buy_timestamp,
            'price': trades[base_idx]['price'],
            'quantity': trades[base_idx]['quantity'],
            'order_type': 'LIMIT',
            'side': 'BUY',
            'user_id': user_id
        })
        
        # Sell trade within 10 seconds
        sell_timestamp = buy_timestamp + timedelta(seconds=random.randint(1, 10))
        trades.append({
            'timestamp': sell_timestamp,
            'price': round(trades[base_idx]['price'] * random.uniform(0.99, 1.01), 2),
            'quantity': trades[base_idx]['quantity'],
            'order_type': 'LIMIT',
            'side': 'SELL',
            'user_id': user_id
        })
        anomaly_count += 2
    
    # 3. Abnormally large volume (10 trades, 50-100 BTC)
    large_volume_indices = random.sample(range(len(trades)), large_volume_trades)
    for idx in large_volume_indices:
        trades[idx]['quantity'] = round(random.uniform(50, 100), 2)
        anomaly_count += 1
    
    # Convert to DataFrame
    df = pd.DataFrame(trades)
    
    # Sort by timestamp
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    # Save to CSV
    df.to_csv('ml/trades.csv', index=False)
    
    # Print summary
    print("\n" + "="*60)
    print("SYNTHETIC TRADE DATA GENERATION SUMMARY")
    print("="*60)
    print(f"Total trades generated: {len(df)}")
    print(f"Anomalies injected: {anomaly_count}")
    print(f"  - Price spikes/crashes: {spike_trades}")
    print(f"  - Wash trading pairs: {wash_trades} (2 trades × 10 pairs)")
    print(f"  - Abnormal volume trades: {large_volume_trades}")
    print(f"\nData split:")
    print(f"  - BUY orders: {len(df[df['side'] == 'BUY'])} ({len(df[df['side'] == 'BUY']) / len(df) * 100:.1f}%)")
    print(f"  - SELL orders: {len(df[df['side'] == 'SELL'])} ({len(df[df['side'] == 'SELL']) / len(df) * 100:.1f}%)")
    print(f"  - LIMIT orders: {len(df[df['order_type'] == 'LIMIT'])} ({len(df[df['order_type'] == 'LIMIT']) / len(df) * 100:.1f}%)")
    print(f"  - MARKET orders: {len(df[df['order_type'] == 'MARKET'])} ({len(df[df['order_type'] == 'MARKET']) / len(df) * 100:.1f}%)")
    print(f"\nPrice statistics:")
    print(f"  - Min: {df['price'].min():.2f}")
    print(f"  - Max: {df['price'].max():.2f}")
    print(f"  - Mean: {df['price'].mean():.2f}")
    print(f"  - Std Dev: {df['price'].std():.2f}")
    print(f"\nQuantity statistics:")
    print(f"  - Min: {df['quantity'].min():.4f}")
    print(f"  - Max: {df['quantity'].max():.2f}")
    print(f"  - Mean: {df['quantity'].mean():.4f}")
    print(f"  - Trades < 2: {len(df[df['quantity'] < 2])} ({len(df[df['quantity'] < 2]) / len(df) * 100:.1f}%)")
    print(f"  - Trades >= 50: {len(df[df['quantity'] >= 50])} ({len(df[df['quantity'] >= 50]) / len(df) * 100:.1f}%)")
    print(f"\nUser distribution:")
    print(f"  - Unique users: {df['user_id'].nunique()}")
    print(f"  - Avg trades per user: {len(df) / df['user_id'].nunique():.1f}")
    print(f"\nTimestamp range:")
    print(f"  - Start: {df['timestamp'].min()}")
    print(f"  - End: {df['timestamp'].max()}")
    print(f"\nData saved to: ml/trades.csv")
    print("="*60 + "\n")

if __name__ == '__main__':
    generate_trades(num_trades=1000, num_users=50)
