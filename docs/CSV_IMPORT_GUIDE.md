# CSV Import Guide

## Overview

TradeBinder supports bulk inventory import from ManaBox CSV exports. This allows you to quickly import your entire MTG card collection into the system.

## Accessing the Import Feature

1. Login as an admin or staff user
2. Navigate to **Dashboard → Import CSV**
3. Or visit directly: `/inventory/import`

## CSV Format Requirements

### Required Columns

Your CSV file **must** include these columns from ManaBox:

- **Name** - The card name
- **Set code** - MTG set abbreviation (e.g., "BLB", "ECL")
- **Scryfall ID** - Unique identifier for the card
- **Quantity** - Number of cards to import
- **Condition** - Card condition (see mapping below)

### Optional Columns

These columns will be imported if present:

- **Set name** - Full set name
- **Collector number** - Card number in set
- **Rarity** - Card rarity (common, uncommon, rare, mythic)
- **Foil** - "foil" or "normal"
- **Language** - Language code (defaults to "en")
- **Purchase price** - Your cost per card
- **Purchase price currency** - Currency code (e.g., "USD")

## ManaBox Export Steps

1. Open ManaBox app
2. Go to **Collection**
3. Tap **Export**
4. Select **CSV format**
5. Choose **All fields**
6. Save the file
7. Upload to TradeBinder

## Condition Mapping

ManaBox conditions are automatically mapped to TradeBinder format:

| ManaBox Condition | TradeBinder | Description |
|-------------------|-------------|-------------|
| near_mint | NM | Near Mint |
| lightly_played | LP | Lightly Played |
| moderately_played | MP | Moderately Played |
| heavily_played | HP | Heavily Played |
| damaged | DMG | Damaged |

## Pricing Logic

### Automatic Price Calculation

If you include purchase prices in your CSV:

1. Purchase price is converted from USD to PHP (rate: ₱56.00/USD)
2. Sell price is automatically set to **1.5x the purchase price**
3. Prices are rounded up to whole pesos

**Example:**
- Purchase price: $2.49 USD
- Cost in PHP: ₱139.44
- Sell price: ₱210 (1.5x, rounded up)

### Manual Price Adjustment

You can adjust prices later in the inventory management page.

## Import Process

### What Happens During Import

1. **CSV Validation** - File is checked for required columns
2. **Card Lookup** - System checks if cards exist in database
3. **Card Creation** - New cards are added automatically
4. **Inventory Update** - Quantities are added to existing inventory or new entries created
5. **Results Report** - Detailed summary of import success/errors

### Duplicate Handling

If a card already exists in your inventory:
- The **quantity is added** to existing stock
- Prices are updated to match the import
- No duplicate entries are created

## Example CSV Format

```csv
Name,Set code,Set name,Collector number,Foil,Rarity,Quantity,ManaBox ID,Scryfall ID,Purchase price,Misprint,Altered,Condition,Language,Purchase price currency
Gran-Gran,PW25,Wizards Play Network 2025,14,normal,rare,2,109595,6fc7d4ed-9e30-4daa-997d-6916c916c5fd,2.49,FALSE,FALSE,near_mint,en,USD
Goblin Bombardment,SCH,Store Championships,45,normal,rare,2,110280,18a9fb7b-780c-46c7-9a5f-f9abb3c353df,6.49,FALSE,FALSE,near_mint,en,USD
Fabled Passage,BLB,Bloomburrow,252,foil,rare,1,96075,8809830f-d8e1-4603-9652-0ad8b00234e9,6.99,FALSE,FALSE,near_mint,en,USD
```

## Import Results

After upload, you'll see a detailed report:

- **Total Rows** - Number of cards in CSV
- **Inserted** - New inventory entries created
- **Updated** - Existing entries with quantity added
- **Skipped** - Rows with errors
- **Errors** - Detailed list of any issues

### Common Errors

| Error Message | Solution |
|---------------|----------|
| "Missing required fields" | Ensure Name, Set code, Scryfall ID, Quantity, and Condition are present |
| "Invalid quantity" | Quantity must be a positive number |
| "Incomplete row" | Check for missing commas or malformed data |
| "Invalid condition" | Condition must be one of the supported values |

## Best Practices

### Before Importing

1. **Backup your data** - Export current inventory first
2. **Test with small file** - Try importing 10-20 cards first
3. **Check CSV format** - Open in text editor to verify structure
4. **Verify prices** - Confirm purchase prices are accurate

### File Size Limits

- Maximum file size: **10MB**
- Recommended batch size: **500-1000 cards per import**
- For larger collections: split into multiple files

### Performance Tips

- Import during off-peak hours for faster processing
- Close other browser tabs during import
- Don't refresh page while import is in progress

## Authentication Requirements

- Only **admin** and **staff** users can import inventory
- Customer accounts cannot access import feature
- Login required before accessing import page

## Troubleshooting

### Import Fails Immediately

- Check file extension is `.csv`
- Verify you're logged in with admin/staff account
- Ensure file is not corrupted

### Partial Import Success

- Review error list for specific row issues
- Fix problematic rows in CSV
- Re-import corrected file (quantities will be added)

### Prices Look Wrong

- Verify purchase prices in original CSV
- Check USD to PHP conversion rate (₱56/USD)
- Manually adjust prices in inventory page if needed

### Cards Not Showing Up

- Check that quantity > 0
- Verify import success report shows "inserted" or "updated"
- Refresh inventory page
- Check filters aren't hiding cards

## Support

For issues with CSV import:

1. Check this guide first
2. Review error messages in import results
3. Contact: erix.due@gmail.com

## Technical Details

### API Endpoint

```
POST /api/inventory/import
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

### Response Format

```json
{
  "total": 100,
  "inserted": 85,
  "updated": 10,
  "skipped": 5,
  "errors": [
    { "row": 23, "message": "Missing required fields" },
    { "row": 47, "message": "Invalid quantity" }
  ]
}
```

## Changelog

### Version 1.0 (February 2026)

- Initial CSV import feature
- ManaBox format support
- Automatic price calculation
- Condition mapping
- Duplicate detection and merging
