import React, { useState } from 'react';
import { Save, Store, DollarSign, Truck, Bell, ShoppingBag, Globe, Palette, CheckCircle, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

const SettingsManagement = () => {
  const { settings, loading, error, updateSetting, updateMultipleSettings } = useSettings();
  const [editedSettings, setEditedSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Debug logging
  console.log('SettingsManagement - Loading:', loading);
  console.log('SettingsManagement - Settings count:', settings.length);
  console.log('SettingsManagement - Error:', error);

  // Group settings by category
  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {});

  // Get category metadata
  const categoryMetadata = {
    store: { icon: Store, label: 'Enfòmasyon Magazen', color: 'blue' },
    payment: { icon: DollarSign, label: 'Peman', color: 'green' },
    shipping: { icon: Truck, label: 'Ekspedisyon', color: 'purple' },
    tax: { icon: DollarSign, label: 'Taks', color: 'orange' },
    inventory: { icon: ShoppingBag, label: 'Envantè', color: 'indigo' },
    notifications: { icon: Bell, label: 'Notifikasyon', color: 'pink' },
    social: { icon: Globe, label: 'Rezo Sosyal', color: 'blue' },
    appearance: { icon: Palette, label: 'Aparans', color: 'purple' },
  };

  const handleInputChange = (key, value) => {
    setEditedSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveMessage(null);

    const result = await updateMultipleSettings(editedSettings);
    
    if (result.success) {
      setSaveMessage({ type: 'success', message: 'Paramèt yo aktyalize!' });
      // Keep edited settings so user can see their changes
      setTimeout(() => setSaveMessage(null), 3000);
      
      // Force page reload to apply settings changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setSaveMessage({ type: 'error', message: `Erè: ${result.error}` });
    }
    
    setSaving(false);
  };

  // Auto-initialize editedSettings when settings load
  React.useEffect(() => {
    if (settings.length > 0 && Object.keys(editedSettings).length === 0) {
      const initialSettings = {};
      settings.forEach(setting => {
        initialSettings[setting.key] = setting.value;
      });
      setEditedSettings(initialSettings);
    }
  }, [settings]);

  const renderField = (setting) => {
    const value = editedSettings[setting.key] !== undefined 
      ? editedSettings[setting.key] 
      : setting.value;

    if (setting.type === 'boolean') {
      return (
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => handleInputChange(setting.key, e.target.checked ? 'true' : 'false')}
              className="sr-only"
            />
            <div className={`w-14 h-8 rounded-full transition-colors ${
              value === 'true' ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                value === 'true' ? 'translate-x-8' : 'translate-x-1'
              } mt-1`} />
            </div>
          </div>
        </label>
      );
    }

    if (setting.key === 'payment_methods') {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(setting.key, e.target.value)}
          placeholder="cash, card, bank"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      );
    }

    return (
      <input
        type={setting.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => handleInputChange(setting.key, e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chajman paramèt yo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Erè</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (settings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Jesyon Paramèt</h1>
            <p className="text-gray-600 mt-1">Kontwole tout konfigirasyon magazen ou yo</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <SettingsIcon size={20} />
            Rechaje
          </button>
        </div>
        
        <div className="text-center py-12 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
          <AlertCircle size={48} className="mx-auto mb-4 text-yellow-600" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pa gen paramèt</h2>
          <p className="text-gray-600 mb-4">Paramèt yo pa chaje oswa pa egziste</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Debug Info:</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Settings Count: {settings.length}</p>
            <p>Error: {error || 'None'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Jesyon Paramèt</h1>
          <p className="text-gray-600 mt-1">Kontwole tout konfigirasyon magazen ou yo</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          {saving ? 'Sove...' : 'Sove Tout Chanjman'}
        </button>
      </div>

      {saveMessage && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          saveMessage.type === 'success' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {saveMessage.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <p className="font-medium">{saveMessage.message}</p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedSettings).map(([category, categorySettings]) => {
          const metadata = categoryMetadata[category] || { icon: SettingsIcon, label: category, color: 'gray' };
          const Icon = metadata.icon;

          return (
            <div key={category} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className={`bg-gradient-to-r ${
                category === 'store' ? 'from-blue-500 to-blue-600' :
                category === 'payment' ? 'from-green-500 to-green-600' :
                category === 'shipping' ? 'from-purple-500 to-purple-600' :
                category === 'tax' ? 'from-orange-500 to-orange-600' :
                category === 'inventory' ? 'from-indigo-500 to-indigo-600' :
                category === 'notifications' ? 'from-pink-500 to-pink-600' :
                category === 'social' ? 'from-blue-500 to-cyan-600' :
                'from-purple-500 to-pink-600'
              } px-6 py-4 flex items-center gap-3 text-white`}>
                <Icon size={24} />
                <h2 className="text-xl font-semibold">{metadata.label}</h2>
              </div>

              <div className="p-6 space-y-4">
                {categorySettings.map(setting => (
                  <div key={setting.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                          {setting.label}
                        </label>
                        {setting.description && (
                          <p className="text-sm text-gray-500">{setting.description}</p>
                        )}
                      </div>
                    </div>
                    {renderField(setting)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={24} className="text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Remak</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Chanje paramèt ki afekte kliyan byen ou avan wouvri chanpilòy fanmi.</li>
              <li>Kèk chanjer ap egzije refresh paj la.</li>
              <li>Tout chanjer aktyalize imedyatman nan baz done a.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;

