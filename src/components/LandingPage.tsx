import { useRef } from "react"
import { ArrowDown, Sparkles } from "lucide-react"
import gsap from "gsap"
import { birthdayConfig } from "../config/birthdayConfig"
import { AmbientParticles } from "./AmbientParticles"

export function LandingPage({ onBegin }: { onBegin: () => void }) {
  const pageRef = useRef<HTMLElement>(null)
  const { intro } = birthdayConfig

  const beginJourney = () => {
    if (!pageRef.current) return onBegin()
    gsap
      .timeline({ onComplete: onBegin })
      .to(".landing-copy > *", {
        y: -24,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.in",
      })
      .to(
        pageRef.current,
        { opacity: 0, duration: 0.7, ease: "power2.inOut" },
        "-=0.2",
      )
  }

  return (
    <section ref={pageRef} className="landing-page">
      <AmbientParticles />
      <div className="landing-orbit landing-orbit--one" aria-hidden="true" />
      <div className="landing-orbit landing-orbit--two" aria-hidden="true" />
      <div className="landing-copy">
        <div className="landing-mark" aria-hidden="true">
          <Sparkles size={16} strokeWidth={1.5} />
        </div>
        <p className="eyebrow">{intro.eyebrow}</p>
        <h1>{intro.title}</h1>
        <p className="landing-subtitle">{intro.subtitle}</p>
        <button className="begin-button" onClick={beginJourney}>
          <span>{intro.buttonLabel}</span>
          <ArrowDown size={17} strokeWidth={1.5} />
        </button>
      </div>
      <p className="landing-note">Made from moments worth keeping</p>
    </section>
  )
}
