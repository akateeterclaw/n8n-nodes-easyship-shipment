import type { IDataObject } from 'n8n-workflow';
export interface EasyshipAddress extends IDataObject {
    line_1: string;
    line_2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country_alpha2: string;
    company_name: string;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
}
export interface ShipmentParameters {
    sender: EasyshipAddress;
    recipient: EasyshipAddress;
    length: number;
    width: number;
    height: number;
    weight: number;
    description: string;
    category: string;
    quantity: number;
    declaredCurrency: string;
    declaredCustomsValue: number;
    originCountry: string;
    sku?: string;
    hsCode?: string;
    courierServiceId?: string;
    createLabel: boolean;
    labelSize: string;
}
export interface ShippingDocument extends IDataObject {
    category?: string;
    format?: string;
    base64_encoded_strings?: string[];
    url?: string;
}
export declare function cleanAddress(address: EasyshipAddress): EasyshipAddress;
export declare function buildShipmentBody(parameters: ShipmentParameters): IDataObject;
export declare function findPdfLabelDocuments(response: IDataObject): ShippingDocument[];
