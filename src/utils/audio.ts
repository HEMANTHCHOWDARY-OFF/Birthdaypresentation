// Background Audio Controller for Birthday Journey

type AudioListener = (isPlaying: boolean) => void

class BackgroundAudioManager {
  private audio: HTMLAudioElement | null = null
  private listeners: Set<AudioListener> = new Set()
  private isPlaying = false
  private startTime = 11 // Start from 00:11 (11 seconds)
  private pendingPlay = false // tracks if the user wants music playing

  private getAudioInstance(): HTMLAudioElement {
    if (!this.audio) {
      const audio = new Audio('/audio/bg-music.mp3')
      audio.loop = true
      audio.preload = 'auto'
      audio.volume = 1

      audio.addEventListener('play', () => {
        this.isPlaying = true
        this.notify()
      })

      audio.addEventListener('pause', () => {
        this.isPlaying = false
        this.notify()
      })

      audio.addEventListener('ended', () => {
        this.isPlaying = false
        this.notify()
      })

      this.audio = audio
    }
    return this.audio
  }

  public playFromStart(seekTime = this.startTime): Promise<void> | undefined {
    if (typeof window === 'undefined') return

    this.pendingPlay = true
    const audio = this.getAudioInstance()
    audio.volume = 1

    const applySeek = () => {
      try {
        audio.currentTime = seekTime
      } catch (err) {
        console.warn('Seek error:', err)
      }
    }

    if (audio.readyState >= 1) {
      applySeek()
    } else {
      audio.addEventListener('loadedmetadata', applySeek, { once: true })
    }

    const promise = audio.play()
    if (promise) {
      return promise.catch((error) => {
        console.warn('Background audio playback was prevented:', error)
        // Register a one-time interaction listener to retry on next user gesture
        this.registerAutoplayRetry()
      })
    }
  }

  /**
   * Registers a one-time listener that retries playback on the first
   * user interaction (click / keydown / touchstart). This handles browsers
   * that block autoplay until the user has interacted with the page.
   */
  private registerAutoplayRetry(): void {
    const events = ['click', 'keydown', 'touchstart'] as const
    const retry = () => {
      events.forEach((e) => window.removeEventListener(e, retry))
      if (this.pendingPlay && this.audio?.paused) {
        this.audio.volume = 1
        this.audio.play().catch(() => {/* silently ignore */})
      }
    }
    events.forEach((e) => window.addEventListener(e, retry, { once: true }))
  }

  public pause(): void {
    this.pendingPlay = false
    if (this.audio && !this.audio.paused) {
      this.audio.pause()
    }
  }

  public resume(): Promise<void> | undefined {
    this.pendingPlay = true
    if (!this.audio) {
      return this.playFromStart()
    }
    if (this.audio.paused) {
      this.audio.volume = 1
      return this.audio.play().catch((err) => {
        console.warn('Audio resume error:', err)
      })
    }
  }

  public toggle(): void {
    if (!this.audio) {
      this.playFromStart()
      return
    }

    if (this.audio.paused) {
      this.resume()
    } else {
      this.pause()
    }
  }

  public getIsPlaying(): boolean {
    return Boolean(this.audio && !this.audio.paused)
  }

  public setVolume(volume: number): void {
    const audio = this.getAudioInstance()
    audio.volume = Math.max(0, Math.min(1, volume))
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener)
    listener(this.getIsPlaying())
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    const playing = this.getIsPlaying()
    this.listeners.forEach((listener) => listener(playing))
  }
}

export const backgroundMusic = new BackgroundAudioManager()

