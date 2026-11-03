import { useEffect, useState } from "react"
import { createBrowserRouter, Navigate, useNavigate } from "react-router"
import { CountdownPage } from "../components/CountdownPage"
import { LandingPage } from "../components/LandingPage"
import { MemoryJourney } from "../components/MemoryJourney"
import { isCountdownActive } from "../utils/countdown"

const PREVIEW_SESSION_KEY = "birthday-owner-preview"

function hasPreviewAccess() {
  return window.sessionStorage.getItem(PREVIEW_SESSION_KEY) === "enabled"
}

function PreviewUnlock() {
  const navigate = useNavigate()

  useEffect(() => {
    window.sessionStorage.setItem(PREVIEW_SESSION_KEY, "enabled")
    navigate("/experience", { replace: true })
  }, [navigate])

  return (
    <main className="preview-unlock">
      <p>Opening your private preview...</p>
    </main>
  )
}

function ExperiencePage() {
  const [started, setStarted] = useState(false)

  return (
    <main className="app-shell">
      {!started && <LandingPage onBegin={() => setStarted(true)} />}
      {started && <MemoryJourney />}
    </main>
  )
}

function CountdownGate() {
  if (hasPreviewAccess() || !isCountdownActive()) {
    return <Navigate to="/experience" replace />
  }

  return <CountdownPage />
}

function ExperienceGate() {
  if (!hasPreviewAccess() && isCountdownActive()) {
    return <Navigate to="/" replace />
  }

  return <ExperiencePage />
}

export const router = createBrowserRouter([
  { path: "/", Component: CountdownGate },
  { path: "/countdown", Component: CountdownGate },
  { path: "/preview", Component: PreviewUnlock },
  { path: "/experience", Component: ExperienceGate },
  { path: "/landing", Component: ExperienceGate },
  { path: "*", element: <Navigate to="/" replace /> },
])
