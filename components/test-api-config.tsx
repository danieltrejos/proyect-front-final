'use client'

import { config } from '@/lib/config'
import { useEffect, useState } from 'react'

export function TestApiConfig() {
  const [apiStatus, setApiStatus] = useState<string>('🔄 Verificando conexión...')
  const [productCount, setProductCount] = useState<number>(0)

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🔧 URL de API configurada:', config.apiUrl)
        console.log('🌍 NODE_ENV:', process.env.NODE_ENV)
        console.log('🔑 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)

        // Probar una llamada simple a productos
        const response = await fetch(`${config.apiUrl}/products?all=true`)

        if (response.ok) {
          const data = await response.json()
          setProductCount(data.length || 0)
          setApiStatus('✅ Conexión exitosa con la API')
        } else {
          setApiStatus(`❌ Error HTTP: ${response.status} - ${response.statusText}`)
        }
      } catch (error) {
        console.error('Error de conexión:', error)
        setApiStatus(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-6 border-2 rounded-lg bg-blue-50 border-blue-200 mb-4">
      <h3 className="font-bold text-lg mb-4 text-blue-800">🧪 Test de Configuración API</h3>

      <div className="space-y-2 text-sm">
        <p><strong>URL configurada:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{config.apiUrl}</code></p>
        <p><strong>Entorno:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{process.env.NODE_ENV || 'development'}</code></p>
        <p><strong>Variable de entorno:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_API_URL || 'No definida'}</code></p>
        <p><strong>Estado de conexión:</strong> <span className="font-semibold">{apiStatus}</span></p>
        {productCount > 0 && (
          <p><strong>Productos encontrados:</strong> <span className="text-green-600 font-semibold">{productCount}</span></p>
        )}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
        <strong>📝 Nota:</strong> Este componente es solo para pruebas. Se puede eliminar después de verificar que todo funciona correctamente.
      </div>
    </div>
  )
}
