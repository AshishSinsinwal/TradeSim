import json
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime

def load_anomalies(filepath):
    """Load anomalies data from JSON."""
    with open(filepath, 'r') as f:
        data = json.load(f)
    return data

def create_visualization(data, output_path):
    """Create and save anomaly detection visualization."""
    
    # Extract trades data
    trades = data['all_trades']
    summary = data['summary']
    
    # Convert to DataFrame
    df = pd.DataFrame(trades)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    # Separate normal and anomalous trades
    normal_trades = df[df['is_anomaly'] == 0]
    anomaly_trades = df[df['is_anomaly'] == 1]
    
    # Create figure with 2 subplots
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))
    fig.suptitle('TradeSim — Anomaly Detection Report', fontsize=16, fontweight='bold', y=0.995)
    
    # ===== PLOT 1: PRICE OVER TIME =====
    ax1.plot(df['timestamp'], df['price'], 'b-', linewidth=0.8, alpha=0.6, label='Price Trend')
    
    # Normal trades as blue dots
    ax1.scatter(normal_trades['timestamp'], normal_trades['price'], 
                color='blue', s=20, alpha=0.5, label='Normal Trades', zorder=3)
    
    # Anomalous trades as red X markers
    ax1.scatter(anomaly_trades['timestamp'], anomaly_trades['price'], 
                color='red', marker='X', s=80, alpha=0.9, label='Anomalous Trades', 
                edgecolors='darkred', linewidth=1.5, zorder=4)
    
    ax1.set_xlabel('Time', fontsize=11)
    ax1.set_ylabel('Price (₹)', fontsize=11)
    ax1.set_title('Order Flow Anomaly Detection — TradeSim', fontsize=13, fontweight='bold', pad=10)
    ax1.legend(loc='upper left', fontsize=10)
    ax1.grid(True, alpha=0.3)
    ax1.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
    ax1.xaxis.set_major_locator(mdates.HourLocator(interval=12))
    plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')
    
    # ===== PLOT 2: VOLUME OVER TIME =====
    colors = ['red' if anomaly == 1 else 'grey' for anomaly in df['is_anomaly']]
    
    ax2.bar(df['timestamp'], df['quantity'], color=colors, width=0.001, alpha=0.7, edgecolor='none')
    
    ax2.set_xlabel('Time', fontsize=11)
    ax2.set_ylabel('Volume (BTC)', fontsize=11)
    ax2.set_title('Volume Anomalies', fontsize=13, fontweight='bold', pad=10)
    ax2.grid(True, alpha=0.3, axis='y')
    ax2.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
    ax2.xaxis.set_major_locator(mdates.HourLocator(interval=12))
    plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')
    
    # Add custom legend for volume chart
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='grey', alpha=0.7, label='Normal'),
        Patch(facecolor='red', alpha=0.7, label='Anomalous')
    ]
    ax2.legend(handles=legend_elements, loc='upper left', fontsize=10)
    
    # ===== ADD SUMMARY TEXT BOX =====
    summary_text = (
        f"Total Trades: {summary['total_trades']} | "
        f"Anomalies Found: {summary['anomalies_detected']} | "
        f"Anomaly Rate: {summary['anomaly_rate_pct']}%"
    )
    
    fig.text(0.5, 0.02, summary_text, 
             ha='center', fontsize=11, 
             bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5),
             family='monospace')
    
    # Adjust layout
    plt.tight_layout(rect=[0, 0.04, 1, 0.99])
    
    # Save figure
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"✓ Visualization saved to {output_path}")
    
    # Display info
    print(f"  - Plot size: {fig.get_figwidth():.1f}x{fig.get_figheight():.1f} inches @ 300 DPI")
    print(f"  - Normal trades plotted: {len(normal_trades)}")
    print(f"  - Anomalies highlighted: {len(anomaly_trades)}")

def main():
    print("\n" + "="*60)
    print("GENERATING ANOMALY VISUALIZATION")
    print("="*60 + "\n")
    
    # Load data
    print("Loading ml/anomalies.json...")
    data = load_anomalies('ml/anomalies.json')
    print(f"✓ Loaded data")
    
    # Create visualization
    print("\nGenerating plots...")
    create_visualization(data, 'ml/plots/anomaly_chart.png')
    
    print("\n" + "="*60)
    print("Visualization complete!")
    print("="*60 + "\n")

if __name__ == '__main__':
    main()
