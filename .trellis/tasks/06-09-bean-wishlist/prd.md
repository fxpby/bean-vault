# BeanVault 豆愿愿望单 MVP

## Goal

Add a first-class "豆愿" wishlist feature to BeanVault. Users can record coffee beans they want to buy, manage those wishlist items independently, and convert a wishlist item into a real Bean inventory entry once purchased.

The feature should keep wishlist data separate from the Bean inventory model while preserving an explicit lifecycle connection through "加入豆仓".

## Problem Statement

BeanVault currently models beans after they are owned: production date, resting days, storage status, drinking lifecycle, and inventory sync. Users also need a place to track beans they may buy later. If wishlist items are forced into the Bean model, the inventory model gets polluted with incomplete or not-yet-owned records. If wishlist is fully isolated with no conversion path, users must re-enter known information when they buy the bean.

## Solution

Create a separate `WishlistItem` model and "豆愿" section in the bottom navigation. Wishlist items have their own CRUD, Supabase sync, search, soft delete, and pages. They can be converted into Bean entries by opening the existing Add Bean page with wishlist data prefilled.

After a Bean is saved from a wishlist source, ask the user whether to keep the wishlist item. The default action is not keeping it; if not kept, soft-delete the wishlist item and navigate to the new Bean detail page.

## User Stories

1. As a coffee enthusiast, I want a "豆愿" bottom navigation entry so I can manage beans I want to buy separately from beans I already own.
2. As a user, I want to add a wishlist item with name, roaster, country, estate/region, variety, process, roast level, flavor notes, price, link, reason, and priority so I can capture enough purchase context.
3. As a user, I want process and roast level in wishlist to be optional so unknown details are not filled with fake defaults.
4. As a user, I want wishlist country to use the existing country selector and country code so flags and conversion to Bean stay reliable.
5. As a user, I want to search wishlist items by name, roaster, country, estate/region, variety, flavor notes, price, URL, and reason.
6. As a user, I want to copy a purchase URL from the wishlist card without displaying the full URL in the card.
7. As a user, I want to click "加入豆仓" from both wishlist card and wishlist detail page, then complete the existing Add Bean form with known wishlist details prefilled.
8. As a user, after saving a Bean from wishlist, I want to choose whether to keep the original wishlist item.
9. As a user, I want deleted wishlist items to disappear after a confirmation, without a separate wishlist recycle bin.
10. As a user, I want to filter and sort wishlist items by purchase priority so I can focus on beans I am more likely to buy soon.

## Confirmed Product Decisions

- Bottom navigation becomes: `豆仓 / 豆愿 / 豆历 / 设置`.
- Wishlist is a separate data model, not another `Bean.status`.
- Wishlist items can convert to Beans through the existing `/add` page.
- Conversion route uses the existing Add Bean page, e.g. `/add?fromWishlist=<id>`.
- After Bean save succeeds, show a confirmation dialog asking whether to keep the wishlist item.
- The default confirmation action is `不保留`; this soft-deletes the wishlist item.
- After either choice, navigate to the newly created Bean detail page.
- Wishlist deletion is UI-simple: confirmation dialog, then hidden. No wishlist recycle bin in MVP.
- Data layer still uses soft delete (`isDeleted: true`) for sync reliability.
- Wishlist data syncs to Supabase in MVP.
- "庄园" UI wording in Bean pages should be updated to "庄园/产区", while keeping the field name `estate`.
- Wishlist list default sort is加入时间, implemented as `createdAt desc`; priority sort orders `must > high > normal > low` and breaks ties by `createdAt desc`.

## Data Model

