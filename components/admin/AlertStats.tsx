/**
 * Alert Statistics Component
 *
 * Displays alert delivery statistics for the last 24 hours
 * Issue #55: Implement Geolocation Alerts
 */

'use client';

interface AlertStatsProps {
  stats: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    skipped: number;
  };
}

export function AlertStats({ stats }: AlertStatsProps) {
  const successRate =
    stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Total Alerts */}
      <div className="bg-background border border-border rounded-xl p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Total Alerts
        </div>
        <div className="text-3xl font-bold text-foreground">{stats.total}</div>
        <div className="text-xs text-muted-foreground mt-1">Last 24 hours</div>
      </div>

      {/* Sent */}
      <div className="bg-background border border-border rounded-xl p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">Sent</div>
        <div className="text-3xl font-bold text-success">{stats.sent}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {successRate}% success rate
        </div>
      </div>

      {/* Pending */}
      <div className="bg-background border border-border rounded-xl p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">Pending</div>
        <div className="text-3xl font-bold text-info">{stats.pending}</div>
        <div className="text-xs text-muted-foreground mt-1">Awaiting delivery</div>
      </div>

      {/* Failed */}
      <div className="bg-background border border-border rounded-xl p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">Failed</div>
        <div className="text-3xl font-bold text-destructive">{stats.failed}</div>
        <div className="text-xs text-muted-foreground mt-1">Delivery errors</div>
      </div>

      {/* Skipped */}
      <div className="bg-background border border-border rounded-xl p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">Skipped</div>
        <div className="text-3xl font-bold text-muted-foreground">{stats.skipped}</div>
        <div className="text-xs text-muted-foreground mt-1">Quiet hours / prefs</div>
      </div>
    </div>
  );
}
