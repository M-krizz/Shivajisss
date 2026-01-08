"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("requester")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/backend/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Registration failed")
      }
      router.push("/auth/login")
    } catch (err: any) {
      setError(err.message || "Registration failed")
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
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleRegister}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <label className="flex items-center gap-1">
                <input type="radio" name="role" value="requester" checked={role === "requester"} onChange={() => setRole("requester")}/>
                Requester
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" name="role" value="provider" checked={role === "provider"} onChange={() => setRole("provider")}/>
                Provider
              </label>
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
          <div className="my-4 flex items-center justify-center gap-2">
            <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => handleSocialLogin("google")}>
              Google
            </Button>
            <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => handleSocialLogin("facebook")}>
              Facebook
            </Button>
          </div>
          <div className="text-center text-sm mt-2">
            Already have an account? <a href="/auth/login" className="underline">Sign in</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
