import { birthdayConfig } from "../config/birthdayConfig"

export interface CountdownTime {
  totalMilliseconds: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function getCountdownTime(
  targetDate: string,
  currentTime = Date.now(),
): CountdownTime {
  const targetTime = Date.parse(targetDate)
  const totalMilliseconds = Number.isFinite(targetTime)
    ? Math.max(0, targetTime - currentTime)
    : 0
  const totalSeconds = Math.floor(totalMilliseconds / 1000)

  return {
    totalMilliseconds,
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  }
}

export function isCountdownActive(currentTime = Date.now()) {
  const { enabled, targetDate } = birthdayConfig.countdown
  return (
    enabled && getCountdownTime(targetDate, currentTime).totalMilliseconds > 0
  )
}
