# A/a/Dockerfile (Maven 버전)

# 1. 빌드 단계: Maven을 사용하여 애플리케이션 빌드
#    - 베이스 이미지를 gradle이 아닌 maven으로 변경
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app
#    - build.gradle 대신 pom.xml 파일을 복사
COPY pom.xml ./
#    - src 폴더 복사는 동일
COPY src ./src
#    - 'gradle build' 대신 'mvn package' 명령어로 빌드 (테스트는 생략하여 빌드 속도 향상)
RUN mvn -B package -DskipTests

# 2. 실행 단계: 빌드된 .jar 파일만 가져와서 실행 (이 부분은 거의 동일)
FROM openjdk:17-alpine
WORKDIR /app
#    - Maven의 빌드 결과물은 target/ 폴더에 생성되므로 경로 수정
COPY --from=builder /app/target/*.jar ./app.jar
# 8080 포트 노출
EXPOSE 8080
# 컨테이너 시작 시 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]