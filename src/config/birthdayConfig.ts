export type MemoryPosition = "left" | "right"

export interface Memory {
  id: number
  image: string
  imageAlt: string
  date: string
  message: string
  position: MemoryPosition
}

export const birthdayConfig = {
  friendName: "My Favorite Human",
  countdown: {
    enabled: true,
    targetDate: "2026-11-04T00:00:00+05:30",
  },
  intro: {
    eyebrow: "A small story about us",
    title: "Some memories deserve their own journey.",
    subtitle: "And this one is for you.",
    buttonLabel: "Let's begin",
  },
  timings: {
    particleTravelDuration: 2.5,
    arrivalDuration: 0.4,
    photoRevealDuration: 1,
    messageRevealDuration: 1.25,
    readingDuration: 4.5,
    transitionDuration: 0.75,
    finaleTravelDuration: 3.5,
    finaleRevealDuration: 2.2,
  },
  camera: {
    viewportAnchor: 0.44,
    anticipation: 0.008,
  },
  memories: [
    {
      id: 1,
      image: "/images/memory-1.jpg",
      imageAlt: "Friends laughing together outside",
      date: "Chapter one",
      message: "The beginning of our wonderfully chaotic journey.",
      position: "left",
    },
    {
      id: 2,
      image: "/images/memory-2.jpg",
      imageAlt: "Friends sitting together in the glow of sunset",
      date: "Golden days",
      message: "Some afternoons quietly become the moments we never forget.",
      position: "right",
    },
    {
      id: 3,
      image: "/images/memory-3.jpg",
      imageAlt: "A group of friends sharing a candid moment",
      date: "The loud years",
      message:
        "The memories that still make me laugh before I finish the story.",
      position: "left",
    },
    {
      id: 4,
      image: "/images/memory-4.jpg",
      imageAlt: "Two friends smiling together",
      date: "Still here",
      message:
        "Through every detour and all the chaos, I am glad we stayed together.",
      position: "right",
    },
    {
      id: 5,
      image: "/images/memory-5.jpg",
      imageAlt: "Two close friends sharing a quiet portrait",
      date: "To be continued",
      message:
        "The best part is knowing our favorite memories have not happened yet.",
      position: "left",
    },
  ] satisfies Memory[],
  finalMessage: {
    eyebrow: "One more thing",
    title: "Happy Birthday, Brother.",
    paragraphs: [
      "Life gave me many people to meet, but I am especially glad it gave me a friend like you.",
      "Thank you for being part of so many unforgettable memories.",
    ],
    signoff: "Here’s to all the stories still ahead of us.",
  },
}
