export type Relic = {
  id: string;
  title: string;
  blurb: string;
  href?: string;
  github?: string;
  collab?: boolean;
  accent: string;
  position: [number, number, number];
};

export type InspectSubject =
  | { type: "relic"; id: string }
  | { type: "about" }
  | { type: "contact" };

export const founder = {
  name: "Aiden Guan",
  tagline: "building things people can play with.",
  about:
    "Aiden sits in the grass and types. He builds software that behaves like a place: storefronts you can book, a million-pixel leaderboard you can buy, arenas that bark back. The work is buried here. Part the field.",
};

export const links = {
  github: "https://github.com/kv1514",
  sidespace: "https://www.sidespace.ad",
  email: "mailto:aidenguan@berkeley.edu",
  linkedin: "https://www.linkedin.com/in/aidenguan",
};

export const relics: Relic[] = [
  {
    id: "sidespace",
    title: "SideSpace",
    blurb:
      "Local attention, now bookable. A marketplace for storefronts, creators, routes, and the places a town already looks.",
    href: "https://www.sidespace.ad",
    github: "https://github.com/kv1514/sidespace-marketplace",
    accent: "#c45c26",
    position: [-5.1, 0, 3.1],
  },
  {
    id: "milliondollarleaderboard",
    title: "Million Dollar Leaderboard",
    blurb:
      "A million-pixel canvas. Buy a square, stamp your name and a link on the board, then pan and zoom the whole leaderboard.",
    href: "https://milliondollarboard.lol",
    accent: "#e8c547",
    position: [5.2, 0, 2.7],
  },
  {
    id: "corgi",
    title: "Corgi",
    blurb:
      "A live bark-battle arena. Webcam faces, audio as a weapon, two dogs colliding in a pixel ring. Built with Dylan.",
    github: "https://github.com/dylann4500/corgi",
    collab: true,
    accent: "#e8d5a3",
    position: [-0.2, 0, -5.1],
  },
];

export const mailbox = {
  position: [3.9, 0, -2.9] as [number, number, number],
  title: "Write",
  blurb: "The box takes letters. Mail and LinkedIn both reach Aiden.",
  email: "aidenguan@berkeley.edu",
};

export function getRelic(id: string) {
  return relics.find((relic) => relic.id === id);
}
