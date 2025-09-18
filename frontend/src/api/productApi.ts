import axios from 'axios';
import {type Product, type ProductOption } from '../types/product';
import { type PreparePaymentPayload } from '../types/order';
import { type PreparePaymentResponse } from '../types/order';

interface VerifyPaymentPayload {
  imp_uid: string;
  merchant_uid: string;
}

interface MemberInfoResponse {
  name: string;
  phoneNum: string;
}

// ✅ [추가] 배송 정보 업데이트 DTO 타입
interface DeliveryInfoUpdatePayload {
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientDetailAddress: string;
  requestMessage?: string;
}

export type SaveOptionsPayload = {
  mon: number;
  saveName: string;
  materialOverrides: string;
} 

export const verifyPaymentApi = async (data: VerifyPaymentPayload): Promise<string> => {
  try {
    // 형의 apiClient를 사용
    const response = await axios.post('/api/payment/verify', data);
    return response.data; // 성공 시 "결제 검증 완료" 같은 문자열이 반환됨
  } catch (error) {
    console.error('결제 검증에 실패했습니다:', error);
    throw error;
  }
};
/**
 * 상품 목록을 조회하는 API 함수
 */
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    // 실제 API 엔드포인트는 형이 정해야 해. 여기서는 예시를 사용.
    const response = await axios.get('/api/products/grid'); 
    return response.data;
  } catch (error) {
    console.error('상품 목록을 불러오는 데 실패했습니다:', error);
    // 에러가 발생했을 때 비어있는 배열을 반환하거나,
    // 에러 객체를 throw해서 컴포넌트에서 처리하게 할 수도 있어.
    return []; 
  }
};

export const fetchProductOptions = async (productId: string): Promise<ProductOption[]> => {
  try {
    // Path Variable을 사용하므로, URL 경로에 productId를 직접 넣어줌
    const response = await axios.get(`/api/products/${productId}/options`);
    return response.data;
  } catch (error) {
    console.error(`ID가 ${productId}인 상품의 옵션을 불러오는 데 실패했습니다:`, error);
    return []; // 에러 발생 시 빈 배열 반환
  }
};

export const fetchProductById = async (productId: string): Promise<any> => { // any 대신 ProductDetail 타입 정의 추천
  try {
    const response = await axios.get(`/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`ID가 ${productId}인 상품 정보를 불러오는 데 실패했습니다:`, error);
    throw error; // 이 에러를 던져야 Page에서 catch로 잡을 수 있음
  }
};

// ✅ [추가] 선택한 옵션을 서버에 저장하는 API 함수
export const saveSelectedOptions = async (payload: SaveOptionsPayload): Promise<any> => {
  try {
    // POST 요청으로 /api/products/options 엔드포인트에 payload 데이터를 담아 보냄
    const response = await axios.post('/api/products/options', payload);
    // 성공 시, 서버의 응답을 그대로 반환 (예: 저장된 조합의 ID 등)
    return response.data; 
  } catch (error) {
    console.error('옵션 저장에 실패했습니다:', error);
    // 컴포넌트에서 에러 처리를 할 수 있도록 에러를 다시 던짐
    throw error;
  }
};

// ✅ [추가] 결제 준비 API를 호출하는 함수
export const preparePaymentApi = async (payload: PreparePaymentPayload): Promise<PreparePaymentResponse> => {
  try {
    const response = await axios.post<PreparePaymentResponse>('/api/payment/prepare', payload);
    return response.data;
  } catch (error) {
    console.error('결제 준비에 실패했습니다:', error);
    throw error;
  }
};

export const fetchMemberInfo = async (): Promise<MemberInfoResponse> => {
  try {
    const response = await axios.get<MemberInfoResponse>('/api/members/me'); // 이 API 엔드포인트는 실제 주소로 변경해야 할 수 있어
    return response.data;
  } catch (error) {
    console.error('회원 정보 조회에 실패했습니다:', error);
    throw error;
  }
};