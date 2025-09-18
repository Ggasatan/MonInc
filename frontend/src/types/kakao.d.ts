interface DaumPostcodeData {
  address: string;
  zonecode: string;
  // 필요한 다른 주소 정보 필드들
}

interface DaumPostcode {
  open(options?: any): void;
}

// window 객체에 daum 속성을 추가
interface Window {
  daum?: {
    Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => DaumPostcode;
  };
}