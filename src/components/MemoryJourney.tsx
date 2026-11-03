import { useEffect, useMemo, useRef, useState } from "react"
import { Pause, Play, Sparkles } from "lucide-react"
import gsap from "gsap"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { birthdayConfig } from "../config/birthdayConfig"
import { AmbientParticles } from "./AmbientParticles"
import { BirthdayFinale } from "./BirthdayFinale"
import { CurvedMemoryPath } from "./CurvedMemoryPath"
import { MemoryPhoto } from "./MemoryPhoto"

gsap.registerPlugin(MotionPathPlugin, ScrollToPlugin)

const FIRST_MEMORY_Y = 470
const MEMORY_GAP = 790
const CARD_OFFSET = 270
const TRAIL_COUNT = 5

interface PathPoint {
  x: number
  y: number
}

interface JourneyGeometry {
  canvasTop: number
  canvasWidth: number
}

function getAnchor(memoryIndex: number, position: "left" | "right") {
  return {
    x: position === "left" ? 365 : 635,
    y: FIRST_MEMORY_Y + memoryIndex * MEMORY_GAP,
  }
}

function makePath() {
  const anchors = birthdayConfig.memories.map((memory, index) =>
    getAnchor(index, memory.position),
  )
  const first = anchors[0]
  let data = `M 500 70 C 500 220, ${first.x} 250, ${first.x} ${first.y}`

  for (let index = 1; index < anchors.length; index += 1) {
    const previous = anchors[index - 1]
    const current = anchors[index]
    const midpoint = (previous.y + current.y) / 2
    data += ` C ${previous.x} ${midpoint - 100}, ${current.x} ${midpoint + 100}, ${current.x} ${current.y}`
  }

  const last = anchors.at(-1)!
  data += ` C ${last.x} ${last.y + 220}, 500 ${last.y + 320}, 500 ${last.y + 480}`
  return { data, anchors, height: last.y + 560 }
}

function pathProgressAt(path: SVGPathElement, target: PathPoint) {
  const length = path.getTotalLength()
  let closestLength = 0
  let closestDistance = Number.POSITIVE_INFINITY
  const samples = 900

  for (let sample = 0; sample <= samples; sample += 1) {
    const currentLength = (sample / samples) * length
    const point = path.getPointAtLength(currentLength)
    const distance = Math.hypot(point.x - target.x, point.y - target.y)
    if (distance < closestDistance) {
      closestDistance = distance
      closestLength = currentLength
    }
  }

  return closestLength / length
}

