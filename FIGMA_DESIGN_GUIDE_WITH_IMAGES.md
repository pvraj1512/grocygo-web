# GrocyGo Figma Design Guide - Complete Layout & Image Placement

## 📱 Page Layouts & Screenshot Reference

### Page 1: HERO PAGE (Landing Page)
**Size**: 1920x1080px  
**Background**: `#101418` (dark)

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│  [NAVBAR]                               │
│  Logo | Nav Items | Theme Toggle        │
├─────────────────────────────────────────┤
│                                         │
│        HERO SECTION (Center)            │
│                                         │
│  Heading: "GrocyGo"                     │
│  Tagline: "Smart Grocery & Meal         │
│           Management for the Future.    │
│           AI-powered, collaborative,    │
│           and beautiful."               │
│                                         │
│  [Get Started Button - Teal #2F9E89]   │
│                                         │
└─────────────────────────────────────────┘
```

**WHERE TO ADD IMAGES**:
- **Logo Area**: Place GrocyGo logo (in navbar, top-left) - `📁 assets/logo/`
- **Hero Background**: Optional hero image (full-width banner behind text)
- **Side Illustration** (optional): Grocery/meal planning themed illustration

---

### Page 2: AUTH PAGE (Login/Signup)
**Size**: 1920x1080px  
**Background**: `#101418`

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│  [NAVBAR - Minimal]                     │
├─────────────────────────────────────────┤
│                                         │
│            [Dialog Box]                 │
│     ┌──────────────────────┐           │
│     │ Welcome to GrocyGo   │           │
│     │ [LOGIN] [SIGN UP]    │           │
│     │                      │           │
│     │ Email:     [......] │           │
│     │ Password:  [.....] │           │
│     │ (Name:     [.......] │ for signup)
│     │                      │           │
│     │ [LOGIN/SIGNUP BTN]   │           │
│     │ Error message area   │           │
│     └──────────────────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

**WHERE TO ADD IMAGES**:
- **Logo in Dialog**: GrocyGo logo at top of dialog
- **Background**: Optional decorative pattern/gradient behind dialog

---

### Page 3: INVENTORY PAGE
**Size**: 1920x1080px  
**Background**: `#101418`

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│  [NAVBAR with Menu]                     │
├─────────────────────────────────────────┤
│ Inventory                               │
│ Manage your kitchen items and track     │
│ expiry dates                            │
│                                         │
│ [Search....]  [Add Item] [Refresh]     │
├─────────────────────────────────────────┤
│ Name | Quantity | Unit | Location |    │
│ Expiry | Action                         │
├─────────────────────────────────────────┤
│ [Empty State or Table Rows]             │
│                                         │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**WHERE TO ADD IMAGES**:
- **Search Icon**: Search icon in search field
- **Add Item Icon**: Plus icon on "Add Item" button
- **Refresh Icon**: Refresh/reload icon
- **Action Icons**: Edit & Delete icons in table rows
- **Empty State**: Illustration showing empty inventory (optional)

---

### Page 4: RECIPES PAGE
**Size**: 1920x1080px  
**Background**: `#101418`

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│  [NAVBAR]                               │
├─────────────────────────────────────────┤
│ Recipes                                 │
│ Save and manage your favorite recipes   │
│ [REFRESH]  [ADD RECIPE]                 │
│                                         │
│ Recipes per Cuisine (Chart Section)     │
│ ┌────────────────────────────────────┐  │
│ │      [PIE CHART DISPLAY]           │  │
│ │    • Recipes (Legend)              │  │
│ └────────────────────────────────────┘  │
│                                         │
│ Suggested Recipes (AI)                  │
│ [REFRESH] [All Courses ▼] [All Diets▼] │
│                                         │
│ "No suggestions found" or Grid of cards │
│                                         │
└─────────────────────────────────────────┘
```

**WHERE TO ADD IMAGES**:
- **Recipe Cards** (Grid): Each recipe card should have:
  - Recipe image/placeholder (front-and-center, top of card)
  - Recipe name (below image)
  - Difficulty badge icon
  - Edit/Delete action icons
- **Chart**: Pie chart showing recipes per cuisine
- **Icons**: Refresh, dropdown arrows

---

### Page 5: MEAL PLANS PAGE
**Size**: 1920x1080px  
**Background**: `#101418`

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│  [NAVBAR]                               │
├─────────────────────────────────────────┤
│ Weekly Meal Plans                       │
│ [< Prev Week] [Mon-Sun dates] [Next >] │
│                                         │
│ ┌─────┬──────┬──────┬──────┬───┬───┬──┐│
│ │ Mon │ Tue  │ Wed  │ Thu  │Fri│Sat│Su││
│ ├─────┼──────┼──────┼──────┼───┼───┼──┤│
│ │Break│Lunch │Dinner│      │   │   │  ││
│ │fest │      │      │      │   │   │  ││
│ │[+]  │[+]   │[+]   │[+]   │[+]│[+]│[+]││
│ │ X   │ Y    │ Z    │      │   │   │  ││
│ │     │      │      │      │   │   │  ││
│ └─────┴──────┴──────┴──────┴───┴───┴──┘│
│                                         │
│ Suggested Meals [AI Generate]           │
│ [Refresh]                               │
│ ┌─────────────┐  ┌─────────────┐       │
│ │ Meal Card 1 │  │ Meal Card 2 │       │
│ │  [image]    │  │  [image]    │       │
│ │  Name       │  │  Name       │       │
│ │  [Add]      │  │  [Add]      │       │
│ └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────┘
```

**WHERE TO ADD IMAGES**:
- **Meal Cards**: Meal image (large, at top of card)
- **Suggested Meals Grid**: Each meal has thumbnail image
- **Icons**: Add/plus icons, prev/next arrows
- **Meal Slots**: Small food icons representing breakfast/lunch/dinner

---

### Page 6: SHOPPING LISTS PAGE
**Size**: 1920x1080px  
**Background**: `#101418`

**Layout Structure**:
```
┌──────────────────────────┬──────────────────┐
│ [NAVBAR]                 │                  │
├──────────────────────────┼──────────────────┤
│ Shopping Lists           │ Smart Shopping   │
│ [+ New List]             │ Suggestions      │
│                          │                  │
│ Active Lists:            │ Based on your    │
│ ┌────────────────────┐   │ inventory:       │
│ │ List 1 (5 items)  │   │                  │
│ │ ☐ Item A         │   │ ☐ Tomato [Add] │
│ │ ☐ Item B         │   │ ☐ Onion [Add]  │
│ │ ☐ Item C         │   │ ☐ Oil [Add]    │
│ │ ☐ Item D         │   │ ☐ Salt [Add]   │
│ │ ☐ Item E         │   │                  │
│ │ [Edit] [Delete]   │   │                  │
│ └────────────────────┘   │                  │
│                          │                  │
│ List 2                   │                  │
│ ┌────────────────────┐   │                  │
│ │ Items...          │   │                  │
│ └────────────────────┘   │                  │
└──────────────────────────┴──────────────────┘
```

**WHERE TO ADD IMAGES**:
- **Checkbox Icons**: Check/unchecked icons
- **Delete Icon**: Trash/delete icon
- **Edit Icon**: Pencil icon
- **Add Icon**: Plus icon next to suggestions
- **List Icons**: Shopping bag icon for each list

---

### Page 7: ANALYTICS PAGE
**Size**: 1920x1080px  
**Background**: `#101418`

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│  [NAVBAR]                               │
├─────────────────────────────────────────┤
│ Analytics                               │
│ Dashboard - [Date Range Picker]         │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │  Metric  │ │  Metric  │ │  Metric  │ │
│ │   123    │ │   456    │ │    78%   │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │      Line Chart - Usage Trends      │ │
│ │  [Chart Area with gridlines]        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────┐  ┌─────────────────┐   │
│ │ Bar Chart   │  │   Pie Chart     │   │
│ │ Category    │  │   Meal Type     │   │
│ │ Breakdown   │  │   Distribution  │   │
│ └─────────────┘  └─────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**WHERE TO ADD IMAGES**:
- **Metric Icons**: Chart/stats icon for each metric card
- **Charts**: Line chart, bar chart, pie chart
- **Chart Legends**: Legend icons and labels

---

## 🎨 Color Codes for Figma

### Dark Mode (Primary)
- Background: `#101418`
- Paper: `#1A1F24`
- Card: `#20262C`
- Text: `#F0F3F8`
- Secondary Text: `#A6B2C2`
- Primary Button: `#2F9E89`
- Secondary Button: `#FF7A59`
- Borders: `#38424D`

### Light Mode (Alternative)
- Background: `#F6FCFA`
- Paper: `#FFFFFF`
- Text: `#1C1F23`
- Borders: `#D1D9E0`

---

## 📐 Component Sizes in Figma

| Component | Width | Height | Notes |
|-----------|-------|--------|-------|
| Page Frame | 1920px | 1080px | Standard desktop |
| Button | 120-200px | 44px | Padding: 12px 24px |
| Input Field | 100% | 44px | Full width |
| Card | 300-400px | 350-450px | For recipe/meal cards |
| Icon | 24x24px | or 48x48px | Buttons use 24px, headers use 48px |
| Navigation Bar | 1920px | 64px | Fixed height |
| Dialog | 400px | max 600px | Centered modal |
| Table Row | 1920px | 56px | Standard height |

---

## 🖼️ Image Placement Instructions for Figma AI

When using Figma AI to generate designs, specify:

```
1. TOP NAVIGATION (All pages):
   - Logo area: Place GrocyGo logo image (100x100px)
   - Right side: Icons for theme toggle, user menu

2. HERO PAGE:
   - Full-width background image (optional, 1920x600px)
   - Centered text overlay

3. RECIPE CARDS:
   - Image area: 100% width x 200px height
   - Rounded corners on top
   - Placeholder: Food/meal images
   - Text content below: Recipe name, difficulty, tags

4. MEAL PLAN CARDS:
   - Image area: 100% width x 150px height
   - Meal name and details below

5. CHARTS:
   - Analytics page: 3 chart areas
     - Line chart: 600x300px
     - Bar chart: 400x300px
     - Pie chart: 400x300px

6. EMPTY STATES:
   - Inventory/Recipes when empty: 400x400px illustration area
   - Centered with message below

7. BUTTONS:
   - Size: 120-150px wide x 44px tall
   - Primary (Teal): #2F9E89
   - Secondary (Coral): #FF7A59
   - Icons inside buttons: 20x20px white icons
```

---

## ✅ Figma AI Prompt to Generate All Pages

```
Create a comprehensive UI design system for GrocyGo app with these exact pages:

PAGES:
1. Hero/Landing - Title, tagline, Get Started button
2. Login/Signup - Dialog with email/password fields
3. Inventory - Table with search, add item, refresh buttons
4. Recipes - Chart display + suggested recipes grid
5. Meal Plans - Weekly calendar grid (7 days x 3 meals) and suggested meal cards
6. Shopping Lists - Two-column layout (lists + suggestions)
7. Analytics - Dashboard with 4 metric cards and 3 charts

COLORS:
- Dark background: #101418
- Paper: #1A1F24
- Primary Teal: #2F9E89
- Secondary Coral: #FF7A59
- Text light: #F0F3F8

IMAGES TO INCLUDE:
- GrocyGo logo in navbar (all pages)
- Food/recipe images in recipe cards
- Meal images in meal cards
- Chart visualizations (line, bar, pie)
- Icons for buttons (add, delete, edit, refresh, menu)
- Checkbox icons for shopping lists
- Metric icons for analytics

COMPONENTS NEEDED:
- Reusable buttons (primary, secondary)
- Input fields
- Cards
- Navigation bar
```

---

## 🚀 Quick Figma Setup Checklist

- [ ] Create color styles for all colors
- [ ] Create text styles (H1-H6, Body, Caption)
- [ ] Build button components (primary, secondary, icon buttons)
- [ ] Build card components (recipe, meal, metric)
- [ ] Create input field component
- [ ] Design navbar (reusable across all pages)
- [ ] Create 7 page frames (one for each page)
- [ ] Add placeholder images/icons to each page
- [ ] Set up auto-layout for responsive design
- [ ] Document spacing and alignment grid (8px)

---

**Ready to build in Figma?** Use this guide as your reference!  
Generated: 2026-07-24
