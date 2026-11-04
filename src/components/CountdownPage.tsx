import { useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"
import { useNavigate } from "react-router"
import gsap from "gsap"
import { birthdayConfig } from "../config/birthdayConfig"
import { getCountdownTime, type CountdownTime } from "../utils/countdown"
import { AmbientParticles } from "./AmbientParticles"

interface CountdownUnitProps {
  label: string
  value: number
  minimumDigits?: number
}

function CountdownUnit({
  label,
  value,
  minimumDigits = 2,
}: CountdownUnitProps) {
  const formattedValue = String(value).padStart(minimumDigits, "0")

  return (
    <div className="countdown-unit">
      <div className="countdown-number-frame">
        <span key={formattedValue} className="countdown-number">
          {formattedValue}
        </span>
      </div>
      <span className="countdown-label">{label}</span>
    </div>
  )
}

export function CountdownPage() {
  const pageRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const { countdown } = birthdayConfig
  const [time, setTime] = useState<CountdownTime>(() =>
    getCountdownTime(countdown.targetDate),
  )
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    let timeoutId: number | undefined

    const updateCountdown = () => {
      const nextTime = getCountdownTime(countdown.targetDate)
      setTime(nextTime)

      if (nextTime.totalMilliseconds <= 0) {
        setComplete(true)
        return
      }

      const delayUntilNextSecond = Math.min(
        nextTime.totalMilliseconds,
        1000 - (Date.now() % 1000) + 20,
      )
      timeoutId = window.setTimeout(updateCountdown, delayUntilNextSecond)
    }

    updateCountdown()
    return () => window.clearTimeout(timeoutId)
  }, [countdown.targetDate])

  useEffect(() => {
    if (!pageRef.current) return

    const context = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(".countdown-intro > *", { y: 24, autoAlpha: 0 }, {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.11,
          ease: "power3.out",
        })
        .fromTo(
          ".countdown-unit",
          { y: 34, autoAlpha: 0, scale: 0.94 },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.09,
            ease: "power3.out",
          },
          "-=0.45",
        )
    }, pageRef)

    return () => context.revert()
  }, [])

  useEffect(() => {
    if (!complete || !pageRef.current) return

    const context = gsap.context(() => {
      gsap
        .timeline()
        .to(".countdown-main", {
          y: -20,
          autoAlpha: 0,
          duration: 0.65,
          ease: "power2.in",
        })
        .set(".countdown-complete", { display: "block" })
        .fromTo(
          ".countdown-complete > *",
          { y: 25, autoAlpha: 0, scale: 0.96 },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.9,
            stagger: 0.13,
            ease: "power3.out",
          },
        )
        .fromTo(
          ".countdown-burst i",
          { x: 0, y: 0, scale: 0.2, autoAlpha: 1 },
          {
            x: (index) =>
              Math.cos((index / 20) * Math.PI * 2) * (75 + (index % 5) * 22),
            y: (index) =>
              Math.sin((index / 20) * Math.PI * 2) * (75 + (index % 5) * 22),
            scale: (index) => 0.5 + (index % 4) * 0.18,
            autoAlpha: 0,
            duration: 1.5,
            stagger: 0.018,
            ease: "power3.out",
          },
          "-=0.7",
        )
    }, pageRef)

    const navigationTimer = window.setTimeout(() => {
      navigate("/experience", { replace: true })
    }, 2600)

    return () => {
      window.clearTimeout(navigationTimer)
      context.revert()
    }
  }, [complete, navigate])

  return (
    <section ref={pageRef} className="countdown-page">
      <div className="countdown-bg" aria-hidden="true">
        <img
          src="/main-photo.jpeg"
          alt=""
          className="countdown-bg-image"
          loading="eager"
        />
        <div className="countdown-bg-overlay" />
      </div>
      <AmbientParticles />
      <div className="countdown-aurora countdown-aurora--one" />
      <div className="countdown-aurora countdown-aurora--two" />
      <div className="countdown-main">
        <div className="countdown-intro">
          <Sparkles
            className="countdown-icon"
            size={19}
            strokeWidth={1.3}
            aria-hidden="true"
          />
          <p className="eyebrow">Thokkudu billa </p>
          <h1>Wait chey ra unga </h1>
          <p className="countdown-subtitle">
           welcome to debba debba presentations
          </p>
        </div>

        <div
          className="countdown-grid"
          aria-label={`${time.days} days, ${time.hours} hours, ${time.minutes} minutes and ${time.seconds} seconds remaining`}
        >
          <CountdownUnit label="Days" value={time.days} />
          <span className="countdown-separator">:</span>
          <CountdownUnit label="Hours" value={time.hours} />
          <span className="countdown-separator">:</span>
          <CountdownUnit label="Minutes" value={time.minutes} />
          <span className="countdown-separator">:</span>
          <CountdownUnit label="Seconds" value={time.seconds} />
        </div>

        <p className="countdown-note">
          Every second brings you closer to a special surprise.  ❤️
        </p>
      </div>

      <div className="countdown-complete" aria-live="polite">
        <div className="countdown-complete-mark">
          <Sparkles size={22} strokeWidth={1.2} />
        </div>
        <p className="eyebrow">Your moment has arrived</p>
        <h2>The wait is finally over! ❤️</h2>
        <p>Opening your surprise...</p>
        <div className="countdown-burst" aria-hidden="true">
          {Array.from({ length: 20 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
