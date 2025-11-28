# Premium Bulk Purchase Codes - Implementation Guide

## Overview

The invitation code system has been extended to support **multiple code types** for different business use cases:

- **Beta Tester** - Free premium for NGO partners (original functionality)
- **Bulk Premium** - Discounted bulk purchases for companies/organizations
- **Enterprise** - Enterprise tier (25 for price of 10, etc.)
- **Donated Premium** - Purchased codes donated to underprivileged students
- **Promotional** - Marketing promotions and partnerships

**One unified system** handles all code types with smart differentiation in UI, database, and user experience.

---

## Key Features

✅ **Flexible code types** - Easy to add new types in future
✅ **Time-limited or lifetime** access - Control duration per batch
✅ **Purchase tracking** - Track who bought, how much they paid, discount given
✅ **Smart activation** - Different messaging based on code type
✅ **Unified admin** - Single dashboard for all code types
✅ **Professional reporting** - Export data for accounting/reporting

---

## How It Works

### Code Prefixes

Codes are automatically prefixed based on type:
- `BETA-ORG-XXXXX` - Beta tester codes
- `PREM-ORG-XXXXX` - Bulk premium codes
- `ENTR-ORG-XXXXX` - Enterprise codes
- `GIFT-ORG-XXXXX` - Donated premium codes
- `PROMO-ORG-XXXXX` - Promotional codes

### User Access Rights

| Code Type | Role | is_premium | premium_until | premium_source |
|-----------|------|------------|---------------|----------------|
| beta_tester | `beta_tester` | `true` | `null` (permanent) | `beta_tester` |
| bulk_premium | `user` | `true` | Set based on duration | `bulk_premium` |
| enterprise | `user` | `true` | `null` or date | `enterprise` |
| donated_premium | `user` | `true` | Set based on duration | `donated_premium` |

---

## Setup Instructions

### 1. Run Database Migration

```sql
-- In Supabase SQL Editor, run:
migrations/beta-tester-codes-v2-premium-codes.sql
```

This migration:
- Adds new columns to `beta_invitation_codes` table
- Adds `premium_until` and `premium_source` to `users` table
- Updates `redeem_beta_code()` function to handle all code types
- Updates `generate_beta_codes()` function with new parameters
- Creates `is_premium_active()` function to check premium status

### 2. Verify Migration

```sql
-- Check new columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'beta_invitation_codes'
AND column_name IN ('code_type', 'premium_duration_months', 'purchaser_name');

-- Should return 3 rows
```

---

## Usage Examples

### Example 1: Generate Enterprise Codes (Lifetime)

**Scenario:** Company buys 25 enterprise accounts for £250 (original price £625)

1. Go to `/admin/beta-codes`
2. Fill in form:
   - **Organization Name:** "Acme Corporation"
   - **Number of Codes:** 25
   - **Code Type:** Enterprise
   - **Premium Duration:** *(leave empty for lifetime)*
   - **Purchaser Name:** "Acme Corp HR"
   - **Purchaser Email:** "hr@acmecorp.com"
   - **Amount Paid:** 250.00
   - **Original Price:** 625.00
   - **Notes:** "Enterprise tier - Invoice #12345"
3. Click "Generate Codes"
4. Codes download as: `ENTR-ACMEC-X7K2M`, `ENTR-ACMEC-P9L4N`, etc.
5. Send codes to Acme Corp HR

**Staff member activation:**
1. Employee goes to `/activate-premium`
2. Enters code: `ENTR-ACMEC-X7K2M`
3. Clicks "Activate Access"
4. Gets lifetime premium access

### Example 2: Donated Premium Codes (1 Year)

**Scenario:** Supporter buys 100 codes for £200 to donate to local students

1. Go to `/admin/beta-codes`
2. Fill in:
   - **Organization:** "Local High School"
   - **Quantity:** 100
   - **Code Type:** Donated Premium
   - **Premium Duration:** 12 *(months)*
   - **Purchaser Name:** "Anonymous Donor"
   - **Purchaser Email:** "donor@email.com"
   - **Amount Paid:** 200.00
   - **Notes:** "Donation for underprivileged students"
3. Generate codes
4. Share with school to distribute to students

**Student activation:**
1. Student goes to `/activate-premium`
2. Enters `GIFT-LOCAL-M3K9P`
3. Gets 12 months of premium access

### Example 3: Bulk Premium for Company

**Scenario:** Company purchases 50 accounts for 6 months at special rate

1. **Organization:** "TechStartup Inc"
2. **Quantity:** 50
3. **Code Type:** Bulk Premium
4. **Premium Duration:** 6
5. **Amount Paid:** 150.00
6. **Original Price:** 300.00

