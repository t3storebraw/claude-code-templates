'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { ApiKeys } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Instagram, 
  Facebook, 
  Zap, 
  Music, 
  Search, 
  Save, 
  TestTube, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const platforms = [
  { key: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { key: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  { key: 'meta', name: 'Meta Ads', icon: Zap, color: 'text-blue-600' },
  { key: 'tiktok', name: 'TikTok', icon: Music, color: 'text-black' },
  { key: 'googleAds', name: 'Google Ads', icon: Search, color: 'text-red-500' },
];

export default function ApiKeysConfig() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    instagram: '',
    facebook: '',
    meta: '',
    tiktok: '',
    googleAds: '',
  });
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const response = await apiService.getApiKeys();
      if (response.success && response.data) {
        setApiKeys(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (platform: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const togglePasswordVisibility = (platform: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const saveApiKeys = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await apiService.updateApiKeys(apiKeys);
      if (response.success) {
        setMessage({ type: 'success', text: 'API keys salvas com sucesso!' });
      } else {
        setMessage({ type: 'error', text: response.error || 'Erro ao salvar API keys' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (platform: string) => {
    const token = apiKeys[platform as keyof ApiKeys];
    if (!token) {
      setTestResults(prev => ({
        ...prev,
        [platform]: { success: false, message: 'Token não configurado' }
      }));
      return;
    }

    setTesting(prev => ({ ...prev, [platform]: true }));
    setTestResults(prev => ({ ...prev, [platform]: { success: false, message: '' } }));

    try {
      const response = await apiService.testConnection(platform, token);
      if (response.success && response.data) {
        setTestResults(prev => ({
          ...prev,
          [platform]: {
            success: response.data.connected,
            message: response.data.message
          }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          [platform]: {
            success: false,
            message: response.error || 'Erro ao testar conexão'
          }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [platform]: {
          success: false,
          message: 'Erro de conexão com o servidor'
        }
      }));
    } finally {
      setTesting(prev => ({ ...prev, [platform]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações de API</h2>
          <p className="text-gray-600 mt-1">
            Configure suas chaves de API para conectar com as plataformas de tráfego pago
          </p>
        </div>
        <button
          onClick={saveApiKeys}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-200 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Salvando...' : 'Salvar Todas'}</span>
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={cn(
          "p-4 rounded-lg flex items-center space-x-2",
          message.type === 'success' 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        )}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => (
          <div
            key={platform.key}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
          >
            {/* Platform Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={cn("h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center", platform.color)}>
                  <platform.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                  <p className="text-sm text-gray-500">Token de API</p>
                </div>
              </div>
            </div>

            {/* Input Field */}
            <div className="relative mb-4">
              <input
                type={showPasswords[platform.key] ? 'text' : 'password'}
                value={apiKeys[platform.key as keyof ApiKeys]}
                onChange={(e) => handleInputChange(platform.key, e.target.value)}
                placeholder={`Digite seu token do ${platform.name}`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(platform.key)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords[platform.key] ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Test Connection */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => testConnection(platform.key)}
                disabled={testing[platform.key]}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
              >
                <TestTube className="h-4 w-4" />
                <span>{testing[platform.key] ? 'Testando...' : 'Testar Conexão'}</span>
              </button>

              {/* Test Result */}
              {testResults[platform.key] && (
                <div className={cn(
                  "flex items-center space-x-1 text-sm",
                  testResults[platform.key].success ? "text-green-600" : "text-red-600"
                )}>
                  {testResults[platform.key].success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span className="text-xs">
                    {testResults[platform.key].success ? 'Conectado' : 'Falha'}
                  </span>
                </div>
              )}
            </div>

            {/* Test Message */}
            {testResults[platform.key]?.message && (
              <p className={cn(
                "text-xs mt-2",
                testResults[platform.key].success ? "text-green-600" : "text-red-600"
              )}>
                {testResults[platform.key].message}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Como obter suas API Keys:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Instagram:</strong> Acesse o Facebook Developer e crie um app</li>
          <li>• <strong>Facebook:</strong> Use o Facebook Business Manager</li>
          <li>• <strong>Meta Ads:</strong> Configure no Ads Manager</li>
          <li>• <strong>TikTok:</strong> Acesse o TikTok for Business</li>
          <li>• <strong>Google Ads:</strong> Use o Google Ads API</li>
        </ul>
      </div>
    </div>
  );
}