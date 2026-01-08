"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Google, Facebook } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/backend/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Login failed")
      }
      const data = await res.json()
      localStorage.setItem("token", data.access_token)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: "google" | "facebook") => {
    // TODO: Redirect to backend OAuth endpoint
    window.location.href = `/api/auth/${provider}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <div className="text-destructive text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="my-4 flex items-center justify-center gap-2">
            <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => handleSocialLogin("google")}> <Google className="h-4 w-4" /> Google </Button>
            <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => handleSocialLogin("facebook")}> <Facebook className="h-4 w-4" /> Facebook </Button>
          </div>
          <div className="text-center text-sm mt-2">
            Don't have an account? <a href="/auth/register" className="underline">Sign up</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
