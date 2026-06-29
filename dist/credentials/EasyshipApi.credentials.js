"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyshipApi = void 0;
class EasyshipApi {
    constructor() {
        this.name = 'easyshipApi';
        this.displayName = 'Easyship API';
        this.icon = {
            light: 'file:../nodes/Easyship/easyship.svg',
            dark: 'file:../nodes/Easyship/easyship.dark.svg',
        };
        this.documentationUrl = 'https://developers.easyship.com/reference/introduction';
        this.properties = [
            {
                displayName: 'API Token',
                name: 'apiToken',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                required: true,
                description: 'Easyship bearer token with public.shipment:write and public.label:write scopes',
            },
            {
                displayName: 'Environment',
                name: 'environment',
                type: 'options',
                options: [
                    { name: 'Production', value: 'production' },
                    { name: 'Sandbox', value: 'sandbox' },
                ],
                default: 'sandbox',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '=Bearer {{$credentials.apiToken}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.environment === "production" ? "https://public-api.easyship.com" : "https://public-api-sandbox.easyship.com"}}',
                url: '/2024-09/account',
                method: 'GET',
            },
        };
    }
}
exports.EasyshipApi = EasyshipApi;
//# sourceMappingURL=EasyshipApi.credentials.js.map