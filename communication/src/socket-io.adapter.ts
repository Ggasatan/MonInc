// src/socket-io.adapter.ts

import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';

// Nest.JS의 기본 IoAdapter를 확장(상속)한다.
export class SocketIoAdapter extends IoAdapter {
  // 소켓 서버를 생성하는 메서드를 오버라이드(재정의)한다.
  createIOServer(port: number, options?: ServerOptions): any {
    // --- 👇 여기가 핵심! ---
    // 클라이언트가 보낸 origin 정보를 cors 설정에 동적으로 추가해준다.
    // 이렇게 하면 어떤 출처에서 요청이 와도 CORS 에러가 발생하지 않는다.
    if (options) {
      options.cors = {
        origin: true,
        credentials: true,
      };
    }

    const server = super.createIOServer(port, options);
    
    // 미들웨어를 사용해서 auth 정보를 다음 단계로 넘겨준다.
    // 이 부분이 없으면 gateway의 handshake에서 auth 정보를 읽을 수 없다.
    server.use((socket: any, next) => {
      // 클라이언트가 보낸 인증 토큰을 handshake 객체로 전달
      const token = socket.handshake.auth;
      if (token) {
        // 실제 프로덕션에서는 여기서 JWT 토큰을 검증하는 로직이 들어갈 수 있다.
        // 지금은 그냥 다음 미들웨어/핸들러로 넘겨주기만 하면 된다.
        socket.handshake.auth = token;
      }
      next();
    });
    
    return server;
  }
}