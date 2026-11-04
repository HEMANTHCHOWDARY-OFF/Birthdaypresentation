export type MemoryPosition = "left" | "right"

export interface Memory {
  id: number
  image: string
  imageAlt: string
  date: string
  message: string
  position: MemoryPosition
  objectPosition?: string
}

export const birthdayConfig = {
  friendName: "My Favorite Human",
  countdown: {
    enabled: true,
    targetDate: "2026-11-04T09:00:00+05:30",
  },
  intro: {
    eyebrow: "A small story about us",
    title: " Vishwambhara presents.",
    subtitle: "this one is for you.",
    buttonLabel: "Get started",
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
      image: "/photo1.jpeg",
      imageAlt: "Memory 1",
      date: "Chapter one",
      message: "Chaitu with letha letha meesalu ( pilla baccha )",
      position: "left",
      objectPosition: "center 35%",
    },
    {
      id: 2,
      image: "/photo2.jpeg",
      imageAlt: "Memory 2",
      date: "Golden days",
      message: " Chaitu with asif ( Ok le ra mi iddhare friends le 👍)",
      position: "right",
      objectPosition: "center 40%",
    },
    {
      id: 3,
      image: "/photo3.jpeg",
      imageAlt: "Memory 3",
      date: "The loud years",
      message:
        "# Kadiri model with dio ( bgm : bahubali )",
      position: "left",
      objectPosition: "center 25%",
    },
    {
      id: 4,
      image: "/photo4.jpeg",
      imageAlt: "Memory 4",
      date: "Pure unfiltered",
      message: " Chaitu with his best friend ( handsome boy ) ",
      position: "right",
      objectPosition: "center 22%",
    },
    {
      id: 5,
      image: "/photo5.jpeg",
      imageAlt: "Memory 5",
      date: "Through every storm",
      message:
        "Chaitu at YUVA innovation ❤️",
      position: "left",
      objectPosition: "center 15%",
    },
    {
      id: 6,
      image: "/photo6.jpeg",
      imageAlt: "Memory 6",
      date: "A rare brother",
      message: "Chaitu enjoying nature ( ALLU-VERA )",
      position: "right",
      objectPosition: "center top",
    },
    {
      id: 7,
      image: "/photo7.jpeg",
      imageAlt: "Memory 7",
      date: "Good times",
      message: "Chaitu in mirror selfie",
      position: "left",
      objectPosition: "center 8%",
    },
    {
      id: 8,
      image: "/photo8.jpeg",
      imageAlt: "Memory 8",
      date: "Still here",
      message: " Chaitu with chain and shades",
      position: "right",
      objectPosition: "center 18%",
    },
    {
      id: 9,
      image: "/photo9.jpeg",
      imageAlt: "Memory 9",
      date: "To be continued",
      message:
        "ABBA ! em undhi #######    nuvvu na gundekai rahh  ",
      position: "left",
      objectPosition: "center 18%",
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
