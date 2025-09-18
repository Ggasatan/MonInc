import React, { useState, useEffect, useRef } from 'react';
import { io,Socket } from 'socket.io-client';
import UserList from './UserList';
import ChatRoom from './ChatRoom';
import ChatStats from './ChatStats';
import './ChatDashboard.css';

interface Message {
    content: string;
    sender: string;
    recipient: string;
    type: 'CHAT' | 'JOIN';
    timestamp: string;
}

interface User {
    username: string;
    status: 'online' | 'offline';
    lastMessage: {
        content: string;
        timestamp: string;
    } | null;
}

interface ChatHistoryData {
    userId: string;
    history: Message[];
}

const ChatDashboard = () => {
    const [socket, setSocket] = useState<Socket | null>(null); // 소켓 연결 상태
    const [users, setUsers] = useState<Map<string, User>>(new Map()); // 사용자 목록
    const [currentUser, setCurrentUser] = useState<string | null>(null); // 현재 선택된 사용자
    const [messages, setMessages] = useState<Message[]>([]); // 현재 선택된 사용자의 메시지 목록
    const [allMessages, setAllMessages] = useState<Map<string, Message[]>>(new Map()); // 모든 사용자의 메시지 저장
    const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map()); // 각 사용자별 안읽은 메시지 수
    const [connectionStatus, setConnectionStatus] = useState('연결 중...');
    const currentUserRef = useRef<string | null>(currentUser); // 현재 선택된 사용자 참조

    useEffect(() => {
    if (allMessages.size > 0) { // 비어있지 않을 때만 저장
        const arrayToStore = Array.from(allMessages.entries());
        localStorage.setItem('chat_allMessages', JSON.stringify(arrayToStore));
    }
    }, [allMessages]);
    // 새로고침 시 저장된 데이터 복원
    useEffect(() => {
        const savedCurrentUser = localStorage.getItem('chat_currentUser');
        const savedAllMessages = localStorage.getItem('chat_allMessages');
        
        if (savedCurrentUser) {
            setCurrentUser(JSON.parse(savedCurrentUser));
        }
        if (savedAllMessages) {
            setAllMessages(new Map(JSON.parse(savedAllMessages)));
        }
    }, []);


    useEffect(() => {
        
        const serverUrl = import.meta.env.VITE_NOTIFICATION_SERVER_URL || 'http://localhost:3001';
        // Socket.IO 연결 (관리자 권한으로)
        const newSocket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            auth: {
                userId: 1, // 관리자 ID
                roles: ['ROLE_ADMIN'] // 관리자 역할
            }
        });

        newSocket.on('connect', () => {
            console.log('✅ 관리자 대시보드 연결 성공');
            setConnectionStatus('연결됨');
            newSocket.emit('joinAsAdmin'); 
            
            // 연결 성공 후 DB에서 모든 채팅 사용자 목록 요청
            console.log('📤 모든 채팅 사용자 목록 요청');
            newSocket.emit('getAllChatUsers');
        });

        newSocket.on('disconnect', () => {
            console.log('🔗 관리자 대시보드 연결 해제');
            setConnectionStatus('연결 해제됨');
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ 관리자 대시보드 연결 오류:', error);
            setConnectionStatus('연결 오류');
        });

        // // 사용자 관련 이벤트
        // newSocket.on('userJoined', (data: {sender:string}) => {
        //     addUser(data.sender);
        // });

        // newSocket.on('userDisconnected', (data: {sender:string}) => {
        //     removeUser(data.sender);
        // });

        newSocket.on('updateOnlineUsers', (onlineUsernames: string[]) => {
            console.log('📡 실시간 온라인 유저 목록 수신:', onlineUsernames);
            setUsers(prevUsers => {
                const newUsers = new Map(prevUsers);

                // 출석부 시스템:
                // 1. 일단 명단에 있는 모든 학생(유저)을 '결석(offline)' 처리한다.
                newUsers.forEach((user, username) => {
                    // 단, 자기 자신(currentUser)은 오프라인으로 바꾸지 않음 (UI 깜빡임 방지)
                    if (username !== currentUserRef.current) {
                        newUsers.set(username, { ...user, status: 'offline' });
                    }
                });

                // 2. 선생님이 호명한 학생(서버가 보내준 onlineUsernames)만 '출석(online)'으로 바꾼다.
                onlineUsernames.forEach(username => {
                    const user = newUsers.get(username);
                    if (user) {
                        newUsers.set(username, { ...user, status: 'online' });
                    }
                });

                return newUsers;
            });
        });

        // 메시지 관련 이벤트
        // newSocket.on('userMessage', (data: Message) => {
        //     // 사용자 목록에 최근 메시지 정보 업데이트
        //     setUsers(prevUsers => {
        //         const newUsers = new Map(prevUsers);
        //         const user = newUsers.get(data.sender);
        //         if (user) {
        //             newUsers.set(data.sender, {
        //                 ...user,
        //                 lastMessage: {
        //                     content: data.content,
        //                     timestamp: data.timestamp
        //                 }
        //             });
        //         }
        //         return newUsers;
        //     });
                    // 'userMessage' 이벤트 핸들러는 이전과 동일 (내가 마지막으로 제안했던 버전)
            newSocket.on('userMessage', (data: Message) => {
                setUsers(prevUsers => {
                    const newUsers = new Map(prevUsers);
                    const user = newUsers.get(data.sender) || { username: data.sender, status: 'offline' };
                    newUsers.set(data.sender, {
                        ...user,
                        status: 'online', // 메시지를 보냈다는 건 무조건 온라인 상태!
                        lastMessage: { content: data.content, timestamp: data.timestamp },
                    });
                return newUsers;
            });

            // 안읽은 메시지 수 업데이트 (현재 선택된 사용자가 아닌 경우에만)
            if (currentUserRef.current !== data.sender) {
                setUnreadCounts(prev => {
                    const newCounts = new Map(prev);
                    const currentCount = newCounts.get(data.sender) || 0;
                    newCounts.set(data.sender, currentCount + 1);
                    return newCounts;
                });

                // 알림 표시
                showNotification(data.sender, data.content);
            } else {
                // 현재 선택된 사용자의 메시지라면 채팅방에 표시
                handleUserMessage(data);
            }

            // 현재 보고 있는 채팅방이면 메시지 목록에 추가
            if (currentUserRef.current === data.sender) {
                handleUserMessage(data);
            }
        });

        // 관리자 응답 수신 (관리자가 보낸 메시지)
        newSocket.on('adminReply', (data: Message) => {
            if (currentUserRef.current === data.recipient) {
                handleUserMessage(data);
            }
        });

        // 채팅 내역 수신
        newSocket.on('chatHistory', (data: ChatHistoryData) => {
            console.log('📨 채팅 내역 수신:', data);
            console.log('🔍 현재 선택된 사용자:', currentUserRef.current);
            if (data.userId === currentUserRef.current) {
                console.log('✅ 현재 사용자와 일치하는 채팅 내역:', data.userId);
                const sorted = (data.history || []).sort((a, b) =>
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );
                console.log('📋 정렬된 채팅 내역:', sorted);
                setMessages(sorted);

                // DB에서 받은 데이터로 allMessages 업데이트 (중복 방지)
                setAllMessages(prev => new Map(prev).set(data.userId, sorted));
            } else {
                console.log('❌ 현재 사용자와 일치하지 않는 채팅 내역:', {
                    receivedUserId: data.userId,
                    currentUser: currentUserRef.current
                });
            }
        });

        // 모든 채팅 사용자 목록 수신 (새로고침 시 DB에서 복원)
        newSocket.on('allChatUsers', (users: string[]) => {
            console.log('📨 모든 채팅 사용자 목록 수신:', users);
            if (users && Array.isArray(users)) {
                // DB에서 가져온 사용자들을 오프라인 상태로 추가
                users.forEach(username => {
                    const fullUsername = normalizeUsername(username);
                    setUsers(prev => {
                        const newUsers = new Map(prev);
                        if (!newUsers.has(fullUsername)) {
                            newUsers.set(fullUsername, {
                                username: fullUsername,
                                status: 'offline', // DB에서 가져온 사용자는 기본적으로 오프라인
                                lastMessage: null
                            });
                        }
                        return newUsers;
                    });
                });
                console.log('✅ DB에서 사용자 목록 복원 완료');
                
                // 각 사용자의 최근 메시지 정보 요청
                users.forEach(username => {
                    const fullUsername = normalizeUsername(username);
                    console.log('📤 사용자 최근 메시지 요청:', fullUsername);
                    newSocket.emit('getUserLastMessage', { userId: fullUsername });
                });
            } else {
                console.log('⚠️ DB에서 사용자 목록을 가져오지 못함, 테스트 데이터 사용');
                // 테스트용 하드코딩된 사용자 목록 (DB 연결 실패 시)
                const testUsers = ['사용자_test1', '사용자_test2', '사용자_ljs4mu4jp'];
                testUsers.forEach(username => {
                    setUsers(prev => {
                        const newUsers = new Map(prev);
                        if (!newUsers.has(username)) {
                            newUsers.set(username, {
                                username: username,
                                status: 'offline',
                                lastMessage: {
                                    content: '테스트 메시지',
                                    timestamp: new Date().toISOString()
                                }
                            });
                        }
                        return newUsers;
                    });
                });
            }
        });

        // 사용자 최근 메시지 수신
        newSocket.on('userLastMessage', (data: { userId: string; lastMessage: { content: string; timestamp: string } }) => {
            console.log('📨 사용자 최근 메시지 수신:', data);
            if (data.userId && data.lastMessage) {
                setUsers(prev => {
                    const newUsers = new Map(prev);
                    const user = newUsers.get(data.userId);
                    if (user) {
                        newUsers.set(data.userId, {
                            ...user,
                            lastMessage: {
                                content: data.lastMessage.content,
                                timestamp: data.lastMessage.timestamp
                            }
                        });
                    }
                    return newUsers;
                });
            }
        });

        setSocket(newSocket);

        // 알림 권한 요청
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            newSocket.disconnect();
        };
    }, []); // 소켓 연결은 한 번만

    // currentUser가 변경될 때마다 ref 업데이트
    useEffect(() => {
        currentUserRef.current = currentUser;
    }, [currentUser]);

    // 현재 사용자가 변경될 때 로컬 스토리지에 저장
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('chat_currentUser', JSON.stringify(currentUser));
        }
    }, [currentUser]);

    const joinAsAdmin = (socket: Socket) => {
        socket.emit('joinAsAdmin', {
            sender: '관리자',
            type: 'JOIN'
        });
    };

    const normalizeUsername = (username: string) => {
        return username.startsWith('사용자_') ? username.replace('사용자_','') : username;
    };

    const addUser = (username: string) => {
        const fullUsername = normalizeUsername(username);
        setUsers(prevUsers => {
            const newUsers = new Map(prevUsers);
            const user = newUsers.get(fullUsername) || { // 기존 유저가 없으면 기본 객체 생성
                username: fullUsername,
                lastMessage: null,
            };
            
            // 상태를 'online'으로 설정하고 맵에 다시 저장
            newUsers.set(fullUsername, { ...user, status: 'online' });
            return newUsers;
        });
    };

    const removeUser = (username: string) => {
        setUsers(prev => {
            const newUsers = new Map(prev);
            const user = newUsers.get(username);
            if (user) {
                // 사용자를 삭제하지 않고 상태만 offline으로 변경
                newUsers.set(username, {
                    ...user,
                    status: 'offline'
                });
            }
            return newUsers;
        });

        // 현재 선택된 사용자가 오프라인이 되어도 채팅방은 유지
        // 채팅 내역은 DB에 저장되어 있으므로 계속 볼 수 있음
    };

    const handleUserMessage = (data: Message) => {
        setMessages(prev => [...prev, data]);
    };

    const selectUser = (username: string) => {
        const fullUsername = normalizeUsername(username);
        console.log('👤 사용자 선택:', { original: username, normalized: fullUsername });
        setCurrentUser(fullUsername);

        // 채팅방 진입 시 안읽은 메시지 수 리셋 (읽음 처리)
        setUnreadCounts(prev => 
            new Map(prev).set(fullUsername, 0)
        );

        // 항상 DB에서 최신 데이터를 가져오도록 수정
        setMessages([]); // 로딩 상태 표시
        if (fullUsername && socket) {
            console.log('📤 채팅 내역 요청 전송:', { userId: fullUsername, socketConnected: socket.connected });
            socket.emit('getHistory', { userId: fullUsername });
        } else {
            console.warn('⚠️ 채팅 내역 요청 실패:', {
                fullUsername,
                socketExists: !!socket,
                socketConnected: socket?.connected
            });
        }
    };

    const backToUserList = () => {
        setCurrentUser(null);
        setMessages([]);
    };

    // 안읽은 채팅방 수 계산 (상담 대기 중인 고객 수)
    const calculateUnreadChatRooms = (): number => {
        return Array.from(unreadCounts.values()).filter(count =>
            count > 0).length
    };

    const sendMessage = (content:string) => {
        if (!currentUser || !socket) return;

        const messageData = {
            content,
            sender: '관리자',
            recipient: currentUser,
            type: 'CHAT',
            timestamp: new Date().toISOString()
        };

        socket.emit('sendMessage', messageData);
        // 메시지는 서버에서 DB 저장 후 다시 받아서 표시되므로 여기서는 추가하지 않음
    };

    const showNotification = (sender: string, content: string) => {
        if (Notification.permission === 'granted') {
            const notification = new Notification(`새 메시지: ${sender}`, {
                body: content,
                icon: '/favicon.ico',
                requireInteraction: false, // 자동으로 사라지도록 설정
                silent: true // 소리 없이
            });

            // 1.5초 후 자동으로 알림 닫기
            setTimeout(() => {
                notification.close();
            }, 1500);
        }

        // 탭 제목 변경 (1초로 단축)
        const originalTitle = document.title;
        document.title = `[새 메시지] ${originalTitle}`;
        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    };

    return (
        <div className="chat-dashboard">
            {/* 헤더 */}
            <div className="chat-header">
                <div>
                    <h4 className="mb-0">
                        <i className="fas fa-comments"></i>
                        관리자 채팅 대시보드
                    </h4>
                    <small className={`text-${connectionStatus === '연결됨' ? 'success' : 'danger'}`}>
                        {connectionStatus}
                    </small>
                </div>
                <ChatStats
                    onlineUsers={Array.from(users.values()).filter(user => user.status === 'online').length}
                    totalMessages={calculateUnreadChatRooms()}
                />
            </div>

            {/* 메인 영역 */}
            <div className="chat-main">
                {/* 사용자 목록 */}
                <UserList
                    users={Array.from(users.values())}
                    currentUser={currentUser}
                    onSelectUser={selectUser}
                    unreadCounts={unreadCounts}
                />

                {/* 채팅 영역 */}
                <ChatRoom
                    currentUser={currentUser}
                    messages={messages}
                    onSendMessage={sendMessage}
                    onBackToUserList={backToUserList}
                />
            </div>
        </div>
    );
};

export default ChatDashboard; 