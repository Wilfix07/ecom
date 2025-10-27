# Settings Feature Documentation

## ✅ What Was Created

### 🗄️ Database
Created a new `settings` table in Supabase with 24 pre-configured settings organized into 8 categories:

1. **Store Information** (4 settings)
   - Store name, email, phone, address

2. **Payment** (4 settings)
   - Currency, payment methods, enabled/disabled

3. **Shipping** (3 settings)
   - Enable shipping, free threshold, shipping fee

4. **Tax** (2 settings)
   - Enable tax, tax rate

5. **Inventory** (2 settings)
   - Low stock threshold, auto-update stock

6. **Notifications** (3 settings)
   - New orders notification, low stock notification, admin email

7. **Social Media** (3 settings)
   - Facebook, Instagram, Twitter URLs

8. **Appearance** (3 settings)
   - Theme, primary color, footer text

### ⚛️ React Components Created

1. **`src/components/SettingsManagement.jsx`**
   - Complete settings management UI
   - Beautiful category-based organization
   - Real-time updates
   - Save confirmation messages

2. **`src/hooks/useSettings.js`**
   - Fetch all settings from Supabase
   - Update individual or multiple settings
   - Helper functions to get setting values

### 🎨 Features

#### UI Features:
- ✅ Grouped by category with colored headers
- ✅ Different input types (text, number, boolean/toggle)
- ✅ Descriptions for each setting
- ✅ Save all changes at once
- ✅ Success/error messages
- ✅ Loading states
- ✅ Disabled state when no changes

#### Functionality:
- ✅ Real-time data fetching from Supabase
- ✅ Batch updates for performance
- ✅ Optimistic UI updates
- ✅ Error handling
- ✅ Type-safe field rendering

## 📊 Database Schema

```sql
CREATE TABLE settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT NOT NULL CHECK (type IN ('text', 'number', 'boolean', 'json')),
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎯 How to Use

### Access Settings
1. Go to Admin Dashboard
2. Click "Paramèt" (Settings) in the sidebar
3. View all settings grouped by category

### Edit Settings
1. Change any setting value in the form
2. Click "Sove Tout Chanjman" (Save All Changes)
3. See success message
4. Settings are saved to Supabase immediately

### Setting Types

#### Text Settings
- Store name, email, phone, URLs, etc.
- Standard text input

#### Number Settings
- Tax rate, shipping fee, thresholds
- Number input with validation

#### Boolean Settings
- Enable/disable features
- Beautiful toggle switches
- Stored as 'true' or 'false' strings

## 🔧 Adding New Settings

To add new settings to your Supabase database:

```sql
INSERT INTO settings (key, value, type, category, label, description) VALUES
  ('new_setting_key', 'default_value', 'text', 'category', 'Label', 'Description');
```

## 📝 Example: Using Settings in Your App

```javascript
import { useSettings } from '../hooks/useSettings';

function MyComponent() {
  const { getSettingValue } = useSettings();
  
  const storeName = getSettingValue('store_name', 'TechMart Haiti');
  const taxRate = parseFloat(getSettingValue('tax_rate', '10'));
  const shippingEnabled = getSettingValue('shipping_enabled') === 'true';
  
  return (
    <div>
      <h1>Welcome to {storeName}</h1>
      {shippingEnabled && <p>We ship nationwide!</p>}
    </div>
  );
}
```

## 🎨 UI Categories

Each category has its own color scheme:

- **Store (Enfòmasyon Magazen)**: Blue gradient
- **Payment (Peman)**: Green gradient  
- **Shipping (Ekspedisyon)**: Purple gradient
- **Tax (Taks)**: Orange gradient
- **Inventory (Envantè)**: Indigo gradient
- **Notifications (Notifikasyon)**: Pink gradient
- **Social (Rezo Sosyal)**: Blue-Cyan gradient
- **Appearance (Aparans)**: Purple-Pink gradient

## 🔐 Security

- Row Level Security enabled
- Only authenticated users can read/write settings
- All updates logged with timestamps

## 🚀 Future Enhancements

Possible improvements:
- Real-time validation
- Setting dependencies (e.g., tax settings only show if tax_enabled is true)
- Setting history/audit log
- Export/Import settings
- Bulk reset to defaults
- Setting preview on the frontend
- Multi-language support for labels

## 💡 Usage Tips

1. **Always save in batches** - The UI is optimized for saving multiple changes at once
2. **Test settings on staging first** - Some changes affect the entire store
3. **Use descriptive keys** - Makes it easier to find settings in code
4. **Add descriptions** - Helps other admins understand what each setting does

---

**Access your settings:** Admin Dashboard → Paramèt (Settings)

