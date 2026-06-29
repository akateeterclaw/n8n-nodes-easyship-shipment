"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Easyship = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
const addressFields = [
    {
        displayName: 'Contact Name',
        name: 'contact_name',
        type: 'string',
        default: '',
        required: true,
    },
    {
        displayName: 'Company Name',
        name: 'company_name',
        type: 'string',
        default: '',
        required: true,
    },
    {
        displayName: 'Address Line 1',
        name: 'line_1',
        type: 'string',
        default: '',
        required: true,
    },
    {
        displayName: 'Address Line 2',
        name: 'line_2',
        type: 'string',
        default: '',
    },
    {
        displayName: 'City',
        name: 'city',
        type: 'string',
        default: '',
        required: true,
    },
    {
        displayName: 'State / Province',
        name: 'state',
        type: 'string',
        default: '',
        description: 'Use the two-letter abbreviation for US and Canadian addresses',
    },
    {
        displayName: 'Postal Code',
        name: 'postal_code',
        type: 'string',
        default: '',
        required: true,
    },
    {
        displayName: 'Country Code',
        name: 'country_alpha2',
        type: 'string',
        default: 'US',
        required: true,
        description: 'Two-letter ISO 3166-1 country code',
    },
    {
        displayName: 'Phone',
        name: 'contact_phone',
        type: 'string',
        default: '',
        required: true,
    },
    {
        displayName: 'Email',
        name: 'contact_email',
        type: 'string',
        default: '',
        placeholder: 'name@example.com',
        required: true,
    },
];
function getSingleCollection(executeFunctions, name, itemIndex) {
    const collection = executeFunctions.getNodeParameter(name, itemIndex);
    if (!collection.values) {
        throw new n8n_workflow_1.NodeOperationError(executeFunctions.getNode(), `${name} is required`, { itemIndex });
    }
    return collection.values;
}
class Easyship {
    constructor() {
        this.description = {
            displayName: 'Easyship',
            name: 'easyship',
            icon: { light: 'file:easyship.svg', dark: 'file:easyship.dark.svg' },
            group: ['transform'],
            version: 1,
            subtitle: 'Create Shipment',
            description: 'Create an Easyship shipment and optionally return its PDF label',
            defaults: { name: 'Easyship' },
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            usableAsTool: true,
            credentials: [{ name: 'easyshipApi', required: true }],
            properties: [
                {
                    displayName: 'Sender Address',
                    name: 'senderAddress',
                    type: 'fixedCollection',
                    default: {},
                    required: true,
                    typeOptions: { multipleValues: false },
                    options: [{ displayName: 'Address', name: 'values', values: addressFields }],
                },
                {
                    displayName: 'Recipient Address',
                    name: 'recipientAddress',
                    type: 'fixedCollection',
                    default: {},
                    required: true,
                    typeOptions: { multipleValues: false },
                    options: [{ displayName: 'Address', name: 'values', values: addressFields }],
                },
                {
                    displayName: 'Package',
                    name: 'package',
                    type: 'fixedCollection',
                    default: {},
                    required: true,
                    typeOptions: { multipleValues: false },
                    options: [
                        {
                            displayName: 'Dimensions and Weight',
                            name: 'values',
                            values: [
                                { displayName: 'Length (In)', name: 'length', type: 'number', default: 1, required: true, typeOptions: { minValue: 0.01 } },
                                { displayName: 'Width (In)', name: 'width', type: 'number', default: 1, required: true, typeOptions: { minValue: 0.01 } },
                                { displayName: 'Height (In)', name: 'height', type: 'number', default: 1, required: true, typeOptions: { minValue: 0.01 } },
                                { displayName: 'Weight (Lb)', name: 'weight', type: 'number', default: 1, required: true, typeOptions: { minValue: 0.01 } },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Package Contents',
                    name: 'contents',
                    type: 'fixedCollection',
                    default: {},
                    required: true,
                    typeOptions: { multipleValues: false },
                    options: [
                        {
                            displayName: 'Item',
                            name: 'values',
                            values: [
                                { displayName: 'Category', name: 'category', type: 'string', default: '', required: true, description: 'Easyship item category name or slug' },
                                { displayName: 'Country of Origin', name: 'originCountry', type: 'string', default: 'US', required: true, description: 'Two-letter ISO 3166-1 country code' },
                                { displayName: 'Currency', name: 'declaredCurrency', type: 'string', default: 'USD', required: true, description: 'Three-letter ISO 4217 currency code' },
                                { displayName: 'Declared Value', name: 'declaredCustomsValue', type: 'number', default: 1, required: true, typeOptions: { minValue: 0 } },
                                { displayName: 'Description', name: 'description', type: 'string', default: '', required: true },
                                { displayName: 'HS Code', name: 'hsCode', type: 'string', default: '' },
                                { displayName: 'Quantity', name: 'quantity', type: 'number', default: 1, required: true, typeOptions: { minValue: 1, numberStepSize: 1 } },
                                { displayName: 'SKU', name: 'sku', type: 'string', default: '' },
                            ],
                        },
                    ],
                },
                {
                    displayName: 'Courier Service ID',
                    name: 'courierServiceId',
                    type: 'string',
                    default: '',
                    description: 'Optional. When empty, Easyship selects its best-value available courier.',
                },
                {
                    displayName: 'Create PDF Label',
                    name: 'createLabel',
                    type: 'boolean',
                    default: true,
                    description: 'Whether to buy the label synchronously and return it as binary data',
                },
                {
                    displayName: 'Label Size',
                    name: 'labelSize',
                    type: 'options',
                    options: [
                        { name: '4 × 6', value: '4x6' },
                        { name: 'A4', value: 'A4' },
                        { name: 'A5', value: 'A5' },
                    ],
                    default: '4x6',
                    displayOptions: { show: { createLabel: [true] } },
                },
                {
                    displayName: 'Binary Property',
                    name: 'binaryPropertyName',
                    type: 'string',
                    default: 'label',
                    required: true,
                    displayOptions: { show: { createLabel: [true] } },
                    description: 'Name of the output binary field containing the PDF label',
                },
            ],
        };
    }
    async execute() {
        const inputItems = this.getInputData();
        const outputItems = [];
        const credentials = await this.getCredentials('easyshipApi');
        const baseUrl = credentials.environment === 'production'
            ? 'https://public-api.easyship.com'
            : 'https://public-api-sandbox.easyship.com';
        for (let itemIndex = 0; itemIndex < inputItems.length; itemIndex++) {
            try {
                const sender = getSingleCollection(this, 'senderAddress', itemIndex);
                const recipient = getSingleCollection(this, 'recipientAddress', itemIndex);
                const packageValues = getSingleCollection(this, 'package', itemIndex);
                const contents = getSingleCollection(this, 'contents', itemIndex);
                const createLabel = this.getNodeParameter('createLabel', itemIndex, true);
                const parameters = {
                    sender,
                    recipient,
                    length: packageValues.length,
                    width: packageValues.width,
                    height: packageValues.height,
                    weight: packageValues.weight,
                    description: String(contents.description),
                    category: String(contents.category),
                    quantity: Number(contents.quantity),
                    declaredCurrency: String(contents.declaredCurrency),
                    declaredCustomsValue: Number(contents.declaredCustomsValue),
                    originCountry: String(contents.originCountry),
                    sku: String(contents.sku || ''),
                    hsCode: String(contents.hsCode || ''),
                    courierServiceId: this.getNodeParameter('courierServiceId', itemIndex, ''),
                    createLabel,
                    labelSize: this.getNodeParameter('labelSize', itemIndex, '4x6'),
                };
                const options = {
                    method: 'POST',
                    url: `${baseUrl}/2024-09/shipments`,
                    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                    body: (0, GenericFunctions_1.buildShipmentBody)(parameters),
                    json: true,
                };
                const response = await this.helpers.httpRequestWithAuthentication.call(this, 'easyshipApi', options);
                const result = {
                    json: response,
                    pairedItem: { item: itemIndex },
                };
                if (createLabel) {
                    const documents = (0, GenericFunctions_1.findPdfLabelDocuments)(response);
                    const encodedPages = documents.flatMap((document) => { var _a; return (_a = document.base64_encoded_strings) !== null && _a !== void 0 ? _a : []; });
                    if (encodedPages.length === 0) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Easyship created the shipment but did not return a PDF label. Check the response label_state, account balance, courier availability, and public.label:write scope.', { itemIndex });
                    }
                    const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'label');
                    result.binary = {};
                    for (let pageIndex = 0; pageIndex < encodedPages.length; pageIndex++) {
                        const propertyName = pageIndex === 0 ? binaryPropertyName : `${binaryPropertyName}_${pageIndex + 1}`;
                        result.binary[propertyName] = await this.helpers.prepareBinaryData(Buffer.from(encodedPages[pageIndex], 'base64'), `${propertyName}.pdf`, 'application/pdf');
                    }
                }
                outputItems.push(result);
            }
            catch (error) {
                if (this.continueOnFail()) {
                    outputItems.push({
                        json: inputItems[itemIndex].json,
                        error,
                        pairedItem: { item: itemIndex },
                    });
                    continue;
                }
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, { itemIndex });
            }
        }
        return [outputItems];
    }
}
exports.Easyship = Easyship;
//# sourceMappingURL=Easyship.node.js.map