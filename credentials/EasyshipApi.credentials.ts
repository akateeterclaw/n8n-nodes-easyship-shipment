import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EasyshipApi implements ICredentialType {
	name = 'easyshipApi';

	displayName = 'Easyship API';

	icon: Icon = {
		light: 'file:../nodes/Easyship/easyship.svg',
		dark: 'file:../nodes/Easyship/easyship.dark.svg',
	};

	documentationUrl = 'https://developers.easyship.com/reference/introduction';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Easyship bearer token with public.shipment:write and public.label:write scopes',
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

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL:
				'={{$credentials.environment === "production" ? "https://public-api.easyship.com" : "https://public-api-sandbox.easyship.com"}}',
			url: '/2024-09/account',
			method: 'GET',
		},
	};
}
