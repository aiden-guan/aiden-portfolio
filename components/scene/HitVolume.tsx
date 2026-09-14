"use client";

export function HitVolume({
  radius,
  height = 2.1,
  y = 1.05,
}: {
  radius: number;
  height?: number;
  y?: number;
}) {
  return (
    <mesh position={[0, y, 0]}>
      <cylinderGeometry args={[radius, radius, height, 12]} />
      <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
    </mesh>
  );
}
