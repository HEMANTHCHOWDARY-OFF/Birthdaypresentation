const particles = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  x: (index * 47 + 11) % 100,
  y: (index * 71 + 7) % 100,
  size: 1 + (index % 3),
  delay: (index % 7) * -0.9,
  duration: 6 + (index % 5),
}))

export function AmbientParticles({ festive = false }: { festive?: boolean }) {
  return (
    <div
      className={`ambient-particles ${
        festive ? "ambient-particles--festive" : ""
      }`}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <i
          key={particle.id}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
