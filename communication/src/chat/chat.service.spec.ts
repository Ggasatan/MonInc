import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatMessageDto, ChatMessageType } from './dto/chat-message.dto';
import fetchMock from 'jest-fetch-mock'; // fetch를 모킹하기 위해 추가

describe('ChatService', () => {
    let service: ChatService;

    beforeAll(() => {
        // ✅ 1. 모든 테스트 전에 fetch를 가짜(mock) 함수로 대체
        fetchMock.enableMocks();
    });

    beforeEach(async () => {
        // ✅ 2. 각 테스트 전에 fetch mock을 초기화하고, 기본적으로 성공(200 OK) 응답을 반환하도록 설정
        fetchMock.resetMocks();
        fetchMock.mockResponse(JSON.stringify({ success: true }));

        const module: TestingModule = await Test.createTestingModule({
            providers: [ChatService],
        }).compile();

        service = module.get<ChatService>(ChatService);

        // ✅ 3. 환경 변수 mock 설정
        process.env.BACKEND_API_URL = 'http://mock-backend:8080';
    });
    
    afterAll(() => {
        // ✅ 4. 모든 테스트가 끝나면 fetch mock 비활성화
        fetchMock.disableMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // --- 모든 테스트 케이스에 async/await 적용 ---

    describe('saveMessage', () => {
        it('should save user message correctly', async () => { // ✅ async 추가
            const messageData: ChatMessageDto = { 
                sender: 'testUser',
                content: '안녕하세요!',
                type: 'CHAT',
                recipient: null,
                timestamp: new Date() // timestamp는 서비스에서 덮어쓰지만, 타입 맞추기 위해 추가
            };
            const savedMessage = await service.saveMessage(messageData); // ✅ await 추가
            expect(savedMessage).toBeDefined();
            expect(savedMessage.sender).toBe('testUser');
            expect(savedMessage.content).toBe('안녕하세요!');
            expect(savedMessage.type).toBe('CHAT');
            expect(savedMessage.recipient).toBeNull();
            expect(savedMessage.timestamp).toBeInstanceOf(Date); // 타임스탬프가 Date 객체인지 확인
        });

        it('should save admin reply correctly', async () => { // ✅ async 추가
            const messageData: ChatMessageDto = {
                sender: 'admin',
                content: '답장입니다.',
                type: 'CHAT',
                recipient: 'user123',
                timestamp: new Date()
            };
            const savedMessage = await service.saveMessage(messageData); // ✅ await 추가
                expect(savedMessage).toBeDefined();
                expect(savedMessage.sender).toBe('admin');
                expect(savedMessage.content).toBe('답장입니다.');
                expect(savedMessage.recipient).toBe('user123');
        });
    });

    describe('getChatHistory', () => {
        it('should return empty array for new user', async () => { // ✅ async 추가
            const userId = 'newUser';
            // DB 응답이 비어있도록 설정
            fetchMock.mockResponseOnce(JSON.stringify([])); 
            const history = await service.getChatHistory(userId); // ✅ await 추가
            expect(history).toEqual([]);
        });

        it('should return chat history for user with messages', async () => { // ✅ async 추가
            const user1 = 'user1';
            const user2 = 'user2';
            
            // user1의 채팅 내역 mock 응답
            const user1MockHistory = [
        { sender: user1, content: '첫 번째 메시지', type: 'CHAT', recipient: null, timestamp: new Date() },
        { sender: user1, content: '두 번째 메시지', type: 'CHAT', recipient: null, timestamp: new Date() },
            ];
            // user2의 채팅 내역 mock 응답
            const user2MockHistory = [
                { sender: user2, content: '다른 사용자 메시지' },
            ];

            // fetch가 특정 URL로 호출될 때, 정해진 응답을 반환하도록 설정
            fetchMock.mockIf(req => req.url.endsWith(user1), JSON.stringify(user1MockHistory));
            fetchMock.mockIf(req => req.url.endsWith(user2), JSON.stringify(user2MockHistory));
            
            const user1History = await service.getChatHistory(user1); // ✅ await 추가
            const user2History = await service.getChatHistory(user2); // ✅ await 추가

            expect(user1History).toHaveLength(2);
            expect(user2History).toHaveLength(1);
        });
    });

    describe('getAllMessages', () => {
        it('should return all messages for admin', () => {
            // given
            service.saveMessage({
                sender: 'user1',
                content: '사용자 1 메시지',
                type: 'CHAT' as ChatMessageType,
                recipient: null,
            });

            service.saveMessage({
                sender: 'user2',
                content: '사용자 2 메시지',
                type: 'CHAT' as ChatMessageType,
                recipient: null,
            });

            // when
            const allMessages = service.getAllMessages();

            // then
            expect(allMessages.length).toBeGreaterThanOrEqual(2);
            expect(allMessages.some(msg => msg.sender === 'user1')).toBe(true);
            expect(allMessages.some(msg => msg.sender === 'user2')).toBe(true);
        });
    });

    describe('clearHistory', () => {
        it('should clear chat history for specific user', () => {
            // given
            const user = 'testUser';
            service.saveMessage({
                sender: user,
                content: '테스트 메시지',
                type: 'CHAT' as ChatMessageType,
                recipient: null,
            });

            // when
            service.clearHistory(user);

            // then
            const history = service.getChatHistory(user);
            expect(history).toEqual([]);
        });

        it('should not affect other users history', () => {
            // given
            const user1 = 'user1';
            const user2 = 'user2';

            service.saveMessage({
                sender: user1,
                content: '사용자 1 메시지',
                type: 'CHAT' as ChatMessageType,
                recipient: null,
            });

            service.saveMessage({
                sender: user2,
                content: '사용자 2 메시지',
                type: 'CHAT' as ChatMessageType,
                recipient: null,
            });

            // when
            service.clearHistory(user1);

            // then
            const user1History = service.getChatHistory(user1);
            const user2History = service.getChatHistory(user2);

            expect(user1History).toEqual([]);
            expect(user2History).toHaveLength(1);
            expect(user2History[0].sender).toBe(user2);
        });
    });
}); 