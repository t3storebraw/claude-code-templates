'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiKeys } from '@/types'
import { Key, CheckCircle, AlertCircle, Loader } from 'lucide-react'

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    instagram: '',
    facebook: '',
    meta: '',
    tiktok: ''
  })
  const [loading, setLoading] = useState(false)
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({})

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/keys')
      const data = await response.json()
      setApiKeys(data)
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
    }
  }

  const handleInputChange = (platform: keyof ApiKeys, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [platform]: value
    }))
  }

  const saveApiKeys = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/keys/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiKeys),
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('API Keys salvas com sucesso!')
      } else {
        alert('Erro ao salvar API Keys: ' + result.error)
      }
    } catch (error) {
      alert('Erro ao salvar API Keys')
      console.error('Failed to save API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async (platform: keyof ApiKeys) => {
    const token = apiKeys[platform]
    if (!token.trim()) {
      alert('Por favor, insira a API key antes de testar')
      return
    }

    setTestingPlatform(platform)
    try {
      const response = await fetch('/api/keys/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform, token }),
      })
      
      const result = await response.json()
      setTestResults(prev => ({
        ...prev,
        [platform]: {
          success: result.success,
          message: result.message
        }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [platform]: {
          success: false,
          message: 'Erro de conexão'
        }
      }))
    } finally {
      setTestingPlatform(null)
    }
  }

  const platforms = [
    {
      key: 'instagram' as keyof ApiKeys,
      name: 'Instagram',
      description: 'Token de acesso para Instagram Basic Display API',
      placeholder: 'Insira seu Instagram Access Token'
    },
    {
      key: 'facebook' as keyof ApiKeys,
      name: 'Facebook',
      description: 'Token de acesso para Facebook Graph API',
      placeholder: 'Insira seu Facebook Access Token'
    },
    {
      key: 'meta' as keyof ApiKeys,
      name: 'Meta Ads',
      description: 'Token de acesso para Meta Marketing API',
      placeholder: 'Insira seu Meta Ads Access Token'
    },
    {
      key: 'tiktok' as keyof ApiKeys,
      name: 'TikTok',
      description: 'Token de acesso para TikTok Business API',
      placeholder: 'Insira seu TikTok Access Token'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configurações de API
            </h1>
            <p className="text-gray-600">
              Configure suas chaves de API para integração com as plataformas
            </p>
          </div>

          {/* API Keys Form */}
          <div className="space-y-6">
            {platforms.map((platform) => {
              const testResult = testResults[platform.key]
              
              return (
                <Card key={platform.key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-purple-600" />
                      {platform.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{platform.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Input
                        type="password"
                        placeholder={platform.placeholder}
                        value={apiKeys[platform.key]}
                        onChange={(e) => handleInputChange(platform.key, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => testConnection(platform.key)}
                        disabled={testingPlatform === platform.key || !apiKeys[platform.key].trim()}
                        className="min-w-[120px]"
                      >
                        {testingPlatform === platform.key ? (
                          <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Testando...
                          </>
                        ) : (
                          'Testar Conexão'
                        )}
                      </Button>
                    </div>
                    
                    {testResult && (
                      <div className={`flex items-center gap-2 text-sm ${
                        testResult.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {testResult.success ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        {testResult.message}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={saveApiKeys} 
              disabled={loading}
              size="lg"
              className="min-w-[160px]"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Configurações'
              )}
            </Button>
          </div>

          {/* Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Como obter suas API Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-purple-700">Instagram</h4>
                <p className="text-sm text-gray-600">
                  Acesse o Facebook Developers, crie um app e configure o Instagram Basic Display
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700">Facebook</h4>
                <p className="text-sm text-gray-600">
                  Use o Graph API Explorer no Facebook Developers para gerar tokens
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600">Meta Ads</h4>
                <p className="text-sm text-gray-600">
                  Configure o Meta Marketing API no Facebook Business Manager
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">TikTok</h4>
                <p className="text-sm text-gray-600">
                  Registre-se no TikTok for Business e obtenha acesso à API
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}