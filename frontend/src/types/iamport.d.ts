interface IamportRequestPayParams {
  pg?: string;
  pay_method: string;
  merchant_uid: string;
  name: string;
  amount: number;
  buyer_email?: string;
  buyer_name?: string;
  buyer_tel?: string;
  buyer_addr?: string;
  buyer_postcode?: string;
  [key: string]: any; // 기타 추가 파라미터
}

interface IamportRequestPayResponse {
  success: boolean;
  error_code?: string;
  error_msg?: string;
  imp_uid: string | null;
  merchant_uid: string;
  pay_method?: string;
  paid_amount?: number;
  status?: string;
  name?: string;
  pg_provider?: string;
  pg_tid?: string;
  buyer_name?: string;
  receipt_url?: string;
}

interface Iamport {
  init(accountID: string): void;
  request_pay(
    params: IamportRequestPayParams,
    callback: (response: IamportRequestPayResponse) => void
  ): void;
}

// window 객체에 IMP 속성을 추가
interface Window {
  IMP?: Iamport;
}