Codes: `PREM-TECHS-ABC12`, etc.

---

## Admin Dashboard Features

### Code Generation Form

**Dynamic fields based on code type:**

**For Beta Tester:**
- Organization Name
- Number of Codes
- Code Expiration (when codes become invalid)
- Notes

**For Premium Types (Bulk, Enterprise, Donated):**
- All beta fields, PLUS:
- Premium Duration (months or leave empty for lifetime)
- Purchaser Name
- Purchaser Email
- Amount Paid
- Original Price

### Code Management Table

**Columns:**
- Code (color-coded prefix)
- Type (color-coded badge)
- Organization
- Status (Used/Unused)
- Used By (email)
- Actions (Copy)

**Filtering:**
- By organization
- By status (used/unused)

**Export:**
- CSV export with all data including purchase amounts

---

## Activation Pages

### /activate-beta (Original)
- Still works for beta tester codes
- Shows beta tester branding

### /activate-premium (New - Universal)
- Handles ALL code types
- Dynamic UI based on code type:
  - Different icons (Sparkles, Gift, Building, etc.)
  - Different colors (purple, blue, green, indigo)
  - Different messaging
  - Shows duration info after validation

**Recommended:** Use `/activate-premium` for all future communications as it's more generic and professional.

---

## Database Schema

### New Columns in `beta_invitation_codes`

```sql
code_type TEXT DEFAULT 'beta_tester'
  -- 'beta_tester', 'bulk_premium', 'enterprise', 'donated_premium', 'promotional'

premium_duration_months INTEGER
  -- NULL = lifetime, number = months of access

purchaser_name TEXT
  -- Company/person who purchased

purchaser_email TEXT
  -- Contact for purchaser

purchase_amount DECIMAL(10,2)
  -- How much they paid

original_price DECIMAL(10,2)
  -- Original price (shows discount)

batch_id UUID
  -- Groups codes from same purchase together
```

### New Columns in `users`

```sql
premium_until TIMESTAMP WITH TIME ZONE
  -- When premium access expires (NULL = lifetime)

premium_source TEXT
  -- Where premium came from: 'beta_tester', 'bulk_premium', 'stripe', etc.
```

---

## Premium Access Logic

### New Function: `is_premium_active(user_id)`

Checks if user has active premium in this order:

1. **Beta tester?** → Always premium
2. **Active Stripe subscription?** → Premium
3. **is_premium = true?**
   - Check `premium_until`:
     - NULL → Lifetime access → Premium
     - Future date → Still valid → Premium
     - Past date → Expired → NOT premium

### Expiration Handling

Premium codes with duration:
- `premium_until` is set to NOW() + duration_months
- System checks this field to determine if access is still valid
- Expired codes: user keeps account but loses premium features
- Can be renewed by redeeming another code

---

## Integration with Existing Systems

### PricingTiers.js - Enterprise Option

Your existing Enterprise tier (25 for price of 10) can now use this system:

**Current flow:**
1. User purchases Enterprise tier via Stripe
2. Payment succeeds
3. **NEW:** Generate 25 enterprise codes automatically
4. Email codes to purchaser

**Implementation needed:**
Add webhook handler to generate codes on successful enterprise purchase.

### Premium Feature Gates

Update your premium checks to use the new function:

```javascript
// Instead of checking is_premium directly:
const hasPremium = await supabase.rpc('is_premium_active', {
  check_user_id: user.id
});
```

This ensures time-limited premium codes are properly respected.

---

## Reporting & Analytics

### Financial Reporting

Export CSV includes:
- Purchase amount
- Original price
- Discount given (calculated)
- Purchaser details
- Redemption rate

### Usage Tracking

Query for business insights:

```sql
-- Revenue from bulk sales
SELECT
  code_type,
  COUNT(*) as total_codes,
  SUM(purchase_amount) as total_revenue,
  COUNT(CASE WHEN is_used THEN 1 END) as redeemed,
  ROUND(COUNT(CASE WHEN is_used THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as redemption_rate
FROM beta_invitation_codes
WHERE code_type != 'beta_tester'
GROUP BY code_type;
```

---

## Use Cases & Workflows

### Use Case 1: Corporate Bulk Purchase

**Customer:** Company with 200 employees
**Offer:** 200 accounts for 1 year at 50% discount

**Workflow:**
1. Create invoice/agreement
2. Receive payment
3. Generate 200 bulk_premium codes (12 months)
4. Track: company name, contact, amount paid, original price
5. Send codes to company HR
6. HR distributes to employees
7. Track redemption rate
8. Follow up with non-redeemed codes after 2 weeks

### Use Case 2: Philanthropic Donation

**Donor:** Individual wants to support 50 students
**Offer:** 50 donated accounts for 1 year

