export type Relic = {
  id: string;
  title: string;
  blurb: string;
  tourLine: string;
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
    "Aiden sits in the grass and types. He builds software that behaves like a place: storefronts you can book, a million-pixel leaderboard you can buy, Lime invites you can pass, arenas that bark back. The work is buried here. Part the field.",
  tourLine:
    "That's Aiden. He builds software that behaves like a place. Click him if you want the longer story.",
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
    tourLine:
      "SideSpace. Local attention, now bookable — storefronts, creators, routes, the places a town already looks.",
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
    tourLine:
      "The Million Dollar Leaderboard. A million pixels. Buy a square, stamp your name, then pan the whole board.",
    href: "https://milliondollarboard.lol",
    accent: "#e8c547",
    position: [5.2, 0, 2.7],
  },
  {
    id: "corgi",
    title: "Corgi",
    blurb:
      "A live bark-battle arena. Webcam faces, audio as a weapon, two dogs colliding in a pixel ring. Built with Dylan.",
    tourLine:
      "Corgi. A bark-battle arena — webcam faces, audio as a weapon, two dogs in a pixel ring. Built with Dylan.",
    github: "https://github.com/dylann4500/corgi",
    collab: true,
    accent: "#e8d5a3",
    position: [-0.2, 0, -5.1],
  },
  {
    id: "riderelay",
    title: "RideRelay",
    blurb:
      "A community board for Lime and Veo referral invites. Listing is free. Rank is real shares — your own clicks don’t count.",
    tourLine:
      "RideRelay. Lime and Veo invites on a community board. Listing is free. Rank is real shares — your own clicks don't count.",
    github: "https://github.com/aiden-guan/riderelay",
    accent: "#32d74b",
    position: [-4.6, 0, -3.55],
  },
];

export const mailbox = {
  position: [3.9, 0, -2.9] as [number, number, number],
  title: "Write",
  blurb: "The box takes letters. Mail and LinkedIn both reach Aiden.",
  tourLine: "The mailbox. Letters go to Aiden — mail and LinkedIn both land.",
  email: "aidenguan@berkeley.edu",
};

export function getRelic(id: string) {
  return relics.find((relic) => relic.id === id);
}
