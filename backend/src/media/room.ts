import * as mediasoup from 'mediasoup';
import { mediaCodecs, webRtcTransportOptions } from '../config/mediasoup';
import { getNextWorker } from './worker';
import { logger } from '../utils/logger';

interface Peer {
  id: string;
  name: string;
  role: string;
  sendTransport?: mediasoup.types.WebRtcTransport;
  recvTransport?: mediasoup.types.WebRtcTransport;
  producers: Map<string, mediasoup.types.Producer>;
  consumers: Map<string, mediasoup.types.Consumer>;
}

export class Room {
  public id: string;
  public router: mediasoup.types.Router | null = null;
  public peers: Map<string, Peer> = new Map();
  private closed = false;

  constructor(id: string) {
    this.id = id;
  }

  async init(): Promise<void> {
    const worker = getNextWorker();
    this.router = await worker.createRouter({ mediaCodecs });
    logger.info(`Room ${this.id} created with router ${this.router.id}`);
  }

  addPeer(peerId: string, name: string, role: string): void {
    if (this.peers.has(peerId)) {
      logger.warn(`Peer ${peerId} already in room ${this.id}`);
      return;
    }
    this.peers.set(peerId, {
      id: peerId,
      name,
      role,
      producers: new Map(),
      consumers: new Map(),
    });
    logger.info(`Peer ${peerId} (${name}) added to room ${this.id}`);
  }

  removePeer(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    // Close all transports (this also closes producers and consumers)
    peer.sendTransport?.close();
    peer.recvTransport?.close();
    
    this.peers.delete(peerId);
    logger.info(`Peer ${peerId} removed from room ${this.id}`);
  }

  getRtpCapabilities(): mediasoup.types.RtpCapabilities | undefined {
    return this.router?.rtpCapabilities;
  }

  async createWebRtcTransport(peerId: string, direction: 'send' | 'recv'): Promise<{
    id: string;
    iceParameters: mediasoup.types.IceParameters;
    iceCandidates: mediasoup.types.IceCandidate[];
    dtlsParameters: mediasoup.types.DtlsParameters;
    sctpParameters?: mediasoup.types.SctpParameters;
  }> {
    if (!this.router) throw new Error('Router not initialized');
    const peer = this.peers.get(peerId);
    if (!peer) throw new Error('Peer not found');

    const transport = await this.router.createWebRtcTransport(webRtcTransportOptions);

    transport.on('dtlsstatechange', (dtlsState) => {
      if (dtlsState === 'closed') {
        transport.close();
      }
    });

    if (direction === 'send') {
      peer.sendTransport = transport;
    } else {
      peer.recvTransport = transport;
    }

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
      sctpParameters: transport.sctpParameters,
    };
  }

  async connectTransport(peerId: string, direction: 'send' | 'recv', dtlsParameters: mediasoup.types.DtlsParameters): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) throw new Error('Peer not found');

    const transport = direction === 'send' ? peer.sendTransport : peer.recvTransport;
    if (!transport) throw new Error('Transport not found');

    await transport.connect({ dtlsParameters });
  }

  async produce(peerId: string, kind: mediasoup.types.MediaKind, rtpParameters: mediasoup.types.RtpParameters, appData?: Record<string, unknown>): Promise<string> {
    const peer = this.peers.get(peerId);
    if (!peer) throw new Error('Peer not found');
    if (!peer.sendTransport) throw new Error('Send transport not found');

    const producer = await peer.sendTransport.produce({ kind, rtpParameters, appData });

    producer.on('transportclose', () => {
      producer.close();
      peer.producers.delete(producer.id);
    });

    peer.producers.set(producer.id, producer);
    logger.info(`Peer ${peerId} producing ${kind} (${producer.id})`);
    return producer.id;
  }

  async consume(peerId: string, producerId: string, rtpCapabilities: mediasoup.types.RtpCapabilities): Promise<{
    id: string;
    producerId: string;
    kind: mediasoup.types.MediaKind;
    rtpParameters: mediasoup.types.RtpParameters;
    appData: Record<string, unknown>;
  } | null> {
    if (!this.router) throw new Error('Router not initialized');
    const peer = this.peers.get(peerId);
    if (!peer) throw new Error('Peer not found');
    if (!peer.recvTransport) throw new Error('Recv transport not found');

    if (!this.router.canConsume({ producerId, rtpCapabilities })) {
      logger.warn(`Peer ${peerId} cannot consume producer ${producerId}`);
      return null;
    }

    const consumer = await peer.recvTransport.consume({
      producerId,
      rtpCapabilities,
      paused: true, // Start paused, client will resume
    });

    consumer.on('transportclose', () => {
      consumer.close();
      peer.consumers.delete(consumer.id);
    });

    consumer.on('producerclose', () => {
      consumer.close();
      peer.consumers.delete(consumer.id);
    });

    peer.consumers.set(consumer.id, consumer);

    return {
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      appData: consumer.appData as Record<string, unknown>,
    };
  }

  async resumeConsumer(peerId: string, consumerId: string): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) throw new Error('Peer not found');
    const consumer = peer.consumers.get(consumerId);
    if (!consumer) throw new Error('Consumer not found');
    await consumer.resume();
  }

  closeProducer(peerId: string, producerId: string): void {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    const producer = peer.producers.get(producerId);
    if (!producer) return;
    producer.close();
    peer.producers.delete(producerId);
  }

  getOtherProducers(peerId: string): Array<{ peerId: string; producerId: string; kind: string; appData: Record<string, unknown> }> {
    const producers: Array<{ peerId: string; producerId: string; kind: string; appData: Record<string, unknown> }> = [];
    for (const [id, peer] of this.peers) {
      if (id === peerId) continue;
      for (const [prodId, producer] of peer.producers) {
        producers.push({
          peerId: id,
          producerId: prodId,
          kind: producer.kind,
          appData: producer.appData as Record<string, unknown>,
        });
      }
    }
    return producers;
  }

  getPeerCount(): number {
    return this.peers.size;
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    for (const [, peer] of this.peers) {
      peer.sendTransport?.close();
      peer.recvTransport?.close();
    }
    this.peers.clear();
    this.router?.close();
    logger.info(`Room ${this.id} closed`);
  }
}
