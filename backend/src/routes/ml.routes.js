const router = require('express').Router();
const fs = require('fs');
const path = require('path');

// Path to anomalies.json from project root
// __dirname = C:\...\backend\src\routes
// Need to go up to backend, then to project root
const ANOMALIES_FILE = path.join(__dirname, '../../../ml/anomalies.json');

/**
 * GET /ml/anomalies
 * Returns full anomalies data including all trades and analysis results
 */
router.get('/anomalies', (req, res) => {
  try {
    console.log('[ML API] Trying to read:', ANOMALIES_FILE);
    console.log('[ML API] File exists:', fs.existsSync(ANOMALIES_FILE));
    
    if (!fs.existsSync(ANOMALIES_FILE)) {
      console.error('[ML API] File not found at:', ANOMALIES_FILE);
      return res.status(404).json({ 
        error: 'Anomalies data not found. Run ml/anomaly_detection.py first.',
        path: ANOMALIES_FILE
      });
    }

    const data = fs.readFileSync(ANOMALIES_FILE, 'utf8');
    const anomalies = JSON.parse(data);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: anomalies
    });
  } catch (err) {
    console.error('[ML API] Error reading anomalies file:', err);
    res.status(500).json({ 
      error: 'Failed to read anomalies data',
      message: err.message 
    });
  }
});

/**
 * GET /ml/anomaly-stats
 * Returns summarized anomaly statistics
 */
router.get('/anomaly-stats', (req, res) => {
  try {
    if (!fs.existsSync(ANOMALIES_FILE)) {
      return res.status(404).json({ 
        error: 'Anomalies data not found. Run ml/anomaly_detection.py first.' 
      });
    }

    const data = fs.readFileSync(ANOMALIES_FILE, 'utf8');
    const anomalies = JSON.parse(data);

    // Extract summary
    const summary = anomalies.summary;

    // Get top 3 most anomalous trades (already available in summary)
    const top3Anomalies = summary.top_5_anomalies.slice(0, 3).map(trade => ({
      timestamp: trade.timestamp,
      price: trade.price,
      quantity: trade.quantity,
      anomaly_score: trade.anomaly_score,
      side: trade.side,
      order_type: trade.order_type,
      user_id: trade.user_id
    }));

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        total_trades: summary.total_trades,
        anomaly_count: summary.anomalies_detected,
        anomaly_rate: summary.anomaly_rate_pct,
        most_anomalous: top3Anomalies
      }
    });
  } catch (err) {
    console.error('Error processing anomalies:', err);
    res.status(500).json({ 
      error: 'Failed to process anomaly statistics',
      message: err.message 
    });
  }
});

module.exports = router;
