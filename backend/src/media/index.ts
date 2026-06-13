import { Room } from './room';
import { logger } from '../utils/logger';

const rooms: Map<string, Room> = new Map();

export async function getOrCreateRoom(sessionId: string): Promise<Room> {
  let room = rooms.get(sessionId);
  if (!room) {
    room = new Room(sessionId);
    await room.init();
    rooms.set(sessionId, room);
    logger.info(`Created new mediasoup Room for session ${sessionId}`);
  }
  return room;
}

export function getRoom(sessionId: string): Room | undefined {
  return rooms.get(sessionId);
}

export function removeRoom(sessionId: string): void {
  const room = rooms.get(sessionId);
  if (room) {
    room.close();
    rooms.delete(sessionId);
    logger.info(`Removed mediasoup Room for session ${sessionId}`);
  }
}

export { Room };
