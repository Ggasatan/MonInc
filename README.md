# 👻MonInc - 3D Model effect shop site

<div align="center">

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![NestJS](https://img.shields.io/badge/NestJS-11.0.1-E0234E?logo=nestjs)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

**3D모델을 활용한 효과와 모델 커스텀 주문 사이트**

[🚀 시작하기](#-빠른-시작) • [📚 문서](#-프로젝트-구조) • [💡 기능](#-주요-기능)

</div>

---

## 📌 프로젝트 소개

**MonInc**는 3D모델을 활용한 효과와 옵션을 실시간으로 적용, 주문하는 사이트 입니다. 3D를 활용한 효과와 간단한 모델을 활용한 게임, WebSocket으로 실시간 채팅과 알림기능도 함께 구현했습니다.


## 🏗️ 시스템 아키텍처

### Frontend
- **Typescript** & **React** 화면 전반을 구성, 3D모델 렌더링, 효과 구현
### Backend
- **Spring Boot** (Port 8080): 메인 API 서버
- **NestJS** (Port 3000): WebSocket 실시간 통신

### Data
- **MysqlDB**: 메인 데이터베이스
- **Redis**: 캐싱 및 세션 관리

## 🚀 빠른 시작

### 필요 조건
- Java 21 이상
- Node.js 18 이상
- Docker & Docker Compose
- Maven 3.8+

### 설치 및 실행

Docker Compose를 통해 전체 서비스를 한 번에 실행하거나, 개발 환경에서 각 서비스를 개별적으로 실행할 수 있습니다.

## 🛠️ 기술 스택

### Backend
| 기술 | 버전 | 용도 |
|------|-----|------|
| Spring Boot | 3.5.3 | 메인 API 서버 |
| Java | 21 | 런타임 환경 |
| Spring Security | 6.x | 인증 및 보안 |
| JPA/Hibernate | 6.x | ORM |
| QueryDSL | 5.x | 동적 쿼리 |
| NestJS | 11.0.1 | 실시간 통신 서버 |
| Socket.IO | 4.8.1 | WebSocket 통신 |

### Frontend
| 기술 | 버전 | 용도 |
|------|-----|------|
| React | 18.3.1 | SPA 프레임워크 |
| TypeScript | 5.0+ | 타입 안정성 |
| Vite | 5.x | 빌드 도구 |
| three | 0.179.1 | 3D 렌더링 도구 |

### Infrastructure
| 기술 | 용도 |
|------|------|
| MysqlDB | 메인 데이터베이스 |
| Redis | 캐싱 및 세션 관리 |
| Docker | 컨테이너화 |
| AWS RDS | 프로덕션 DB |

## 💡 주요 기능

###
- 관리자와의 실시간 채팅
- 이벤트에 따른 알림 기능
- 3D 모델에 사용자의 옵션을 반영하여 랜더링
- 저장한 모델을 불러와 간단한 조작으로 체험보는 페이지 구성

<div align="center">

**Nexus Portfolio Platform © 2025**

</div>
