import { type DeliveryInfoData } from '../components/productDetail/DeliveryInfoModal';


export interface PreparePaymentPayload {
  saveOptionId: number;
  deliveryInfo: DeliveryInfoData;
}

export interface PreparePaymentResponse {
  merchantUid: string;
  productName: string;
  amount: number;
  buyerEmail: string;
  buyerName: string;
}