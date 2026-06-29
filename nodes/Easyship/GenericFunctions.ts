import type { IDataObject } from 'n8n-workflow';

export interface EasyshipAddress extends IDataObject {
	line_1?: string;
	line_2?: string;
	city?: string;
	state?: string;
	postal_code?: string;
	country_alpha2?: string;
	company_name?: string;
	contact_name?: string;
	contact_phone?: string;
	contact_email?: string;
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

export function cleanAddress(address: EasyshipAddress): IDataObject {
	const cleaned: IDataObject = {};
	for (const [key, value] of Object.entries(address)) {
		if (typeof value === 'string' && value.trim()) cleaned[key] = value.trim();
	}
	if (typeof cleaned.country_alpha2 === 'string') {
		cleaned.country_alpha2 = cleaned.country_alpha2.toUpperCase();
	}
	if (!cleaned.company_name && cleaned.contact_name) {
		cleaned.company_name = cleaned.contact_name;
	}
	return cleaned;
}

const countriesRequiringState = new Set(['AU', 'CA', 'CN', 'ID', 'MX', 'MY', 'TH', 'US', 'VN']);

export function getAddressValidationIssues(
	address: EasyshipAddress,
	prefix: 'sender' | 'recipient',
): string[] {
	const cleaned = cleanAddress(address);
	const issues: string[] = [];
	const requiredFields = [
		'line_1',
		'city',
		'postal_code',
		'country_alpha2',
		'contact_name',
		'contact_phone',
		'contact_email',
	];

	for (const field of requiredFields) {
		if (!cleaned[field]) issues.push(`${prefix}.${field} is missing`);
	}

	const country = String(cleaned.country_alpha2 ?? '');
	if (country && !/^[A-Z]{2}$/.test(country)) {
		issues.push(`${prefix}.country_alpha2 must be a two-letter ISO country code`);
	}
	if (countriesRequiringState.has(country) && !cleaned.state) {
		issues.push(`${prefix}.state is missing for ${country}`);
	}

	const email = String(cleaned.contact_email ?? '');
	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		issues.push(`${prefix}.contact_email is not a valid email address`);
	}

	const maximumLengths: Record<string, number> = {
		line_1: 35,
		line_2: 35,
		state: 200,
		city: 200,
		company_name: prefix === 'sender' ? 27 : 50,
		contact_name: prefix === 'sender' ? 22 : 50,
		contact_phone: 20,
		contact_email: 50,
	};
	for (const [field, maximum] of Object.entries(maximumLengths)) {
		const value = cleaned[field];
		if (typeof value === 'string' && value.length > maximum) {
			issues.push(`${prefix}.${field} exceeds ${maximum} characters`);
		}
	}

	return issues;
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
