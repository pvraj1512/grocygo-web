# GrocyGo Figma Design System

## 🎨 Design Tokens

### Color Palette

#### Dark Mode (Primary)
- **Background**: `#101418` (Deep Charcoal)
- **Paper/Surface**: `#1A1F24` (Dark Blue-Gray)
- **Card Background**: `#20262C` (Slightly Lighter)
- **Text Primary**: `#F0F3F8` (Soft White)
- **Text Secondary**: `#A6B2C2` (Light Gray)

#### Light Mode (Secondary)
- **Background**: `#F6FCFA` (Light Mint-White)
- **Paper/Surface**: `#FFFFFF` (Pure White)
- **Card Background**: `#FFFFFF` (Pure White)
- **Text Primary**: `#1C1F23` (Deep Gray)
- **Text Secondary**: `#4B5563` (Medium Gray)

#### Accent Colors
- **Primary**: `#2F9E89` (Leafy Green-Teal)
- **Secondary**: `#FF7A59` (Coral Orange)
- **Accent**: `#C084FC` (Purple)
- **Success**: `#3CCF4E` (Green)
- **Error**: `#FF4C4C` (Red)

#### UI Elements
- **Divider (Dark)**: `#2C333A`
- **Divider (Light)**: `#E3E8ED`
- **Border (Dark)**: `#38424D`
- **Border (Light)**: `#D1D9E0`
- **Hover (Dark)**: `#25303B`
- **Hover (Light)**: `#F2F6F9`

### Typography
- **H1**: 32px, Weight 700
- **H2**: 28px, Weight 700
- **H3**: 24px, Weight 700
- **H4**: 20px, Weight 700
- **H5**: 18px, Weight 700
- **H6**: 16px, Weight 700
- **Body**: 14px, Weight 400
- **Caption**: 12px, Weight 400
- **Font Family**: System Default (Roboto/SF Pro)

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

### Border Radius
- **Small**: 4px
- **Medium**: 8px
- **Large**: 16px

## 📱 Pages & Screens

### 1. **Hero Page**
- Full width banner
- Title: "Smart Grocery & Meal Management"
- Subtitle: "AI-powered, collaborative, and beautiful"
- "Get Started" Button (Primary Color)
- Navigation with Login/Signup

### 2. **Auth Page**
Components:
- **Login Tab**
  - Email TextField
  - Password TextField
  - "Login" Button
  - Error message area

- **Sign Up Tab**
  - Name TextField
  - Email TextField
  - Password TextField
  - "Sign Up" Button
  - Error message area

**Dialog Style**: 400px max-width, centered, rounded corners

### 3. **Inventory Page**
Layout: 3-column grid
- **Header Section**
  - Title: "Inventory"
  - Subtitle: "Manage your kitchen items and track expiry dates"
  
- **Action Bar**
  - Search TextField (Search items...)
  - "Suggested Recipes" Button
  - "Add Item" Button
  - "Refresh" Button

- **Main Content**: Data Table
  - Columns: Name | Quantity | Unit | Location | Expiry | Action
  - Rows: Dynamic (from API)
  - Row Actions: Edit, Delete buttons

- **Right Sidebar** (Optional)
  - Category filters
  - Expiry alerts

### 4. **Recipes Page**
Layout: Grid layout
- **Header**
  - Title: "Recipes"
  - Filter options (Diet, Course)

- **Recipe Cards** (3-column grid)
  - Recipe image/placeholder
  - Recipe name
  - Ingredients count
  - Difficulty level
  - Action buttons: Edit, Delete

- **Add Recipe Button** (Floating or top-right)

- **Recipe Dialog** (Modal)
  - Recipe name
  - Ingredients list
  - Instructions
  - Difficulty level
  - Course type
  - Save/Cancel buttons

### 5. **Meal Plans Page**
Layout: Calendar view + sidebar
- **Header**
  - Title: "Weekly Meal Plans"
  - Week navigation (Previous/Next)
  - Date range display

- **Calendar Grid** (7 columns for days)
  - Day headers: Mon-Sun
  - Meal slots: Breakfast, Lunch, Dinner
  - Drag-drop meals

- **Right Sidebar**
  - Suggested meals (AI)
  - "AI Generate" Button
  - Add meal button

- **Meal Dialog**
  - Meal name
  - Date picker
  - Meal type (Breakfast/Lunch/Dinner)
  - Ingredients
  - Save/Cancel

