'use client';

import Sidebar from '@/components/Sidebar';
import ApiKeysConfig from '@/components/ApiKeysConfig';

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          <ApiKeysConfig />
        </div>
      </div>
    </div>
  );
}