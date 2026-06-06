import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from scipy import stats
import json
from datetime import datetime

def engineer_features(df):
    """Engineer features for anomaly detection."""
    df = df.copy()
    
    # Convert timestamp to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # 1. Price Z-score (rolling window of 50 trades)
    rolling_mean = df['price'].rolling(window=50, min_periods=1).mean()
    rolling_std = df['price'].rolling(window=50, min_periods=1).std().fillna(1)
    df['price_zscore'] = np.abs((df['price'] - rolling_mean) / rolling_std)
    
    # 2. Volume Z-score (rolling window of 50 trades)
    rolling_vol_mean = df['quantity'].rolling(window=50, min_periods=1).mean()
    rolling_vol_std = df['quantity'].rolling(window=50, min_periods=1).std().fillna(1)
    df['volume_zscore'] = np.abs((df['quantity'] - rolling_vol_mean) / rolling_vol_std)
    
    # 3. Price change percentage
    df['price_change_pct'] = df['price'].pct_change().fillna(0)
    df['price_change_pct'] = np.abs(df['price_change_pct']) * 100  # Convert to percentage
    
    # 4. Time gap in seconds
    df['time_gap_seconds'] = df['timestamp'].diff().dt.total_seconds().fillna(0)
    
    # 5. Is market order (1 if MARKET, 0 if LIMIT)
    df['is_market_order'] = (df['order_type'] == 'MARKET').astype(int)
    
    return df

def detect_anomalies(df, contamination=0.05, random_state=42):
    """Detect anomalies using IsolationForest."""
    
    # Select features for the model
    feature_cols = [
        'price_zscore', 
        'volume_zscore', 
        'price_change_pct', 
        'time_gap_seconds', 
        'is_market_order'
    ]
    
    X = df[feature_cols].fillna(0)
    
    # Train IsolationForest
    model = IsolationForest(
        contamination=contamination,
        random_state=random_state,
        n_estimators=100
    )
    
    # Predict: -1 for anomalies, 1 for normal
    predictions = model.fit_predict(X)
    anomaly_scores = model.score_samples(X)
    
    # Add results to dataframe
    df['is_anomaly'] = (predictions == -1).astype(int)
    df['anomaly_score'] = anomaly_scores
    
    return df, model

def analyze_anomalies(df):
    """Generate summary statistics."""
    total_trades = len(df)
    anomalies_detected = df['is_anomaly'].sum()
    anomaly_rate = (anomalies_detected / total_trades) * 100
    
    # Top 5 most anomalous trades
    top_5_anomalies = df.nsmallest(5, 'anomaly_score')[
        ['timestamp', 'price', 'quantity', 'order_type', 'side', 'user_id', 
         'price_zscore', 'volume_zscore', 'anomaly_score', 'is_anomaly']
    ]
    
    return {
        'total_trades': total_trades,
        'anomalies_detected': int(anomalies_detected),
        'anomaly_rate_pct': round(anomaly_rate, 2),
        'top_5_anomalies': top_5_anomalies.to_dict('records')
    }

def main():
    print("\n" + "="*60)
    print("ANOMALY DETECTION ANALYSIS")
    print("="*60)
    
    # Read data
    print("\nReading ml/trades.csv...")
    df = pd.read_csv('ml/trades.csv')
    print(f"✓ Loaded {len(df)} trades")
    
    # Engineer features
    print("\nEngineering features...")
    df = engineer_features(df)
    print("✓ Features engineered:")
    print("  - price_zscore (rolling 50-trade window)")
    print("  - volume_zscore (rolling 50-trade window)")
    print("  - price_change_pct")
    print("  - time_gap_seconds")
    print("  - is_market_order")
    
    # Detect anomalies
    print("\nTraining IsolationForest...")
    df, model = detect_anomalies(df, contamination=0.05, random_state=42)
    print("✓ Model trained (contamination=0.05)")
    
    # Analyze
    print("\nAnalyzing anomalies...")
    summary = analyze_anomalies(df)
    
    # Print summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total trades analyzed:      {summary['total_trades']}")
    print(f"Anomalies detected:         {summary['anomalies_detected']}")
    print(f"Anomaly rate:               {summary['anomaly_rate_pct']}%")
    
    print(f"\nTop 5 Most Anomalous Trades:")
    print("-" * 60)
    for i, trade in enumerate(summary['top_5_anomalies'], 1):
        print(f"\n{i}. Anomaly Score: {trade['anomaly_score']:.4f}")
        print(f"   Timestamp: {trade['timestamp']}")
        print(f"   Price: {trade['price']:.2f} | Quantity: {trade['quantity']:.2f}")
        print(f"   Side: {trade['side']} | Type: {trade['order_type']}")
        print(f"   User ID: {trade['user_id']}")
        print(f"   Price Z-Score: {trade['price_zscore']:.2f} | Volume Z-Score: {trade['volume_zscore']:.2f}")
    
    # Save results to JSON
    print("\n" + "="*60)
    print(f"Saving results to ml/anomalies.json...")
    
    # Prepare data for JSON serialization
    results = {
        'analysis_timestamp': datetime.now().isoformat(),
        'summary': summary,
        'all_trades': df.to_dict('records'),
        'model_params': {
            'algorithm': 'IsolationForest',
            'contamination': 0.05,
            'random_state': 42,
            'n_estimators': 100,
            'features_used': [
                'price_zscore', 'volume_zscore', 'price_change_pct',
                'time_gap_seconds', 'is_market_order'
            ]
        }
    }
    
    with open('ml/anomalies.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print("✓ Results saved to ml/anomalies.json")
    print("="*60 + "\n")

if __name__ == '__main__':
    main()
