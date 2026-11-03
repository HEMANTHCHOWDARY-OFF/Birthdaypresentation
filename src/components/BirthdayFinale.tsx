import { Sparkles } from "lucide-react"
import { birthdayConfig } from "../config/birthdayConfig"
import { AmbientParticles } from "./AmbientParticles"

export function BirthdayFinale() {
  const { friendName, finalMessage } = birthdayConfig

  return (
    <section className="birthday-finale" aria-label="Final birthday message">
      <AmbientParticles festive />
      <div className="finale-glow" aria-hidden="true" />
      <div className="finale-rays" aria-hidden="true" />
      <div className="finale-confetti" aria-hidden="true">
        {Array.from({ length: 28 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <div className="finale-copy">
        <Sparkles
          className="finale-icon"
          size={22}
          strokeWidth={1.2}
          aria-hidden="true"
        />
        <p className="eyebrow">{finalMessage.eyebrow}</p>
        <h2>{finalMessage.title}</h2>
        <div className="finale-rule" />
        {finalMessage.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p className="finale-signoff">{finalMessage.signoff}</p>
        <span className="finale-name">For {friendName}, always.</span>
      </div>
    </section>
  )
}
