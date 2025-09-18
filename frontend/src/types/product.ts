export type ProductStatus = 'ON_SALE' | 'OUT_OF_STOCK' | 'CURRENTLY_UNAVAILABLE' | 'DISCONTINUED';

export interface Product {
  id: number;          // 각 상품을 구분할 고유 ID (상세페이지 이동 시 필수)
  name: string;        // 상품 이름
  monWidth : number;
  monHigh : number;
  modelUrl: string;    // 상품 이미지 주소
  basePrice: number;
  status: ProductStatus;   // 기준 가격 ('500~' 처럼 표시할 때 사용)
  isCustom? : boolean;
}

export interface SubOption {
  id: number;
  name: string;
  modelUrl: string;
}

export interface ProductOption {
  productId: number;
  parts: string; // 'skin', 'part1' 등 카테고리
  optionName: string;
  optionValue: string;
  optionThumbnail: string;
  optionPrice: number;
  stock: number;
}

export interface ProductDetail {
  id: number;
  name: string;
  basePrice: number;
  modelUrl?: string;
  materialMap?: { [key: string]: string };
}