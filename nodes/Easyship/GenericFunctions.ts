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

export function cleanAddress(address: EasyshipAddress): EasyshipAddress {
	const cleaned = { ...address };
	if (!cleaned.line_2) delete cleaned.line_2;
	if (!cleaned.state) delete cleaned.state;
	return cleaned;
}

export function buildShipmentBody(parameters: ShipmentParameters): IDataObject {
	const item: IDataObject = {
		description: parameters.description,
		category: parameters.category,
		quantity: parameters.quantity,
		declared_currency: parameters.declaredCurrency.toUpperCase(),
		declared_customs_value: parameters.declaredCustomsValue,
		origin_country_alpha2: parameters.originCountry.toUpperCase(),
	};

	if (parameters.sku) item.sku = parameters.sku;
	if (parameters.hsCode) item.hs_code = parameters.hsCode;

	const body: IDataObject = {
		origin_address: cleanAddress(parameters.sender),
		sender_address: cleanAddress(parameters.sender),
		destination_address: cleanAddress(parameters.recipient),
		parcels: [
			{
				total_actual_weight: parameters.weight,
				box: {
					length: parameters.length,
					width: parameters.width,
					height: parameters.height,
				},
				items: [item],
			},
		],
		shipping_settings: {
			units: { dimensions: 'in', weight: 'lb' },
			buy_label: parameters.createLabel,
			buy_label_synchronous: parameters.createLabel,
			...(parameters.createLabel
				? {
						printing_options: {
							format: 'pdf',
							label: parameters.labelSize,
							packing_slip: 'none',
						},
					}
				: {}),
		},
	};

	if (parameters.courierServiceId) {
		body.courier_settings = { courier_service_id: parameters.courierServiceId };
	}

	return body;
}

export function findPdfLabelDocuments(response: IDataObject): ShippingDocument[] {
	const shipment = response.shipment as IDataObject | undefined;
	const documents = shipment?.shipping_documents;
	if (!Array.isArray(documents)) return [];

	return documents.filter((document): document is ShippingDocument => {
		if (!document || typeof document !== 'object') return false;
		const candidate = document as ShippingDocument;
		return candidate.category === 'label' && candidate.format?.toLowerCase() === 'pdf';
	});
}
