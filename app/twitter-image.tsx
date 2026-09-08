import { ImageResponse } from "next/og";
import { SocialCard } from "@/components/brand/SocialCard";

export const alt =
  "Aiden Guan — building things people can play with in a moonlit meadow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<SocialCard />, size);
}
