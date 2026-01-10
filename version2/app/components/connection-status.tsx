"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  RefreshCw, 
  Server, 
  Database, 
  Wifi,
  Globe
} from "lucide-react"
import { checkHealth, getDistricts, getWarehouses, getDrivers, API_BASE_URL } from "@/lib/api"

interface ConnectionTest {
  name: string
  endpoint: string
  status: "idle" | "loading" | "success" | "error"
  message?: string
  latency?: number
}

export function ConnectionStatus() {
  const [tests, setTests] = useState<ConnectionTest[]>([
    { name: "Health Check", endpoint: "/health", status: "idle" },
    { name: "Districts API", endpoint: "/catalog/districts", status: "idle" },
    { name: "Warehouses API", endpoint: "/catalog/warehouses", status: "idle" },
    { name: "Drivers API", endpoint: "/catalog/drivers", status: "idle" },
  ])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    
    // Reset all tests to loading
    setTests(prev => prev.map(t => ({ ...t, status: "loading" as const })))

    // Run health check
    const startHealth = Date.now()
    try {
      await checkHealth()
      setTests(prev => prev.map(t => 
        t.name === "Health Check" 
          ? { ...t, status: "success" as const, latency: Date.now() - startHealth, message: "Backend is healthy" }
          : t
      ))
    } catch (err: any) {
      setTests(prev => prev.map(t => 
        t.name === "Health Check" 
          ? { ...t, status: "error" as const, message: err.message || "Connection failed" }
          : t
      ))
    }

    // Run districts test
    const startDistricts = Date.now()
    try {
      const districts = await getDistricts()
      setTests(prev => prev.map(t => 
        t.name === "Districts API" 
          ? { ...t, status: "success" as const, latency: Date.now() - startDistricts, message: `${districts.length} districts loaded` }
          : t
      ))
    } catch (err: any) {
      setTests(prev => prev.map(t => 
        t.name === "Districts API" 
          ? { ...t, status: "error" as const, message: err.message || "Failed to load districts" }
          : t
      ))
    }

    // Run warehouses test
    const startWarehouses = Date.now()
    try {
      const warehouses = await getWarehouses()
      setTests(prev => prev.map(t => 
        t.name === "Warehouses API" 
          ? { ...t, status: "success" as const, latency: Date.now() - startWarehouses, message: `${warehouses.length} warehouses loaded` }
          : t
      ))
    } catch (err: any) {
      setTests(prev => prev.map(t => 
        t.name === "Warehouses API" 
          ? { ...t, status: "error" as const, message: err.message || "Failed to load warehouses" }
          : t
      ))
    }

    // Run drivers test
    const startDrivers = Date.now()
    try {
      const drivers = await getDrivers()
      setTests(prev => prev.map(t => 
        t.name === "Drivers API" 
          ? { ...t, status: "success" as const, latency: Date.now() - startDrivers, message: `${drivers.length} drivers loaded` }
          : t
      ))
    } catch (err: any) {
      setTests(prev => prev.map(t => 
        t.name === "Drivers API" 
          ? { ...t, status: "error" as const, message: err.message || "Failed to load drivers" }
          : t
      ))
    }

    setIsRunning(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  const allPassed = tests.every(t => t.status === "success")
  const anyFailed = tests.some(t => t.status === "error")

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Backend Connection Status
            </CardTitle>
            <CardDescription className="mt-1">
              API: {API_BASE_URL}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        {!isRunning && (
          <Alert className={allPassed ? "border-emerald-500/50 bg-emerald-500/10" : anyFailed ? "border-destructive/50 bg-destructive/10" : ""}>
            {allPassed ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : anyFailed ? (
              <XCircle className="h-4 w-4 text-destructive" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            <AlertTitle>
              {allPassed ? "All Systems Operational" : anyFailed ? "Connection Issues Detected" : "Checking..."}
            </AlertTitle>
            <AlertDescription>
              {allPassed 
                ? "Frontend is successfully connected to the backend API." 
                : anyFailed 
                  ? "Some API endpoints are not responding. Make sure the backend server is running."
                  : "Testing connection to backend services..."
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Individual Tests */}
        <div className="space-y-2">
          {tests.map((test) => (
            <div 
              key={test.name}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                {test.status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : test.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : test.status === "error" ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <div className="h-4 w-4 rounded-full bg-muted" />
                )}
                <div>
                  <p className="font-medium text-sm">{test.name}</p>
                  <p className="text-xs text-muted-foreground">{test.endpoint}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {test.message && (
                  <span className={`text-xs ${test.status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                    {test.message}
                  </span>
                )}
                {test.latency && (
                  <Badge variant="secondary" className="text-xs">
                    {test.latency}ms
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Help Text */}
        {anyFailed && (
          <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-2">
            <p className="font-medium">To start the backend server:</p>
            <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
              cd backend{"\n"}
              pip install -r requirements.txt{"\n"}
              uvicorn app.main:app --reload --port 8000
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
