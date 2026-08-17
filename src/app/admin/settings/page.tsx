// src/app/admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface FacilitySettings {
  operatingStartHour: number;
  operatingEndHour: number;
  cancellationMode: 'AUTOMATED_REFUND' | 'ADMIN_CONTACT' | 'NON_REFUNDABLE';
  cancellationBufferHours: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<FacilitySettings>({
    operatingStartHour: 16,
    operatingEndHour: 24,
    cancellationMode: 'ADMIN_CONTACT',
    cancellationBufferHours: 24,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load settings' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Facility settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Update failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-gray-600 font-sans">
        Loading facility settings...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Facility Operating Settings</h1>

      {message && (
        <div
          className={`p-4 mb-6 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Daily Operating Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Opening Hour (24h Format)
              </label>
              <input
                type="number"
                min={0}
                max={23}
                value={settings.operatingStartHour}
                onChange={(e) => setSettings({ ...settings, operatingStartHour: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">e.g., 16 = 4:00 PM</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Closing Hour (24h Format)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={settings.operatingEndHour}
                onChange={(e) => setSettings({ ...settings, operatingEndHour: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">e.g., 24 = 12:00 AM Midnight</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Cancellation Policy</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Cancellation Mode
              </label>
              <select
                value={settings.cancellationMode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cancellationMode: e.target.value as FacilitySettings['cancellationMode'],
                  })
                }
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="AUTOMATED_REFUND">Automated Gateway Refund</option>
                <option value="ADMIN_CONTACT">Contact Admin / Manual Processing</option>
                <option value="NON_REFUNDABLE">Strictly Non-Refundable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Cancellation Window (Hours Before Slot)
              </label>
              <input
                type="number"
                min={0}
                value={settings.cancellationBufferHours}
                onChange={(e) => setSettings({ ...settings, cancellationBufferHours: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum hours before slot start time allowed for cancellation requests.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow-sm disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}