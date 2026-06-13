import React, { useMemo } from 'react';
import { VideoTile } from './VideoTile';
import { useSessionStore } from '../../stores/sessionStore';
import { useMediaStore } from '../../stores/mediaStore';

export const VideoGrid: React.FC = () => {
  const { participants } = useSessionStore();
  const { localVideoTrack, remoteTracks, localScreenTrack } = useMediaStore();

  const allVideoTiles = useMemo(() => {
    const tiles = [];
    
    // Local screen share
    if (localScreenTrack) {
      tiles.push({
        id: 'local-screen',
        stream: new MediaStream([localScreenTrack]),
        name: 'You (Screen)',
        isLocal: true,
        isScreenShare: true,
      });
    }

    // Local video
    if (localVideoTrack) {
      tiles.push({
        id: 'local-video',
        stream: new MediaStream([localVideoTrack]),
        name: 'You',
        isLocal: true,
      });
    } else {
      tiles.push({
        id: 'local-video-off',
        stream: null,
        name: 'You',
        isLocal: true,
        cameraOff: true,
      });
    }

    // Remote participants
    participants.forEach((p) => {
      const pTracks = remoteTracks[p.id] || [];
      const videoTrack = pTracks.find(t => t.kind === 'video');
      
      if (videoTrack) {
        tiles.push({
          id: p.id,
          stream: new MediaStream([videoTrack]),
          name: p.name,
          isLocal: false,
        });
      } else {
        tiles.push({
          id: p.id,
          stream: null,
          name: p.name,
          isLocal: false,
          cameraOff: true,
        });
      }
    });

    return tiles;
  }, [participants, localVideoTrack, localScreenTrack, remoteTracks]);

  const gridClass = useMemo(() => {
    const count = allVideoTiles.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3 || count === 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-3 md:grid-cols-4';
  }, [allVideoTiles.length]);

  return (
    <div className={`grid ${gridClass} gap-4 w-full h-full p-4 content-center justify-items-center transition-all duration-500`}>
      {allVideoTiles.map((tile) => (
        <VideoTile
          key={tile.id}
          stream={tile.stream}
          name={tile.name}
          isLocal={tile.isLocal}
          isScreenShare={tile.isScreenShare}
          cameraOff={tile.cameraOff}
          isSpeaking={false} // Would need audio analyzer logic
        />
      ))}
    </div>
  );
};
