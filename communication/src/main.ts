import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new SocketIoAdapter(app));
  
  // CORS 설정 (이건 API 요청용, 웹소켓 CORS는 어댑터에서 처리)
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:8080', "http://localhost:3000"],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