```ts
export type WishlistPriority = 'low' | 'normal' | 'high' | 'must';

export interface WishlistItem {
  id: string;
  name: string;
  roaster: string;
  country: string;
  countryCode: string;
  estate: string;
  variety: string;
  process?: ProcessMethod;
  roastLevel?: RoastLevel;
  flavorNotes: string[];
  price: string;
  purchaseUrl: string;
  reason: string;
  priority: WishlistPriority;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

Priority labels:

| Value | Label |
| --- | --- |
| `low` | 随缘看看 |
| `normal` | 想买 |
| `high` | 优先买 |
| `must` | 必买 |

## Supabase Schema

Add a new `wishlist_items` table with RLS scoped to the current user.

Expected columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID | client-generated primary key |
| `user_id` | UUID | default `auth.uid()`, references `auth.users(id)` |
| `name` | TEXT | required |
| `roaster` | TEXT | default `''` |
| `country` | TEXT | required in UI |
| `country_code` | TEXT | required in UI |
| `estate` | TEXT | default `''`; UI label "庄园/产区" |
| `variety` | TEXT | default `''` |
| `process` | TEXT | nullable; optional wishlist field |
| `roast_level` | TEXT | nullable; optional wishlist field |
| `flavor_notes` | TEXT[] | default `{}` |
| `price` | TEXT | free-form price text |
| `purchase_url` | TEXT | optional URL |
| `reason` | TEXT | optional reason/notes |
| `priority` | TEXT | `low` / `normal` / `high` / `must`, default `normal` |
| `is_deleted` | BOOLEAN | soft delete |
| `created_at` | TIMESTAMPTZ | ISO sync timestamp |
| `updated_at` | TIMESTAMPTZ | last-write-wins timestamp |

## Conversion Mapping

When opening `/add?fromWishlist=<id>`, prefill `BeanFormData`:

| WishlistItem | BeanFormData |
| --- | --- |
| `name` | `name` |
| `country` | `country` |
| `countryCode` | `countryCode` |
| `estate` | `estate` |
| `variety` | `variety` |
| `process` | `process`, only if present; otherwise keep Add Bean default |
| `roastLevel` | `roastLevel`, only if present; otherwise keep Add Bean default |
| `flavorNotes` | `flavorNotes` |
| roaster / price / purchaseUrl / reason | append to Bean `notes` |

Suggested Bean notes format:

```text
来源：豆愿
烘焙商/店铺：<roaster>
价格：<price>
购买链接：<purchaseUrl>
想买理由：<reason>
```

Only include non-empty lines.

## Pages And Routes

### `/wishlist`

Wishlist list page.

Requirements:

- Header title: `豆愿`.
- Search input at top.
- Default sort: `createdAt desc` (`加入时间`, newest first).
- Priority filter: `全部优先级` plus all priority labels.
- Sort controls: `加入时间` and `优先级`; priority sort orders `必买 / 优先买 / 想买 / 随缘看看`, then加入时间 desc within each priority.
- Filter out `isDeleted`.
- Empty state with prominent add action.
- FAB opens `/wishlist/add`.
- Card click opens `/wishlist/:id`.
- Card shows:
  - name
  - roaster
  - country flag + country
  - estate/region and variety when present
  - priority badge
  - process / roast level when present as labeled bean-attribute chips, not unlabeled tags
  - first 3 flavor tags in a separate labeled flavor group
  - price when present in the footer near purchase actions
  - `加入豆仓` action
  - copy URL icon/button only when `purchaseUrl.trim()` is non-empty
- Card does not render the raw purchase URL.
- Copy URL uses `navigator.clipboard`, stops propagation, and shows toast success/failure.

### `/wishlist/add`

Wishlist add page.

Requirements:

- Required fields: `name`, `country`, `countryCode`.
- Optional fields: roaster, estate, variety, process, roastLevel, flavorNotes, price, purchaseUrl, reason.
- Priority segmented control defaults to `normal`.
- Process and roast level controls allow an explicit "未填写" state.
- Country selector should reuse the existing `COUNTRIES` data and behavior patterns from Add Bean.
- Save creates a wishlist item locally first, then syncs remotely.
- After save, navigate to the new wishlist detail page with history replacement so the detail back button does not return to the stale add form.

### `/wishlist/:id`

Wishlist detail/edit page.

Requirements:

- Shows all wishlist fields.
- Supports edit/save using the same field set as add page.
- Main action: `加入豆仓`.
- Secondary action: copy purchase URL when present.
- Delete action uses centered confirm dialog and soft-deletes the item.
- Deleted/missing item shows a simple not-found state.

### `/add?fromWishlist=<id>`

Existing Add Bean page with wishlist prefill.

Requirements:

- Reads `fromWishlist` query param.
- Looks up wishlist item from wishlist store.
- Prefills form from mapping above.
- Keeps normal Add Bean validation.
- After Bean is created, if source wishlist exists:
  - show confirm dialog: `已加入豆仓。是否保留这条豆愿？`
  - default/primary action: `不保留`
  - secondary action: `保留`
  - `不保留` soft-deletes wishlist item
  - both branches navigate to `/bean/:newBeanId`
- If wishlist source is missing, Add Bean behaves normally.

## State And Sync

Create a dedicated wishlist store, not a large extension of `beanStore`.

Recommended files:

- `src/store/wishlistStore.ts`
- `src/supabase/wishlistSync.ts`
- `src/types/bean.ts` or a new `src/types/wishlist.ts` depending on local convention. If kept in `bean.ts`, keep named exports and avoid circular imports.

Store behavior should mirror Bean store patterns:

- Zustand + `persist` backed by localforage.
- Persist wishlist items and any wishlist list preferences if added later.
- Fire-and-forget remote sync.
- Offline writes queue for retry.
- Remote merge uses `updatedAt` last-write-wins.
- Soft delete uses `isDeleted: true`.

## Implementation Plan

1. Data model and constants
   - Add `WishlistItem` and `WishlistPriority`.
   - Add priority labels/options.
   - Ensure process/roast optional values are handled without fake defaults.

2. Supabase and sync
   - Add migration for `wishlist_items`.
   - Add row conversion helpers using snake_case/camelCase mapping.
   - Add CRUD sync helpers and last-write-wins fetch/merge behavior.

3. Wishlist store
   - Add local persistent Zustand store.
   - Add CRUD actions: add, update, soft delete.
   - Add sync queue and remote sync methods.
   - Add selector/utility for active wishlist items and search.

4. Navigation and routes
   - Add `/wishlist`, `/wishlist/add`, `/wishlist/:id`.
   - Update BottomNav to `豆仓 / 豆愿 / 豆历 / 设置`.

5. Wishlist UI
   - Build list page, card component, add page, detail/edit page.
   - Add priority filter and priority sort while keeping加入时间 as the default sort.
   - Keep card information hierarchy clear: origin/source, bean attributes, flavor, then purchase price/actions.
   - Implement URL copy button and toast feedback.
   - Implement centered confirm dialog for delete.

6. Add Bean integration
   - Read `fromWishlist`.
   - Prefill Bean form from wishlist item.
   - After save, ask whether to keep the wishlist item.
   - Navigate to new Bean detail page.

7. Bean wording consistency
   - Update existing Bean UI label from `庄园` to `庄园/产区`.
   - Keep data field and DB column as `estate`.
   - Update PRD/docs accordingly.

8. Verification
   - Build/typecheck.
   - Run lint if available.
   - Manually verify core flow in the browser:
     - add wishlist item
     - copy purchase URL from card
     - edit wishlist item
     - convert to Bean
     - choose not to keep wishlist
     - confirm navigation to new Bean detail
     - confirm wishlist item disappears

## Acceptance Criteria

- [ ] Bottom nav has four items: `豆仓 / 豆愿 / 豆历 / 设置`.
- [ ] `/wishlist` lists non-deleted wishlist items sorted by加入时间 (`createdAt desc`) by default.
- [ ] `/wishlist` can filter by purchase priority.
- [ ] `/wishlist` can sort by priority (`must > high > normal > low`) with加入时间 as the tie-breaker.
- [ ] Wishlist search matches name, roaster, country, estate, variety, flavor notes, price, purchase URL, and reason.
- [ ] Wishlist add requires name and country, then creates a local item and syncs remotely when possible.
- [ ] Wishlist process and roast level are optional and can be left empty.
- [ ] Wishlist card does not show raw purchase URL but shows a copy button when a URL exists.
- [ ] Copy URL button does not navigate to detail and shows toast feedback.
- [ ] Wishlist detail supports edit, delete, copy URL, and join-bean-vault action.
- [ ] Wishlist delete uses soft delete and hides the item from list.
- [ ] `/add?fromWishlist=<id>` prefills Bean fields from the wishlist item.
- [ ] Saving a Bean from wishlist shows the keep-wishlist confirmation.
- [ ] Choosing `不保留` soft-deletes the wishlist item and navigates to the new Bean detail page.
- [ ] Choosing `保留` leaves the wishlist item and navigates to the new Bean detail page.
- [ ] Bean UI label `庄园` is updated to `庄园/产区` without renaming the `estate` field.
- [ ] Existing Bean CRUD, sync, import/export, and recently added Bean notes still build successfully.

## Out Of Scope

- Wishlist recycle bin or restore UI.
- Purchased history list.
- Wishlist item images.
- Price-per-gram parsing or normalized price calculations.
- Notifications or reminders for wishlist items.
- Browser extension/share-sheet integration for capturing purchase links.
- Merging wishlist item and Bean into one data model.

## Technical Notes

- Current bottom nav already has `豆仓 / 豆历 / 设置`; product docs may still mention older 2-item nav and should be corrected if touched.
- Existing Bean model uses `estate` for UI label `庄园`; this task changes UI wording only.
- Existing Add Bean page now includes `notes`, which should receive wishlist metadata during conversion.
- Existing Supabase Bean table uses text columns for enums; wishlist should follow the same flexibility pattern.
- Existing sync uses local-first writes and `updatedAt` last-write-wins; wishlist should mirror this behavior to avoid surprising cross-device behavior.

## Open Questions

None for MVP. Revisit after implementation if field density or navigation crowding feels heavy in browser verification.
