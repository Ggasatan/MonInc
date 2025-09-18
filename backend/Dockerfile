# Stage 1: Maven을 사용하여 애플리케이션 빌드
FROM maven:3.8.5-openjdk-17 AS builder

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# pom.xml을 먼저 복사하여 의존성 레이어 캐싱 활용
COPY pom.xml .
RUN mvn dependency:go-offline

# 나머지 소스 코드 복사
COPY src ./src

# Maven으로 프로젝트 빌드 (테스트는 스킵하여 빌드 속도 향상)
RUN mvn package -DskipTests

# Stage 2: 실제 실행을 위한 경량 이미지 생성
FROM amazoncorretto:17-alpine-jre

# 작업 디렉토리 설정
WORKDIR /app

# builder 스테이지에서 빌드된 JAR 파일을 복사
# 중요: 아래 'target/*.jar' 부분에서 실제 생성되는 .jar 파일 이름으로 바꿔주세요.
COPY --from=builder /usr/src/app/target/*.jar app.jar

# 애플리케이션 실행 포트 노출
EXPOSE 8080

# 컨테이너 시작 시 실행될 명령어
ENTRYPOINT ["java", "-jar", "app.jar"]