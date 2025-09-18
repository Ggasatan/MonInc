import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    ConnectedSocket,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatMessageDto, ChatUserDto } from './dto/chat-message.dto';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:8080', 'http://localhost:5173','http://localhost:3001', 'http://localhost:3000'],
        credentials: true,
    },
})
export class ChatGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('ChatGateway');

    constructor(private readonly chatService: ChatService) {
        console.log('채팅 웹소켓 서버 초기화 완료');
    }

    afterInit(server: Server) {
        this.logger.log('채팅 웹소켓 서버 초기화 완료');
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`클라이언트 연결: ${client.id}`);
        const userId = this.getUserIdFromSocket(client);
        const userRoles = this.getUserRolesFromSocket(client);

        if (userId) {
            client.join(String(userId));
            this.logger.log(`클라이언트 ${client.id}가 사용자 ${userId} 방에 참가했습니다.`);
        }

        // 사용자가 ADMIN 역할을 가지고 있으면 admin 방에도 참가
        if (userRoles && userRoles.includes('ROLE_ADMIN')) {
            client.join('admin');
            this.logger.log(`관리자 ${client.id}가 admin 방에 참가했습니다.`);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`클라이언트 연결 끊김: ${client.id}`);

        // 온라인 사용자 목록에서 제거
        const disconnectedUser = this.chatService.removeOnlineUserBySocketId(client.id);
        if (disconnectedUser) {
            this.logger.log(`사용자 ${disconnectedUser} 연결 해제`);
            // [수정] 개별 이벤트 대신, 최신 온라인 목록을 관리자에게 방송
            this.broadcastOnlineUsersToAdmin();
        }
        // if (disconnectedUser) {
        //     this.logger.log(`사용자 ${disconnectedUser} 연결 해제`);

        //     // 관리자에게 사용자 연결 해제 알림
        //     this.server.to('admin').emit('userDisconnected', {
        //         sender: disconnectedUser,
        //         content: `${disconnectedUser} 님이 연결을 종료했습니다.`,
        //         type: 'LEAVE',
        //         timestamp: new Date().toISOString()
        //     });
        // }
    }



    @SubscribeMessage('chat.addUser')
    async handleAddUser(@MessageBody() data: ChatUserDto) {
        const joinMessage: ChatMessageDto = {
            sender: data.sender,
            content: `${data.sender} 님이 문의를 시작했습니다.`,
            type: 'JOIN',
            recipient: null,
        };

        // 관리자 토픽에만 입장 알림 전송
        this.server.to('admin').emit('chat.message', joinMessage);

        return joinMessage;
    }

    // @SubscribeMessage('joinAsAdmin')
    // async handleJoinAsAdmin(@MessageBody() data: ChatUserDto, @ConnectedSocket() client: Socket) {
    //     // 관리자 방에 참가
    //     client.join('admin');
    //     this.logger.log(`관리자 ${data.sender}가 admin 방에 참가했습니다.`);

    //     // 현재 접속 중인 사용자 목록을 관리자에게 전송
    //     const onlineUsers = this.chatService.getOnlineUsers();
    //     client.emit('onlineUsers', onlineUsers);
    //     this.logger.log(`관리자(${client.id})에게 현재 온라인 유저 목록 전송: ${onlineUsers.join(', ')}`);
    //     return { status: 'joined', role: 'admin' };
    // }

    @SubscribeMessage('joinAsAdmin')
    handleJoinAsAdmin(@ConnectedSocket() client: Socket) {
        // [수정] 관리자가 접속하면, 현재 온라인 유저 목록을 즉시 보내줌
        const onlineUsers = this.chatService.getOnlineUsers();
        client.emit('updateOnlineUsers', onlineUsers);
        this.logger.log(`관리자(${client.id})에게 현재 온라인 유저 목록 전송: ${onlineUsers.join(', ')}`);
    }

    @SubscribeMessage('joinChat')
    async handleJoinChat(@MessageBody() data: ChatUserDto, @ConnectedSocket() client: Socket) {
        client.join(data.sender);
        this.logger.log(`사용자 ${data.sender}가 채팅에 참가했습니다.`);

        this.chatService.addOnlineUser(data.sender, client.id);

        const history = await this.chatService.getChatHistory(data.sender);
        if (history && history.length > 0) {
            client.emit('chatHistory', { userId: data.sender, history });
            this.logger.log(`사용자 ${data.sender}에게 기존 대화기록 ${history.length}건을 전송했습니다.`);
        }

        // [수정] 새로운 유저가 참여했으니, 최신 온라인 목록을 관리자에게 방송
        this.broadcastOnlineUsersToAdmin();

        return { status: 'joined', user: data.sender };
    }

    // @SubscribeMessage('joinChat')
    // async handleJoinChat(@MessageBody() data: ChatUserDto, @ConnectedSocket() client: Socket) {
    //     this.logger.log(`[GATEWAY]  RECEIVED 'joinChat' EVENT! User: ${data.sender}`); // 🚨 가장 중요한 로그!
        
    //     // 사용자 방에 참가
    //     client.join(data.sender);
    //     this.logger.log(`사용자 ${data.sender}가 채팅에 참가했습니다.`);

    //     // 사용자 접속 정보 저장
    //     this.chatService.addOnlineUser(data.sender, client.id);
        
    //     const history = await this.chatService.getChatHistory(data.sender);
    //     if (history && history.length > 0) {
    //         // 'chatHistory' 이벤트를 사용해서 클라이언트에게 전송
    //         client.emit('chatHistory', { userId: data.sender, history });
    //         this.logger.log(`사용자 ${data.sender}에게 기존 대화기록 ${history.length}건을 전송했습니다.`);
    //     }
    //     // 관리자에게 사용자 접속 알림
    //     this.server.to('admin').emit('userJoined', {
    //         sender: data.sender,
    //         content: `${data.sender} 님이 문의를 시작했습니다.`,
    //         type: 'JOIN',
    //         timestamp: new Date().toISOString()
    //     });

    //     return { status: 'joined', user: data.sender };
    // }

    private broadcastOnlineUsersToAdmin() {
        const onlineUsers = this.chatService.getOnlineUsers();
        this.server.to('admin').emit('updateOnlineUsers', onlineUsers);
        this.logger.log(`관리자에게 온라인 유저 목록 방송: ${onlineUsers.join(', ')}`);
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(@MessageBody() data: ChatMessageDto, @ConnectedSocket() client: Socket) {
        // 메시지 저장 (DB 포함)
        const savedMessage = await this.chatService.saveMessage(data);

        // Case 1: 관리자가 특정 사용자에게 답장
        if (data.recipient && data.recipient !== '') {
            // 특정 사용자에게 전송
            this.server.to(data.recipient).emit('adminReply', savedMessage);
            // 관리자 토픽에도 전송
            this.server.to('admin').emit('adminReply', savedMessage);
        }
        // Case 2: 일반 사용자 메시지
        else {
            // 관리자 토픽에 전송
            this.server.to('admin').emit('userMessage', savedMessage);
            // 사용자 개인 토픽에도 전송 (자신의 메시지 확인용)
            this.server.to(data.sender).emit('chatMessage', savedMessage);
        }

        return savedMessage;
    }

    @SubscribeMessage('getHistory')
    async handleGetHistory(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
        console.log('🔍 채팅 내역 요청 수신:', data);
        const history = await this.chatService.getChatHistory(data.userId);
        console.log('📋 채팅 내역 조회 완료:', { userId: data.userId, historyCount: history.length });
        client.emit('chatHistory', { userId: data.userId, history });
        console.log('📤 채팅 내역 전송 완료');
    }

    @SubscribeMessage('getOnlineUsers')
    async handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
        console.log('👥 온라인 사용자 목록 요청 수신');
        const onlineUsers = this.chatService.getOnlineUsers();
        console.log('📋 온라인 사용자 목록:', onlineUsers);
        client.emit('onlineUsers', onlineUsers);
        console.log('📤 온라인 사용자 목록 전송 완료');
    }

    @SubscribeMessage('getAllChatUsers')
    async handleGetAllChatUsers(@ConnectedSocket() client: Socket) {
        console.log('👥 모든 채팅 사용자 목록 요청 수신');
        const allUsers = await this.chatService.getAllChatUsers();
        console.log('📋 모든 채팅 사용자 목록:', allUsers);
        client.emit('allChatUsers', allUsers);
        console.log('📤 모든 채팅 사용자 목록 전송 완료');
    }

    @SubscribeMessage('getUserLastMessage')
    async handleGetUserLastMessage(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
        console.log('📨 사용자 최근 메시지 요청 수신:', data);
        const lastMessage = await this.chatService.getUserLastMessage(data.userId);
        console.log('📋 사용자 최근 메시지:', lastMessage);
        client.emit('userLastMessage', { userId: data.userId, lastMessage });
        console.log('📤 사용자 최근 메시지 전송 완료');
    }

    private getUserIdFromSocket(client: Socket): number | null {
        return client.handshake.auth?.userId || null;
    }

    private getUserRolesFromSocket(client: Socket): string[] | null {
        return client.handshake.auth?.roles || null;
    }
} 