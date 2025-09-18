export interface SaveOptionResponse {
  id: number;
  skin: number;
  partOne: number;
  partTwo: number;
  partThree: number;
  accessoriesOne: number;
  accessoriesTwo: number;
};

// ✅ 사용자가 최종 선택한 옵션 ID들을 담을 객체의 타입
export type UserSelections = {
  skin: number | null;
  partOne: number | null;
  partTwo: number | null;
  partThree: number | null;
  accessoriesOne: number | null;
  accessoriesTwo: number | null;
};

// ✅ categoryMap의 키들을 기반으로 타입을 생성하기 위한 기준 객체
export const categoryMapForTyping = {
  'skin': {},
  'part1': {},
  'part2': {},
  'part3': {},
  'accessorie1': {},
  'accessorie2': {},
} as const;

// ✅ 프론트엔드에서 사용하는 카테고리 이름들만 모아서 만든 타입
export type FrontEndCategory = keyof typeof categoryMapForTyping;

// ✅ categoryMap 객체 전체의 상세한 타입 정의
export type CategoryMapType = { 
  [key in FrontEndCategory]: { 
    dtoKey: keyof UserSelections; 
    filterKey: string; 
  } 
};

// ✅ [추가] 3D 뷰어에서 추출한 파츠 정보 타입
export interface CustomizablePart {
  meshName: string;
  displayName: string;
}

// ✅ [추가] 커스텀 재질 속성 타입
export interface MaterialProperties {
  color: string;
  metalness: number;
  roughness: number;
}

// ✅ [추가] 여러 파츠의 재질 정보를 담을 객체 타입
export type MaterialOverrides = Record<string, MaterialProperties>;