export function MemoryJourney() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const particleRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const progressRef = useRef(0)
  const autoFollowRef = useRef(true)
  const [paused, setPaused] = useState(false)
  const [autoFollow, setAutoFollow] = useState(true)
  const path = useMemo(makePath, [])
  const { timings, memories, camera } = birthdayConfig

  useEffect(() => {
    if (
      !rootRef.current ||
      !canvasRef.current ||
      !pathRef.current ||
      !particleRef.current
    ) {
      return
    }

    const root = rootRef.current
    const canvas = canvasRef.current
    const svgPath = pathRef.current
    const particle = particleRef.current
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    const originalScrollBehavior = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = "auto"

    const geometry: JourneyGeometry = {
      canvasTop: 0,
      canvasWidth: 0,
    }

    const updateGeometry = () => {
      geometry.canvasTop = canvas.getBoundingClientRect().top + window.scrollY
      geometry.canvasWidth = canvas.clientWidth
    }
    updateGeometry()

    const interruptFollow = () => {
      if (!autoFollowRef.current) return
      autoFollowRef.current = false
      setAutoFollow(false)
      gsap.killTweensOf(window)
    }

    window.addEventListener("resize", updateGeometry)
    window.addEventListener("wheel", interruptFollow, { passive: true })
    window.addEventListener("touchstart", interruptFollow, { passive: true })

    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".memory")
      const pathStops = gsap.utils.toArray<HTMLElement>(".path-stop")
      const trails = gsap.utils.toArray<HTMLElement>(".path-trail-dot")
      const progressLength = svgPath.getTotalLength()
      const rawPath = MotionPathPlugin.getRawPath(svgPath)
      const setParticleX = gsap.quickSetter(particle, "x", "px")
      const setParticleY = gsap.quickSetter(particle, "y", "px")
      const setTrailPositions = trails.map((trail) => ({
        x: gsap.quickSetter(trail, "x", "px"),
        y: gsap.quickSetter(trail, "y", "px"),
      }))
      const setPathProgress = gsap.quickSetter(svgPath, "strokeDashoffset")
      const ambientLightOne = root.querySelector(".ambient-light--one")
      const ambientLightTwo = root.querySelector(".ambient-light--two")
      const setLightOneY = ambientLightOne
        ? gsap.quickSetter(ambientLightOne, "y", "px")
        : () => undefined
      const setLightTwoY = ambientLightTwo
        ? gsap.quickSetter(ambientLightTwo, "y", "px")
        : () => undefined
      const initialCameraY = window.scrollY
      let initialFollowEnd = 0.05

      const getPoint = (progress: number) =>
        MotionPathPlugin.getPositionOnPath(
          rawPath,
          gsap.utils.clamp(0, 1, progress),
        ) as PathPoint

      const getCameraY = (progress: number) => {
        const anticipatedProgress = Math.min(1, progress + camera.anticipation)
        const point = getPoint(anticipatedProgress)
        const target =
          geometry.canvasTop +
          point.y -
          window.innerHeight * camera.viewportAnchor
        const maximum =
          document.documentElement.scrollHeight - window.innerHeight
        return gsap.utils.clamp(0, Math.max(0, maximum), target)
      }

      const renderProgress = (progress: number, followCamera: boolean) => {
        progressRef.current = progress
        const point = getPoint(progress)
        const scaleX = geometry.canvasWidth / 1000
        setParticleX(point.x * scaleX - 7.5)
        setParticleY(point.y - 7.5)
        setPathProgress(progressLength * (1 - progress))

        setTrailPositions.forEach((setters, index) => {
          const trailPoint = getPoint(progress - (index + 1) * 0.0035)
          setters.x(trailPoint.x * scaleX - 3)
          setters.y(trailPoint.y - 3)
        })

        setLightOneY(progress * path.height * 0.11)
        setLightTwoY(-progress * path.height * 0.07)

        if (followCamera && autoFollowRef.current) {
          const initialBlend = gsap.utils.clamp(
            0,
            1,
            progress / initialFollowEnd,
          )
          window.scrollTo(
            0,
            gsap.utils.interpolate(
              initialCameraY,
              getCameraY(progress),
              initialBlend,
            ),
          )
        }
      }

      gsap.set(svgPath, {
        strokeDasharray: progressLength,
        strokeDashoffset: progressLength,
      })
      gsap.set(cards, { autoAlpha: 0 })
      cards.forEach((card) => {
        gsap.set(card.querySelector(".memory-photo-wrap"), {
          scale: 0.87,
          filter: "blur(8px)",
        })
      })
      gsap.set(".memory-aura", { scale: 0.55, autoAlpha: 0 })
      gsap.set(pathStops, { scale: 0.25, autoAlpha: 0 })
      gsap.set(".arrival-burst i", { scale: 0, autoAlpha: 0 })
      gsap.set(".endpoint-burst i", {
        x: 0,
        y: 0,
        scale: 0.2,
        autoAlpha: 0,
      })
      gsap.set(".caption-word", {
        y: 26,
        autoAlpha: 0,
        letterSpacing: "0.08em",
      })
      gsap.set(".birthday-finale .finale-copy > *", {
        y: 35,
        autoAlpha: 0,
      })
      gsap.set(".birthday-finale", { autoAlpha: 0 })
      gsap.set(".finale-confetti i", { y: -80, autoAlpha: 0, rotate: 0 })
      renderProgress(0, false)

      if (reduceMotion) {
        gsap.set(root, { autoAlpha: 1 })
        gsap.set(cards, { autoAlpha: 1 })
        gsap.set(".memory-photo-wrap", {
          scale: 1,
          filter: "blur(0px)",
        })
        gsap.set(".memory-aura, .path-stop", {
          scale: 1,
          autoAlpha: 1,
        })
        gsap.set(".caption-word", {
          y: 0,
          autoAlpha: 1,
          letterSpacing: "0em",
        })
        gsap.set(svgPath, { strokeDashoffset: 0 })
        gsap.set(particle, { opacity: 0 })
        gsap.set(trails, { opacity: 0 })
        gsap.set(".birthday-finale", { autoAlpha: 1 })
        gsap.set(".birthday-finale .finale-copy > *", {
          y: 0,
          autoAlpha: 1,
        })
        return
      }

      const stops = path.anchors.map((anchor) =>
        pathProgressAt(svgPath, anchor),
      )
      initialFollowEnd = stops[0] * 0.65
      const finale = root.querySelector<HTMLElement>(".birthday-finale")
      const journeyState = { progress: 0 }
      const cameraState = { y: 0 }
      const timeline = gsap.timeline()
      timelineRef.current = timeline
      timeline.set(root, { autoAlpha: 1 })

      memories.forEach((_, index) => {
        const card = cards[index]
        const photo = card.querySelector(".memory-photo-wrap")
        const aura = card.querySelector(".memory-aura")
        const connection = pathStops[index]
        const burst = connection.querySelectorAll(".arrival-burst i")
        const words = card.querySelectorAll(".caption-word")
        const accentWords = card.querySelectorAll(".caption-word--accent")
        const end = stops[index]
        const wordStagger =
          words.length > 1
            ? Math.max(
                0.045,
                (timings.messageRevealDuration - 0.7) / (words.length - 1),
              )
            : 0

        timeline
          .to(journeyState, {
            progress: end,
            duration: timings.particleTravelDuration,
            ease: "power1.inOut",
            onStart: () => root.classList.add("journey--travelling"),
            onUpdate: () => renderProgress(journeyState.progress, true),
            onComplete: () => root.classList.remove("journey--travelling"),
          })
          .call(() => card.classList.add("memory--active"))
          .to(card, { autoAlpha: 1, duration: 0.1 })
          .to(
            connection,
            {
              scale: 1,
              autoAlpha: 1,
              duration: timings.arrivalDuration,
              ease: "back.out(2.6)",
            },
            "<",
          )
          .to(
            aura,
            {
              scale: 1,
              autoAlpha: 1,
              duration: timings.arrivalDuration,
              ease: "power2.out",
            },
            "<",
          )
          .fromTo(
            burst,
            {
              x: 0,
              y: 0,
              scale: 0,
              autoAlpha: 1,
            },
            {
              x: (burstIndex) =>
                Math.cos((burstIndex / burst.length) * Math.PI * 2) *
                (34 + (burstIndex % 3) * 12),
              y: (burstIndex) =>
                Math.sin((burstIndex / burst.length) * Math.PI * 2) *
                (34 + (burstIndex % 3) * 12),
              scale: (burstIndex) => 0.5 + (burstIndex % 3) * 0.2,
              autoAlpha: 0,
              duration: timings.arrivalDuration,
              ease: "power2.out",
            },
            "<",
          )
          .to(
            particle,
            {
              scale: 1.75,
              filter: "brightness(1.8)",
              duration: timings.arrivalDuration * 0.45,
              yoyo: true,
              repeat: 1,
              ease: "power2.out",
            },
            "<",
          )
          .to(photo, {
            scale: 1,
            filter: "blur(0px)",
            duration: timings.photoRevealDuration,
            ease: "power3.out",
          })
          .to(words, {
            y: 0,
            autoAlpha: 1,
            letterSpacing: "0em",
            stagger: wordStagger,
            duration: 0.7,
            ease: "power3.out",
          })
          .to(
            accentWords,
            {
              color: "#f2c987",
              textShadow: "0 0 18px rgba(233,181,111,.25)",
              duration: 0.9,
              stagger: 0.1,
            },
            "-=0.55",
          )
          .to({}, { duration: timings.readingDuration })
          .to(aura, {
            autoAlpha: 0.32,
            scale: 0.86,
            duration: timings.transitionDuration,
            ease: "power2.inOut",
          })
          .to(
            connection,
            {
              scale: 0.72,
              autoAlpha: 0.55,
              duration: timings.transitionDuration,
              ease: "power2.inOut",
            },
            "<",
          )
          .call(() => {
            card.classList.remove("memory--active")
            card.classList.add("memory--revealed")
          })
      })

      timeline
        .to(journeyState, {
          progress: 1,
          duration: timings.finaleTravelDuration,
          ease: "power2.inOut",
          onStart: () => root.classList.add("journey--travelling"),
          onUpdate: () => renderProgress(journeyState.progress, true),
          onComplete: () => root.classList.remove("journey--travelling"),
        })
        .to(particle, {
          scale: 3.4,
          filter: "brightness(2.4)",
          duration: 0.5,
          ease: "power3.out",
        })
        .fromTo(".endpoint-burst i", { x: 0, y: 0, scale: 0.2, autoAlpha: 1 }, {
          x: (index) => Math.cos((index / 18) * Math.PI * 2) * (80 + index * 4),
          y: (index) => Math.sin((index / 18) * Math.PI * 2) * (80 + index * 4),
          scale: (index) => 0.5 + (index % 4) * 0.25,
          autoAlpha: 0,
          duration: 1.4,
          stagger: 0.018,
          ease: "power3.out",
        })
        .to(
          particle,
          { scale: 0, opacity: 0, duration: 1, ease: "power2.in" },
          "-=0.9",
        )
        .to(
          ".path-shadow",
          {
            stroke: "rgba(240,187,111,.42)",
            strokeWidth: 22,
            duration: 1.4,
            ease: "power2.inOut",
          },
          "-=1.1",
        )
        .to(".birthday-finale", {
          autoAlpha: 1,
          duration: timings.finaleRevealDuration,
          ease: "power2.inOut",
        })
        .to(
          cameraState,
          {
            y: () =>
              finale
                ? finale.getBoundingClientRect().top + window.scrollY
                : geometry.canvasTop + path.height,
            duration: timings.finaleRevealDuration,
            ease: "power2.inOut",
            onStart: () => {
              cameraState.y = getCameraY(1)
            },
            onUpdate: () => {
              if (autoFollowRef.current) window.scrollTo(0, cameraState.y)
            },
          },
          "<",
        )
        .to(".finale-glow", {
          scale: 2.8,
          opacity: 0.8,
          duration: 1.8,
          ease: "power2.out",
        })
        .to(
          ".finale-confetti i",
          {
            y: (index) => 280 + (index % 6) * 48,
            x: (index) => ((index % 9) - 4) * 45,
            rotate: (index) => 180 + index * 23,
            autoAlpha: 0.75,
            duration: 3.4,
            stagger: 0.035,
            ease: "power1.out",
          },
          "-=1.2",
        )
        .to(
          ".birthday-finale .finale-copy > *",
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            stagger: 0.18,
            ease: "power3.out",
          },
          "-=2.5",
        )
    }, root)

    return () => {
      window.removeEventListener("resize", updateGeometry)
      window.removeEventListener("wheel", interruptFollow)
      window.removeEventListener("touchstart", interruptFollow)
      document.documentElement.style.scrollBehavior = originalScrollBehavior
      timelineRef.current = null
      gsap.killTweensOf(window)
      context.revert()
    }
  }, [camera, memories, path.anchors, path.height, timings])

  const togglePause = () => {
    const timeline = timelineRef.current
    if (!timeline) return
    const nextPaused = !timeline.paused()
    timeline.paused(nextPaused)
    rootRef.current?.classList.toggle("journey--paused", nextPaused)
    setPaused(nextPaused)
  }

  const resumeFollow = () => {
    if (!canvasRef.current || !pathRef.current) return
    autoFollowRef.current = true
    setAutoFollow(true)

    const rawPath = MotionPathPlugin.getRawPath(pathRef.current)
    const point = MotionPathPlugin.getPositionOnPath(
      rawPath,
      Math.min(1, progressRef.current + camera.anticipation),
    ) as PathPoint
    const canvasTop =
      canvasRef.current.getBoundingClientRect().top + window.scrollY
    const targetY =
      canvasTop + point.y - window.innerHeight * camera.viewportAnchor
    gsap.to(window, {
      scrollTo: { y: Math.max(0, targetY) },
      duration: 1.1,
      ease: "power2.inOut",
      overwrite: true,
    })
  }

  return (
    <div ref={rootRef} className="journey-root">
      <AmbientParticles />
      <div className="ambient-light ambient-light--one" aria-hidden="true" />
      <div className="ambient-light ambient-light--two" aria-hidden="true" />
      <div className="atmospheric-rays" aria-hidden="true" />
      <header className="journey-intro">
        <Sparkles size={18} strokeWidth={1.2} aria-hidden="true" />
        <p className="eyebrow">Our story, in moments</p>
        <h1>A journey through us</h1>
        <p>Follow the light. It remembers the way.</p>
      </header>

      <div className="journey-controls">
        {!autoFollow && (
          <button onClick={resumeFollow} className="follow-button">
            Follow journey
          </button>
        )}
        <button
          onClick={togglePause}
          className="pause-button"
          aria-label={paused ? "Resume story" : "Pause story"}
        >
          {paused ? (
            <Play size={15} fill="currentColor" />
          ) : (
            <Pause size={15} fill="currentColor" />
          )}
          <span>{paused ? "Resume" : "Pause"}</span>
        </button>
      </div>

      <div
        ref={canvasRef}
        className="journey-canvas"
        style={{ height: path.height }}
      >
        <CurvedMemoryPath
          ref={pathRef}
          pathData={path.data}
          height={path.height}
        />
        {path.anchors.map((anchor, index) => (
          <div
            className="path-stop"
            style={{ left: `${anchor.x / 10}%`, top: anchor.y }}
            key={`stop-${memories[index].id}`}
            aria-hidden="true"
          >
            <span className="connection-ring" />
            <span className="connection-core" />
            <div className="arrival-burst">
              {Array.from({ length: 12 }, (_, burstIndex) => (
                <i key={burstIndex} />
              ))}
            </div>
          </div>
        ))}
        {Array.from({ length: TRAIL_COUNT }, (_, index) => (
          <i
            className="path-trail-dot"
            style={{ opacity: 0.5 - index * 0.075 }}
            key={index}
            aria-hidden="true"
          />
        ))}
        <div ref={particleRef} className="path-particle" aria-hidden="true">
          <span className="particle-halo" />
          <span className="particle-core" />
          <div className="endpoint-burst">
            {Array.from({ length: 18 }, (_, index) => (
              <i key={index} />
            ))}
          </div>
        </div>
        {memories.map((memory, index) => (
          <MemoryPhoto
            key={memory.id}
            memory={memory}
            index={index}
            top={path.anchors[index].y - CARD_OFFSET}
          />
        ))}
      </div>
      <BirthdayFinale />
    </div>
  )
}
