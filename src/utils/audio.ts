// Background Audio Controller for Birthday Journey

type AudioListener = (isPlaying: boolean) => void

class BackgroundAudioManager {
  private audio: HTMLAudioElement | null = null
  private listeners: Set<AudioListener> = new Set()
  private isPlaying = false
  private startTime = 11 // Start from 00:11 (11 seconds)

  private getAudioInstance(): HTMLAudioElement {
    if (!this.audio) {
      const audio = new Audio('/music/bg-music.mp3')
      audio.loop = true
      audio.preload = 'auto'

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

    const audio = this.getAudioInstance()

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
      })
    }
  }

  public pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause()
    }
  }

  public resume(): Promise<void> | undefined {
    if (!this.audio) {
      return this.playFromStart()
    }
    if (this.audio.paused) {
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

