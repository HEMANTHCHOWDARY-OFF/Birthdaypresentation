import type { Memory } from "../config/birthdayConfig"

export function MemoryPhoto({
  memory,
  index,
  top,
}: {
  memory: Memory
  index: number
  top: number
}) {
  const words = memory.message.split(" ")
  const highlightedWords = new Set([
    "journey",
    "moments",
    "memories",
    "laugh",
    "glad",
    "together",
    "best",
    "yet",
    "brother",
    "adventure",
    "rare",
    "smiles",
    "stronger",
    "stories",
    "chaotic",
    "unforgettable",
  ])

  return (
    <article
      className={`memory memory--${memory.position}`}
      data-memory-index={index}
      style={{ top }}
      aria-label={`Memory ${index + 1}`}
    >
      <div className="memory-aura" aria-hidden="true" />
      <div className="memory-photo-wrap">
        <span className="tape" aria-hidden="true" />
        <div className="memory-photo">
          <img
            src={memory.image}
            alt={memory.imageAlt}
            style={{
              objectPosition: memory.objectPosition || "center 20%",
            }}
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="photo-footer">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{memory.date}</span>
        </div>
      </div>
      <div className="memory-caption">
        <p>
          {words.map((word, wordIndex) => {
            const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "")
            return (
              <span
                className={`caption-word ${
                  highlightedWords.has(cleanWord)
                    ? "caption-word--accent"
                    : ""
                }`}
                key={`${word}-${wordIndex}`}
              >
                {word}{" "}
              </span>
            )
          })}
        </p>
      </div>
    </article>
  )
}
