import { useRef } from "react"
import { ArrowDown, Sparkles } from "lucide-react"
import gsap from "gsap"
import { birthdayConfig } from "../config/birthdayConfig"
import { backgroundMusic } from "../utils/audio"
import { AmbientParticles } from "./AmbientParticles"

export function LandingPage({ onBegin }: { onBegin: () => void }) {
  const pageRef = useRef<HTMLElement>(null)
  const { intro } = birthdayConfig

  const beginJourney = () => {
    // Start background music immediately inside user click interaction at 00:11
    backgroundMusic.playFromStart(11)

    if (!pageRef.current) return onBegin()
    gsap
      .timeline({ onComplete: onBegin })
      .to(".landing-copy > *", {
        y: -16,
        autoAlpha: 0,
        stagger: 0.05,
        duration: 0.35,
        ease: "power2.in",
      })
      .to(
        pageRef.current,
        { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" },
        "-=0.1",
      )
  }

  return (
    <section ref={pageRef} className="landing-page">
      <div className="landing-bg" aria-hidden="true">
        <img
          src="/landing-bg.jpg"
          alt=""
          className="landing-bg-image"
          loading="eager"
        />
        <div className="landing-bg-overlay" />
      </div>
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
