import { useEffect, useRef, useState, useCallback } from 'react';
import * as mediasoupClient from 'mediasoup-client';
import { getSocket } from '../services/socket';
import { useMediaStore } from '../stores/mediaStore';
import { SOCKET_EVENTS } from '../utils/constants';

export const useMediasoup = (sessionId: string) => {
  const socket = getSocket();
  const {
    micOn,
    cameraOn,
    screenShareOn,
    selectedAudioInput,
    selectedVideoInput,
    setLocalAudioTrack,
    setLocalVideoTrack,
    setLocalScreenTrack,
    addRemoteTrack,
    removeRemoteTracks,
    clearMedia
  } = useMediaStore();

  const deviceRef = useRef<mediasoupClient.Device | null>(null);
  const sendTransportRef = useRef<mediasoupClient.types.Transport | null>(null);
  const recvTransportRef = useRef<mediasoupClient.types.Transport | null>(null);
  const producersRef = useRef<Map<string, mediasoupClient.types.Producer>>(new Map());
  const consumersRef = useRef<Map<string, mediasoupClient.types.Consumer>>(new Map());

  const [isReady, setIsReady] = useState(false);

  const initMediasoup = useCallback(async () => {
    try {
      const routerRtpCapabilities = await new Promise<any>((resolve) => {
        socket.emit(SOCKET_EVENTS.GET_ROUTER_RTP_CAPABILITIES, { sessionId }, resolve);
      });

      const device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities });
      deviceRef.current = device;

      // Create Send Transport
      const sendTransportInfo = await new Promise<any>((resolve) => {
        socket.emit(SOCKET_EVENTS.CREATE_WEB_RTC_TRANSPORT, { sessionId, forceTcp: false, producing: true, consuming: false }, resolve);
      });

      const sendTransport = device.createSendTransport(sendTransportInfo);
      
      sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await new Promise<void>((resolve, reject) => {
            socket.emit(SOCKET_EVENTS.CONNECT_TRANSPORT, { sessionId, transportId: sendTransport.id, dtlsParameters }, (res: any) => {
              if (res?.error) reject(res.error);
              else resolve();
            });
          });
          callback();
        } catch (error: any) {
          errback(error);
        }
      });

      sendTransport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
        try {
          const { id } = await new Promise<any>((resolve, reject) => {
            socket.emit(SOCKET_EVENTS.PRODUCE, { sessionId, transportId: sendTransport.id, kind, rtpParameters, appData }, (res: any) => {
              if (res?.error) reject(res.error);
              else resolve(res);
            });
          });
          callback({ id });
        } catch (error: any) {
          errback(error);
        }
      });

      sendTransportRef.current = sendTransport;

      // Create Recv Transport
      const recvTransportInfo = await new Promise<any>((resolve) => {
        socket.emit(SOCKET_EVENTS.CREATE_WEB_RTC_TRANSPORT, { sessionId, forceTcp: false, producing: false, consuming: true }, resolve);
      });

      const recvTransport = device.createRecvTransport(recvTransportInfo);

      recvTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await new Promise<void>((resolve, reject) => {
            socket.emit(SOCKET_EVENTS.CONNECT_TRANSPORT, { sessionId, transportId: recvTransport.id, dtlsParameters }, (res: any) => {
              if (res?.error) reject(res.error);
              else resolve();
            });
          });
          callback();
        } catch (error: any) {
          errback(error);
        }
      });

      recvTransportRef.current = recvTransport;
      setIsReady(true);

    } catch (error) {
      console.error('Mediasoup init error:', error);
    }
  }, [sessionId, socket]);

  const produceMedia = useCallback(async (track: MediaStreamTrack, type: 'audio' | 'video' | 'screen') => {
    if (!sendTransportRef.current || !deviceRef.current) return;
    try {
      const producer = await sendTransportRef.current.produce({ track, appData: { type } });
      producersRef.current.set(type, producer);
      
      if (type === 'audio') setLocalAudioTrack(track);
      if (type === 'video') setLocalVideoTrack(track);
      if (type === 'screen') setLocalScreenTrack(track);

      producer.on('trackended', () => {
        producer.close();
        producersRef.current.delete(type);
      });
    } catch (error) {
      console.error(`Error producing ${type}:`, error);
    }
  }, [setLocalAudioTrack, setLocalScreenTrack, setLocalVideoTrack]);

  const consumeMedia = useCallback(async (producerId: string, participantId: string, type: string) => {
    if (!recvTransportRef.current || !deviceRef.current) return;
    try {
      const { id, kind, rtpParameters } = await new Promise<any>((resolve, reject) => {
        socket.emit(SOCKET_EVENTS.CONSUME, { sessionId, transportId: recvTransportRef.current?.id, producerId, rtpCapabilities: deviceRef.current?.rtpCapabilities }, (res: any) => {
          if (res?.error) reject(res.error);
          else resolve(res);
        });
      });

      const consumer = await recvTransportRef.current.consume({ id, producerId, kind, rtpParameters });
      consumersRef.current.set(id, consumer);
      
      const stream = new MediaStream([consumer.track]);
      addRemoteTrack(participantId, stream.getTracks()[0]);

      await new Promise<void>((resolve) => socket.emit(SOCKET_EVENTS.RESUME, { sessionId, consumerId: id }, resolve));

    } catch (error) {
      console.error('Error consuming:', error);
    }
  }, [sessionId, socket, addRemoteTrack]);

  useEffect(() => {
    if (sessionId) {
      initMediasoup();
    }
    return () => {
      // Cleanup
      producersRef.current.forEach(p => p.close());
      consumersRef.current.forEach(c => c.close());
      sendTransportRef.current?.close();
      recvTransportRef.current?.close();
      clearMedia();
    };
  }, [sessionId, initMediasoup, clearMedia]);

  useEffect(() => {
    socket.on(SOCKET_EVENTS.NEW_PRODUCER, ({ producerId, participantId, type }) => {
      if (isReady) {
        consumeMedia(producerId, participantId, type);
      }
    });
    
    socket.on(SOCKET_EVENTS.PARTICIPANT_LEFT, ({ participantId }) => {
      removeRemoteTracks(participantId);
    });

    return () => {
      socket.off(SOCKET_EVENTS.NEW_PRODUCER);
      socket.off(SOCKET_EVENTS.PARTICIPANT_LEFT);
    };
  }, [socket, isReady, consumeMedia, removeRemoteTracks]);

  // Handle device toggles
  useEffect(() => {
    const handleDevices = async () => {
      if (!isReady) return;

      if (micOn && !producersRef.current.has('audio')) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: selectedAudioInput ? { deviceId: selectedAudioInput } : true });
          produceMedia(stream.getAudioTracks()[0], 'audio');
        } catch (e) { console.error(e); }
      } else if (!micOn && producersRef.current.has('audio')) {
        const producer = producersRef.current.get('audio');
        producer?.close();
        producersRef.current.delete('audio');
        setLocalAudioTrack(null);
      }

      if (cameraOn && !producersRef.current.has('video')) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: selectedVideoInput ? { deviceId: selectedVideoInput } : true });
          produceMedia(stream.getVideoTracks()[0], 'video');
        } catch (e) { console.error(e); }
      } else if (!cameraOn && producersRef.current.has('video')) {
        const producer = producersRef.current.get('video');
        producer?.close();
        producersRef.current.delete('video');
        setLocalVideoTrack(null);
      }

      if (screenShareOn && !producersRef.current.has('screen')) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          produceMedia(stream.getVideoTracks()[0], 'screen');
        } catch (e) { console.error(e); }
      } else if (!screenShareOn && producersRef.current.has('screen')) {
        const producer = producersRef.current.get('screen');
        producer?.close();
        producersRef.current.delete('screen');
        setLocalScreenTrack(null);
      }
    };

    handleDevices();
  }, [isReady, micOn, cameraOn, screenShareOn, selectedAudioInput, selectedVideoInput, produceMedia, setLocalAudioTrack, setLocalVideoTrack, setLocalScreenTrack]);

  return { isReady };
};
