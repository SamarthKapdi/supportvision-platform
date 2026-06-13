import { env } from './env';
import os from 'os';
import { RtpCodecCapability, TransportListenIp } from 'mediasoup/node/lib/types';

export const mediasoupConfig = {
  numWorkers: Object.keys(os.cpus()).length,
  worker: {
    rtcMinPort: env.mediasoup.minPort,
    rtcMaxPort: env.mediasoup.maxPort,
    logLevel: 'warn' as const,
    logTags: [
      'info',
      'ice',
      'dtls',
      'rtp',
      'srtp',
      'rtcp',
    ] as const,
  },
  router: {
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
          'x-google-start-bitrate': 1000,
        },
      },
    ] as RtpCodecCapability[],
  },
  webRtcTransport: {
    listenIps: [
      {
        ip: env.mediasoup.listenIp,
        announcedIp: env.mediasoup.announcedIp,
      },
    ] as TransportListenIp[],
    initialAvailableOutgoingBitrate: 1000000,
    maxSctpMessageSize: 262144,
  },
};
