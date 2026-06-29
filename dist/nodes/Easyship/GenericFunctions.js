"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanAddress = cleanAddress;
exports.buildShipmentBody = buildShipmentBody;
exports.findPdfLabelDocuments = findPdfLabelDocuments;
function cleanAddress(address) {
    const cleaned = { ...address };
    if (!cleaned.line_2)
        delete cleaned.line_2;
    if (!cleaned.state)
        delete cleaned.state;
    return cleaned;
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