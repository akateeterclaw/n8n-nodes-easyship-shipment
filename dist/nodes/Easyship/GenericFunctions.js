"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanAddress = cleanAddress;
exports.getAddressValidationIssues = getAddressValidationIssues;
exports.buildShipmentBody = buildShipmentBody;
exports.findPdfLabelDocuments = findPdfLabelDocuments;
function cleanAddress(address) {
    const cleaned = {};
    for (const [key, value] of Object.entries(address)) {
        if (typeof value === 'string' && value.trim())
            cleaned[key] = value.trim();
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
function getAddressValidationIssues(address, prefix) {
    var _a, _b;
    const cleaned = cleanAddress(address);
    const issues = [];
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
        if (!cleaned[field])
            issues.push(`${prefix}.${field} is missing`);
    }
    const country = String((_a = cleaned.country_alpha2) !== null && _a !== void 0 ? _a : '');
    if (country && !/^[A-Z]{2}$/.test(country)) {
        issues.push(`${prefix}.country_alpha2 must be a two-letter ISO country code`);
    }
    if (countriesRequiringState.has(country) && !cleaned.state) {
        issues.push(`${prefix}.state is missing for ${country}`);
    }
    const email = String((_b = cleaned.contact_email) !== null && _b !== void 0 ? _b : '');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        issues.push(`${prefix}.contact_email is not a valid email address`);
    }
    const maximumLengths = {
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
function buildShipmentBody(parameters) {
    const item = {
        description: parameters.description,
        category: parameters.category,
        quantity: parameters.quantity,
        declared_currency: parameters.declaredCurrency.toUpperCase(),
        declared_customs_value: parameters.declaredCustomsValue,
        origin_country_alpha2: parameters.originCountry.toUpperCase(),
    };
    if (parameters.sku)
        item.sku = parameters.sku;
    if (parameters.hsCode)
        item.hs_code = parameters.hsCode;
    const body = {
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
function findPdfLabelDocuments(response) {
    const shipment = response.shipment;
    const documents = shipment === null || shipment === void 0 ? void 0 : shipment.shipping_documents;
    if (!Array.isArray(documents))
        return [];
    return documents.filter((document) => {
        var _a;
        if (!document || typeof document !== 'object')
            return false;
        const candidate = document;
        return candidate.category === 'label' && ((_a = candidate.format) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'pdf';
    });
}
//# sourceMappingURL=GenericFunctions.js.map