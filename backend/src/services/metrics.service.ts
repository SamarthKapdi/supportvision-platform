import client from 'prom-client';

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'sv_' });

export const metrics = {
  activeSessions: new client.Gauge({
    name: 'sv_active_sessions',
    help: 'Number of active sessions',
  }),
  connectedUsers: new client.Gauge({
    name: 'sv_connected_users',
    help: 'Number of connected users',
  }),
  failedJoins: new client.Counter({
    name: 'sv_failed_joins_total',
    help: 'Total number of failed joins',
  }),
  recordingsTotal: new client.Counter({
    name: 'sv_recordings_total',
    help: 'Total number of recordings',
  }),
  errorsTotal: new client.Counter({
    name: 'sv_errors_total',
    help: 'Total number of errors',
  }),
  httpRequestDuration: new client.Histogram({
    name: 'sv_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    buckets: [0.1, 0.5, 1, 2, 5],
  }),
  sessionDuration: new client.Histogram({
    name: 'sv_session_duration_seconds',
    help: 'Duration of sessions in seconds',
    buckets: [60, 300, 600, 1800, 3600],
  }),
};

export const metricsService = {
  getMetrics: async () => {
    return await client.register.metrics();
  },
  incrementActiveSessions: () => metrics.activeSessions.inc(),
  decrementActiveSessions: () => metrics.activeSessions.dec(),
  incrementConnectedUsers: () => metrics.connectedUsers.inc(),
  decrementConnectedUsers: () => metrics.connectedUsers.dec(),
  incrementFailedJoins: () => metrics.failedJoins.inc(),
  incrementRecordingsTotal: () => metrics.recordingsTotal.inc(),
  incrementErrorsTotal: () => metrics.errorsTotal.inc(),
};
