import { Injectable, Logger } from '@nestjs/common';
import { ChatMessageDto } from './dto/chat-message.dto';
import fetch from 'node-fetch';

interface OnlineUser {
    username: string;
    socketId: string;
    joinedAt: Date;
    lastActivity: Date;
}

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    private messages: ChatMessageDto[] = [];
    private onlineUsers: Map<string, OnlineUser> = new Map();
    private readonly INTERNAL_API_SECRET = 'our-super-secret-key-for-internal-communication-12345';
    private readonly INTERNAL_API_HEADER = 'X-Internal-API-Secret';
    
    // ✅ 1. API 기본 URL을 클래스 속성으로 관리
    private readonly backendApiUrl: string;

    constructor() {
        // ✅ 2. 생성자에서 환경 변수를 단 한 번만 읽어옴
        this.backendApiUrl = process.env.BACKEND_API_URL || 'http://host.docker.internal:8080';
        if (!this.backendApiUrl) {
            this.logger.error('!!! 치명적 오류: BACKEND_API_URL 환경 변수가 설정되지 않았습니다.');
            // 실제 프로덕션에서는 여기서 애플리케이션을 중단시킬 수도 있음
        }
    }

    async saveMessage(messageData: ChatMessageDto): Promise<ChatMessageDto> {
        // 1. 타임스탬프를 포함한 완전한 메시지 객체 생성
        const message: ChatMessageDto = {
            ...messageData,
            timestamp: new Date(),
        };

        // 2. (Fallback용) 메모리에 메시지 저장
        this.messages.push(message);

        // 3. (가장 중요!) DB 저장을 위해 saveToDatabase 함수 호출
        try {
            await this.saveToDatabase(message);
        } catch (error) {
            // DB 저장에 실패하더라도, 에러 로그만 남기고 기능은 계속 진행
            this.logger.error('DB 저장 실패:', error);
        }

        // 4. 메시지를 보낸 사용자의 마지막 활동 시간 업데이트
        if (messageData.sender) {
            this.updateUserActivity(messageData.sender);
        }

        // 5. 완성된 메시지 객체를 반환
        return message;
    }

    private async saveToDatabase(message: ChatMessageDto): Promise<void> {
        // ✅ 3. 안전하게 클래스 속성 사용
        if (!this.backendApiUrl) return; // 환경 변수 없으면 DB 저장 건너뛰기

        const apiUrl = `${this.backendApiUrl}/api/chat/messages`;
        const payload = {
            sender: message.sender,
            content: message.content,
            type: (message.type || 'CHAT').toUpperCase(), // type이 없으면 기본값 'CHAT'
            recipient: message.recipient
        };
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // ✅ 2. 비밀 헤더 추가
                [this.INTERNAL_API_HEADER]: this.INTERNAL_API_SECRET,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
             const errorBody = await response.text();
            this.logger.error(`DB 저장 실패: ${response.status}, 응답: ${errorBody}`);
            throw new Error(`DB 저장 실패: ${response.status}`);
        }
    }

    async getChatHistory(userId: string): Promise<ChatMessageDto[]> {
        this.logger.log(`🔍 채팅 내역 조회 시작: ${userId}`);
        if (!this.backendApiUrl) {
            this.logger.warn('환경 변수 없음. 메모리에서 채팅 내역을 조회합니다.');
            return this.getHistoryFromMemory(userId);
        }

        try {
            const response = await fetch(`${this.backendApiUrl}/api/chat/messages/history/${userId}`,{
                headers: { [this.INTERNAL_API_HEADER]: this.INTERNAL_API_SECRET }});
            if (response.ok) {
                const history = await response.json();
                this.logger.log(`✅ DB에서 조회된 채팅 내역: ${history.length}개`);
                return history as ChatMessageDto[];
            }
            this.logger.error(`❌ DB 조회 실패 - 상태 코드: ${response.status}`);
        } catch (error) {
            this.logger.error('❌ DB 조회 중 치명적 오류 발생:', error);
        }

        return this.getHistoryFromMemory(userId);
    }
    
    private getHistoryFromMemory(userId: string): ChatMessageDto[] {
        this.logger.log('🔄 메모리에서 채팅 내역 조회 (fallback)');
        return this.messages.filter(
            message => message.sender === userId || message.recipient === userId
        );
    }

    async getAllChatUsers(): Promise<string[]> {
        this.logger.log('🔍 DB에서 모든 채팅 사용자 목록 조회 시작');
        if (!this.backendApiUrl) {
            this.logger.warn('환경 변수 없음. 메모리에서 사용자 목록을 조회합니다.');
            return this.getUsersFromMemory();
        }

        try {
            const response = await fetch(`${this.backendApiUrl}/api/chat/messages/users`,{
                headers: { [this.INTERNAL_API_HEADER]: this.INTERNAL_API_SECRET }
            });
            if (response.ok) {
                const users = await response.json();
                this.logger.log(`✅ DB에서 조회된 사용자 목록: ${users.length}명`);
                return users as string[];
            }
            this.logger.error(`❌ DB 사용자 목록 조회 실패 - 상태 코드: ${response.status}`);
        } catch (error) {
            this.logger.error('❌ DB 사용자 목록 조회 중 치명적 오류 발생:', error);
        }

        return this.getUsersFromMemory();
    }
    
    private getUsersFromMemory(): string[] {
        this.logger.log('🔄 메모리에서 사용자 목록 조회 (fallback)');
        return Array.from(new Set(this.messages.map(msg => msg.sender).filter(Boolean)));
    }

    async getUserLastMessage(userId: string): Promise<any> {
        this.logger.log(`🔍 사용자 최근 메시지 조회 시작: ${userId}`);
        if (!this.backendApiUrl) {
            this.logger.warn('환경 변수 없음. 메모리에서 최근 메시지를 조회합니다.');
            return this.getLastMessageFromMemory(userId);
        }

        try {
            const response = await fetch(`${this.backendApiUrl}/api/chat/messages/last/${userId}`,{
                headers: { [this.INTERNAL_API_HEADER]: this.INTERNAL_API_SECRET }
            });
            if (response.ok) {
                const lastMessage = await response.json();
                this.logger.log('✅ DB에서 조회된 최근 메시지:', lastMessage);
                return lastMessage;
            }
            this.logger.error(`❌ DB 최근 메시지 조회 실패 - 상태 코드: ${response.status}`);
        } catch (error) {
            this.logger.error('❌ DB 최근 메시지 조회 중 치명적 오류 발생:', error);
        }

        return this.getLastMessageFromMemory(userId);
    }
    
    private getLastMessageFromMemory(userId: string): ChatMessageDto | null {
        this.logger.log('🔄 메모리에서 최근 메시지 조회 (fallback)');
        const userMessages = this.messages.filter(
            msg => msg.sender === userId || msg.recipient === userId
        );
        return userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
    }

    getAllMessages(): ChatMessageDto[] {
        return [...this.messages];
    }

    clearHistory(userId: string): void {
        this.messages = this.messages.filter(
            message => message.sender !== userId && message.recipient !== userId
        );
    }

    // 온라인 사용자 관리
    addOnlineUser(username: string, socketId: string): void {
        const user: OnlineUser = {
            username,
            socketId,
            joinedAt: new Date(),
            lastActivity: new Date()
        };

        this.onlineUsers.set(username, user);
    }

    removeOnlineUser(username: string): void {
        this.onlineUsers.delete(username);
    }

    removeOnlineUserBySocketId(socketId: string): string | null {
        for (const [username, user] of this.onlineUsers.entries()) {
            if (user.socketId === socketId) {
                this.onlineUsers.delete(username);
                return username;
            }
        }
        return null;
    }

    getOnlineUsers(): string[] {
        return Array.from(this.onlineUsers.keys());
    }

    getOnlineUserCount(): number {
        return this.onlineUsers.size;
    }

    updateUserActivity(username: string): void {
        const user = this.onlineUsers.get(username);
        if (user) {
            user.lastActivity = new Date();
            this.onlineUsers.set(username, user);
        }
    }

    isUserOnline(username: string): boolean {
        return this.onlineUsers.has(username);
    }

    getUserInfo(username: string): OnlineUser | null {
        return this.onlineUsers.get(username) || null;
    }

    // DB에서 모든 채팅 사용자 목록 조회
    // async getAllChatUsers(): Promise<string[]> {
    //     console.log('🔍 DB에서 모든 채팅 사용자 목록 조회 시작');
    //     const baseUrl = (process.env.BACKEND_API_URL || 'http://localhost:8080').replace('/api/chat/messages', '');

    //     try {
    //         const response = await fetch(`${baseUrl}/api/chat/users`);
    //         console.log('📡 DB 사용자 목록 조회 응답 상태:', response.status);
            
    //         if (response.ok) {
    //             const users = await response.json();
    //             console.log('✅ DB에서 조회된 사용자 목록:', users);
    //             return users as string[];
    //         } else {
    //             console.error('❌ DB 사용자 목록 조회 실패 - 상태 코드:', response.status);
    //             const errorText = await response.text();
    //             console.error('❌ DB 사용자 목록 조회 실패 - 응답 내용:', errorText);
    //         }
    //     } catch (error) {
    //         console.error('❌ DB 사용자 목록 조회 중 오류 발생:', error);
    //     }

    //     // DB 조회 실패 시 메모리에서 조회 (fallback)
    //     console.log('🔄 메모리에서 사용자 목록 조회 (fallback)');
    //     const memoryUsers = Array.from(new Set(
    //         this.messages.map(msg => msg.sender).filter(Boolean)
    //     ));
    //     console.log('📋 메모리에서 조회된 사용자 목록:', memoryUsers);
    //     return memoryUsers;
    // }

    // // 사용자의 최근 메시지 조회
    // async getUserLastMessage(userId: string): Promise<any> {
    //     console.log('🔍 사용자 최근 메시지 조회 시작:', userId);
    //     const baseUrl = (process.env.BACKEND_API_URL || 'http://localhost:8080').replace('/api/chat/messages', '');

    //     try {
    //         const response = await fetch(`${baseUrl}/api/chat/messages/last/${userId}`);
    //         console.log('📡 사용자 최근 메시지 조회 응답 상태:', response.status);
            
    //         if (response.ok) {
    //             const lastMessage = await response.json();
    //             console.log('✅ DB에서 조회된 최근 메시지:', lastMessage);
    //             return lastMessage;
    //         } else {
    //             console.error('❌ DB 최근 메시지 조회 실패 - 상태 코드:', response.status);
    //         }
    //     } catch (error) {
    //         console.error('❌ DB 최근 메시지 조회 중 오류 발생:', error);
    //     }

    //     // DB 조회 실패 시 메모리에서 조회 (fallback)
    //     console.log('🔄 메모리에서 최근 메시지 조회 (fallback)');
    //     const userMessages = this.messages.filter(
    //         msg => msg.sender === userId || msg.recipient === userId
    //     );
        
    //     if (userMessages.length > 0) {
    //         const lastMessage = userMessages[userMessages.length - 1];
    //         console.log('📋 메모리에서 조회된 최근 메시지:', lastMessage);
    //         return lastMessage;
    //     }
        
    //     return null;
    // }

    // 비활성 사용자 정리 (5분 이상 활동이 없는 사용자)
    cleanupInactiveUsers(): void {
        const now = new Date();
        const inactiveThreshold = 5 * 60 * 1000; // 5분

        for (const [username, user] of this.onlineUsers.entries()) {
            const timeSinceLastActivity = now.getTime() - user.lastActivity.getTime();
            if (timeSinceLastActivity > inactiveThreshold) {
                this.onlineUsers.delete(username);
            }
        }
    }
} 