### 6. **Shopping Lists Page**
Layout: Two-column (List + Suggestions)
- **Header**
  - Title: "Shopping Lists"
  - New list button

- **Active Lists** (Left Column)
  - List name
  - Item count
  - Checkboxes for items
  - Delete/Edit buttons

- **Smart Suggestions** (Right Column)
  - "Based on your inventory"
  - Suggested items
  - Add to list buttons

### 7. **Analytics Page**
Layout: Dashboard grid
- **Header**
  - Title: "Analytics"
  - Date range picker

- **Metrics Cards** (4-column grid)
  - Daily active users
  - 1-day retention
  - Expiry alerts count
  - Saved recipes count

- **Charts**
  - Line chart: Usage trends
  - Bar chart: Category breakdown
  - Pie chart: Meal type distribution

## 🧩 Components Library

### Buttons
- **Primary Button**
  - Background: `#2F9E89`
  - Text: White
  - Padding: 12px 24px
  - Border Radius: 8px
  - Hover: Darker shade

- **Secondary Button**
  - Background: `#FF7A59`
  - Text: White
  - Padding: 12px 24px

- **Outlined Button**
  - Border: 1px solid primary
  - Background: Transparent
  - Text: Primary color

### Input Fields
- **TextField**
  - Background: `#1A1F24` (dark) / `#FFFFFF` (light)
  - Border: 1px solid `#38424D` (dark) / `#D1D9E0` (light)
  - Border Radius: 8px
  - Padding: 12px 16px
  - Focus state: Border color = primary

### Cards
- **Card Component**
  - Background: `#20262C` (dark) / `#FFFFFF` (light)
  - Border: 1px solid `#38424D` (dark) / `#D1D9E0` (light)
  - Border Radius: 8px
  - Padding: 16px
  - Shadow: 0 2px 8px rgba(0,0,0,0.1)

### Dialog
- **Dialog/Modal**
  - Max Width: 400px
  - Background: Paper color
  - Border Radius: 16px
  - Padding: 24px
  - Overlay: Semi-transparent black

### Table
- **Header Row**
  - Background: Card background
  - Text Weight: 600
  - Padding: 12px 16px

- **Data Row**
  - Padding: 12px 16px
  - Border Bottom: 1px solid divider
  - Hover: Background = hover color

- **Columns**: Responsive width distribution

### Navigation
- **AppBar**
  - Background: Slightly transparent glassmorphism effect
  - Height: 64px
  - Logo + Navigation items + Theme toggle

- **Sidebar/Drawer**
  - Width: 256px
  - Menu items with icons
  - Active item highlight in primary color

## 📐 Layout Grid
- **Base Unit**: 8px
- **Column Count**: 12 columns
- **Max Width**: 1400px
- **Padding**: 2rem (32px) on each side

## 🎬 Interactions & States

### Button States
- **Default**: Normal colors
- **Hover**: 10% darker
- **Active**: 20% darker
- **Disabled**: 50% opacity, cursor: not-allowed

### Input States
- **Default**: Border = border color
- **Focus**: Border = primary color, shadow effect
- **Error**: Border = error color, error text below
- **Disabled**: Opacity 50%, cursor: not-allowed

### Card States
- **Default**: Normal shadow
- **Hover**: Enhanced shadow, slight scale up
- **Selected**: Border = primary color, background highlight

## 📝 Typography Styles

### Headings
- **Page Title**: H1, Primary text color
- **Section Title**: H4, Primary text color
- **Card Title**: H6, Primary text color

### Body Text
- **Primary Text**: 14px, Regular weight, Primary text color
- **Secondary Text**: 14px, Regular weight, Secondary text color
- **Captions**: 12px, Regular weight, Secondary text color

### Links
- **Color**: Primary color (`#2F9E89`)
- **Hover**: Underline, slightly darker
- **Active**: Darker shade

## 🌙 Theme Variants
- **Light Mode**: Recommended for daytime use
- **Dark Mode**: Recommended for nighttime use
- **Toggle**: Located in top-right corner of AppBar

---

## Implementation Notes for Figma

1. **Create a Frame** for each page (1920x1080px recommended)
2. **Use Components** for reusable elements (Button, Card, TextField, etc.)
3. **Use Styles** for colors, typography, and shadows
4. **Use Auto Layout** for responsive designs
5. **Create a Color Styles sheet** with all colors
6. **Create Text Styles sheet** with typography
7. **Document interactions** using Figma prototyping

---

Generated: 2026-07-24
Based on: GrocyGo React Application
Design System Version: 1.0
