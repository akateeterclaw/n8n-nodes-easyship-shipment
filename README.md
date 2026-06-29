# n8n Easyship Shipment node

Creates an Easyship shipment from separate sender and recipient address fields. Package dimensions are entered in inches and weight in pounds. The node can buy the label synchronously and return each PDF page as n8n binary data.

## Install locally

```bash
npm install
npm run build
```

Install the package into your self-hosted n8n instance using the community nodes UI, or link/copy the built package into the n8n custom extensions directory.

## Easyship credential

Create an Easyship API token with these scopes:

- `public.shipment:write`
- `public.label:write` when **Create PDF Label** is enabled

Use a sandbox token with the Sandbox environment. Sandbox labels and rates are illustrative only.

## Output

The Easyship JSON response is returned in `json`. With **Create PDF Label** enabled, the first PDF is returned in `binary.label` by default. Additional PDF pages are returned as `binary.label_2`, `binary.label_3`, and so on.

Easyship charges the account and books the courier when a label is purchased. Leave **Create PDF Label** disabled while first validating address, customs, and courier settings.

## API behavior

This node targets Easyship API `2024-09` and sends:

- separate `origin_address`/`sender_address` and `destination_address` objects;
- one parcel with `box.length`, `box.width`, and `box.height` in inches;
- `total_actual_weight` in pounds;
- one customs/content item;
- `shipping_settings.buy_label` and `buy_label_synchronous` for one-call PDF generation.

If no courier service ID is supplied, Easyship selects its best-value available courier. Label purchase requires sufficient Easyship balance and a courier that supports the shipment.
