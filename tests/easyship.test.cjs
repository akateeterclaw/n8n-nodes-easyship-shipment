const assert = require('node:assert/strict');
const test = require('node:test');
const {
	buildShipmentBody,
	findPdfLabelDocuments,
	getAddressValidationIssues,
} = require('../dist/nodes/Easyship/GenericFunctions.js');

const address = {
	line_1: '123 Main St',
	line_2: '',
	city: 'Denver',
	state: 'CO',
	postal_code: '80202',
	country_alpha2: 'US',
	company_name: 'Example Co',
	contact_name: 'Jane Doe',
	contact_phone: '+13035550100',
	contact_email: 'jane@example.com',
};

test('builds a shipment using inches and pounds and requests a synchronous PDF label', () => {
	const body = buildShipmentBody({
		sender: address,
		recipient: { ...address, line_1: '456 Oak Ave' },
		length: 12,
		width: 9,
		height: 4,
		weight: 2.5,
		description: 'T-shirt',
		category: 'fashion',
		quantity: 1,
		declaredCurrency: 'usd',
		declaredCustomsValue: 25,
		originCountry: 'us',
		createLabel: true,
		labelSize: '4x6',
	});

	assert.deepEqual(body.shipping_settings.units, { dimensions: 'in', weight: 'lb' });
	assert.equal(body.shipping_settings.buy_label, true);
	assert.equal(body.shipping_settings.buy_label_synchronous, true);
	assert.equal(body.shipping_settings.printing_options.format, 'pdf');
	assert.deepEqual(body.parcels[0].box, { length: 12, width: 9, height: 4 });
	assert.equal(body.parcels[0].total_actual_weight, 2.5);
	assert.equal(body.origin_address.line_2, undefined);
});

test('finds only PDF label documents', () => {
	const documents = findPdfLabelDocuments({
		shipment: {
			shipping_documents: [
				{ category: 'label', format: 'pdf', base64_encoded_strings: ['JVBERg=='] },
				{ category: 'packing_slip', format: 'pdf', base64_encoded_strings: ['ignored'] },
			],
		},
	});

	assert.equal(documents.length, 1);
	assert.deepEqual(documents[0].base64_encoded_strings, ['JVBERg==']);
});

test('reports incomplete recipient data before an API request is made', () => {
	const issues = getAddressValidationIssues(
		{
			...address,
			line_1: '',
			postal_code: '',
			contact_phone: '',
			contact_email: '',
		},
		'recipient',
	);

	assert.deepEqual(issues, [
		'recipient.line_1 is missing',
		'recipient.postal_code is missing',
		'recipient.contact_phone is missing',
		'recipient.contact_email is missing',
	]);
});

test('requires a state for countries where Easyship mandates one', () => {
	const issues = getAddressValidationIssues({ ...address, state: '' }, 'sender');
	assert.deepEqual(issues, ['sender.state is missing for US']);
});