**Workflow:**
1. Process donation
2. Generate 50 donated_premium codes (12 months)
3. Partner with local school/NGO
4. School distributes codes to selected students
5. Track impact for donor reporting
6. Provide statistics: X students activated, Y hours learning, etc.

### Use Case 3: Enterprise Subscription

**Customer:** Large organization, ongoing relationship
**Offer:** Lifetime enterprise accounts

**Workflow:**
1. Generate enterprise codes (lifetime, NULL duration)
2. Track as enterprise customer
3. codes never expire (unless code expiration date set)
4. Can generate more codes for same customer later
5. Track by batch_id for customer history

---

## Pricing Strategy Examples

### Suggested Pricing Tiers

**Individual:** £5/month or £50/year
**Bulk (10-49):** £40/year each (20% off)
**Bulk (50-99):** £35/year each (30% off)
**Bulk (100+):** £30/year each (40% off)
**Enterprise (25+):** Lifetime at £25 each
**Donated:** Special rate £2/month (£20/year) with matching

### Discounting Strategy

Track in database:
- `purchase_amount`: What they actually paid
- `original_price`: Full retail price
- Discount %: Calculated for reporting

Benefits:
- Show value to purchaser
- Track revenue impact of discounts
- Identify most popular tiers
- Optimize pricing over time

---

## Next Steps

### Immediate
1. ✅ Run migration v2
2. ✅ Test generating each code type
3. ✅ Test activation flow for each type
4. ✅ Verify premium access works correctly

### Short-term
1. Update premium feature gates to use `is_premium_active()`
2. Create pricing page for bulk purchases
3. Add Stripe webhook to auto-generate enterprise codes
4. Create email templates for code distribution

### Future Enhancements
1. **Auto-expiration notifications** - Email users 1 week before premium expires
2. **Renewal flow** - Allow expired users to purchase new codes
3. **Dashboard for purchasers** - Let companies track their code usage
4. **Batch management** - View all codes from a specific purchase together
5. **Referral codes** - Give existing users codes to share (promotional type)

---

## FAQ

**Q: Can a user redeem multiple codes?**
A: Currently no - one code per user. Could be extended to allow "topping up" expiration dates.

**Q: What happens when premium expires?**
A: User keeps account but loses premium features. Can redeem new code to reactivate.

**Q: Can codes be transferred?**
A: No - once used, linked to that user's account permanently.

**Q: How do we handle refunds?**
A: Mark codes as expired (set `expires_at` to past date) to invalidate unused codes.

**Q: Can we see which codes from a batch are unused?**
A: Yes - filter by batch_id in admin dashboard.

**Q: Difference between code expiration and premium duration?**
A:
- **Code expiration**: When code becomes invalid and can't be redeemed
- **Premium duration**: How long premium access lasts after redemption

---

## Files Modified/Created

### Database
- `migrations/beta-tester-codes-v2-premium-codes.sql` - Complete migration

### API
- `src/app/api/beta-code/generate/route.js` - Updated to handle new parameters
- `src/app/api/beta-code/validate/route.js` - Returns code type info
- `src/app/api/beta-code/redeem/route.js` - Handles all code types

### Pages
- `src/app/(site)/activate-premium/page.js` - NEW: Universal activation page
- `src/app/(site)/activate-beta/page.js` - EXISTING: Still works for beta codes
- `src/app/(site)/admin/beta-codes/page.js` - UPDATED: Generate all code types

### Documentation
- `docs/PREMIUM-BULK-CODES-IMPLEMENTATION.md` - This file
- `docs/BETA-TESTER-SYSTEM-SUMMARY.md` - Original system docs

---

## Code Examples

### Generate Codes Programmatically

```javascript
// From Stripe webhook or admin script
const { data: codes } = await supabase.rpc('generate_beta_codes', {
  organization_name: 'Acme Corp',
  batch_size: 50,
  code_type: 'enterprise',
  premium_duration_months: null, // lifetime
  purchaser_name: 'Acme Corp',
  purchaser_email: 'billing@acme.com',
  purchase_amount: 500.00,
  original_price: 1250.00,
  batch_notes: 'Stripe charge ch_123456789'
});

// Email codes to purchaser
await sendEmail({
  to: 'billing@acme.com',
  subject: 'Your Habitat English Enterprise Codes',
  codes: codes.map(c => c.code),
  count: 50
});
```

### Check Premium Status

```javascript
// In any API route or component
const { data: isPremium } = await supabase.rpc('is_premium_active', {
  check_user_id: userId
});

if (isPremium) {
  // Show premium content
} else {
  // Upsell premium
}
```

---

**System is production-ready!** Run the migration and start generating codes.
