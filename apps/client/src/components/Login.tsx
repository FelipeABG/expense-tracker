"use client"

import { useGoogleLogin } from "@react-oauth/google"
import { useState } from "react"
import { apiClient, setAuthToken } from "../services/api"
import { generateSecurePassword, storeGooglePassword, getGooglePassword, removeGooglePassword } from "../utils/auth"
import { toast } from "sonner"

export function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      setError(null)

      try {
        // 1. Obter informações do perfil do Google usando o access_token
        const googleUserResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        })

        if (!googleUserResponse.ok) {
          throw new Error("Erro ao obter informações do Google")
        }

        const googleUser = await googleUserResponse.json()
        const email = googleUser.email

        if (!email) {
          throw new Error("Email não encontrado na conta do Google")
        }

        // 2. Tentar recuperar senha salva do localStorage
        let password = getGooglePassword(email)

        // 3. Se não tiver senha salva, tentar criar usuário
        if (!password) {
          // Gerar senha segura
          password = generateSecurePassword()

          // Tentar criar o usuário
          try {
            const signupResponse = await apiClient.Authentication.signup({
              body: {
                email,
                password,
              },
            })

            if (signupResponse.status === 201) {
              // Usuário criado com sucesso, salvar senha
              storeGooglePassword(email, password)
            }
          } catch (err: any) {
            // Verificar se é erro 409 (usuário já existe)
            const errorStatus = err.status || err.response?.status || err.body?.status
            const errorBody = err.body || err.response?.body || {}
            const errorMessage = err.message || errorBody.message || ""
            
            const isConflictError = 
              errorStatus === 409 || 
              errorMessage.includes("409") ||
              errorMessage.includes("já existe") || 
              errorMessage.includes("already exists") ||
              errorMessage.includes("já cadastrado") ||
              errorMessage.includes("already registered") ||
              errorMessage.includes("Email address is already registered")
            
            if (isConflictError) {
              // Usuário já existe - não criar, mas não temos senha para fazer login
              removeGooglePassword(email)
              throw new Error(
                "Este email já está cadastrado. Entre em contato com um administrador para recuperar o acesso."
              )
            }
            // Se for outro erro, propagar
            throw err
          }
        }

        // 4. Fazer login com email e senha
        if (!password) {
          throw new Error(
            "Erro ao obter credenciais. Tente novamente."
          )
        }

        const loginResponse = await apiClient.Authentication.login({
          body: {
            email,
            password,
          },
        })

        if (loginResponse.status !== 200) {
          // Se o login falhar, pode ser que a senha foi alterada no backend
          // Remover senha salva e tentar novamente
          removeGooglePassword(email)
          const errorMsg = loginResponse.body?.message || "Erro ao fazer login. Tente novamente."
          throw new Error(errorMsg)
        }

        // 5. Salvar o token JWT
        if (loginResponse.body?.token) {
          setAuthToken(loginResponse.body.token)
          toast.success("Login realizado com sucesso!")
          // Redirecionar para dashboard ou página principal
          window.location.href = "/dashboard"
        } else {
          throw new Error("Token não recebido")
        }
      } catch (err: any) {
        let errorMessage = "Erro ao fazer login. Tente novamente."
        
        if (err.message) {
          errorMessage = err.message
        } else if (err.body?.message) {
          errorMessage = err.body.message
        } else if (err.response?.body?.message) {
          errorMessage = err.response.body.message
        } else if (typeof err === 'string') {
          errorMessage = err
        }
        
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    },
    onError: (error) => {
      const errorMessage = `Erro ao fazer login com Google: ${error.error || error.error_description || "Erro desconhecido"}`
      setError(errorMessage)
      toast.error(errorMessage)
    },
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="flex justify-center">
            <img 
              src="/LogoExpenseTracker.png" 
              alt="Expense Tracker Logo" 
              className="size-40 object-contain"
            />
          </div>

          {/* Título e subtítulo */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 text-balance">Expense Tracker</h1>
            <p className="text-slate-600 text-pretty">Gerencie suas despesas e lucros de forma simples e inteligente</p>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Botão do Google */}
          <button
            onClick={() => handleGoogleLogin()}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-3.5 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Carregando...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M17.64 9.2c0-.637-.057-1.251-.163-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.951H.957C.348 6.174 0 7.55 0 9s.348 2.826.957 4.049l3.007-2.342z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.951L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continuar com Google</span>
              </>
            )}
          </button>

          {/* Informação adicional */}
          <p className="text-xs text-center text-slate-500 leading-relaxed">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">Controle total das suas finanças em um só lugar</p>
        </div>
      </div>
    </div>
  )
}
