import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessageService } from './message.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './ws-jwt.guard';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*' },
})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server!: Server;
  private readonly logger = new Logger('MessageGateway');

  constructor(private readonly messageService: MessageService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Diconnect: ${client.id}`);
  }
  /**
   * Client joins a chat room
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { chatRoomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.chatRoomId) throw new WsException('Room ID required');

    await client.join(data.chatRoomId);
    this.logger.debug(
      `User ${client.data.user?.id} joined room: ${data.chatRoomId}`,
    );

    return { event: 'joinedRoom', room: data.chatRoomId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { chatRoomId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = client.data.user;

      const hasAccess = await this.messageService.validateRoomAccess(
        data.chatRoomId,
        user.id,
      );

      if (!hasAccess) throw new WsException('Unauthorized room access');

      // safe to database via service
      const message = await this.messageService.sendMessage({
        chatRoomId: data.chatRoomId,
        senderId: user.id,
        content: data.content,
      });

      // Broadcast to everyone in the room (including sender)
      this.server.to(data.chatRoomId).emit('messageReceived', message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Message error: ${message}`);
      throw new WsException(message);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { chatRoomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Notify everyone in the room EXCEPT the person typing
    client.to(data.chatRoomId).emit('userTyping', {
      userId: client.data.user.id,
      isTyping: true,
    });
  }
}
