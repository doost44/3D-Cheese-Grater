/**
 * GraterSelector — 3D tile tray displaying grater plate style options.
 *
 * Renders 5 clickable tile cards on the platform beside the grater.
 * Active tile is elevated with a cyan glow; clicking a tile swaps the grater plate.
 */
import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { GraterStyle } from "../types";
import { GRATER_STYLE_LABELS } from "../types";

const STYLES: GraterStyle[] = ["box", "microplane", "ribbon", "drum", "fine"];
const TILE_W = 0.55;
const TILE_D = 0.7;
const TILE_H = 0.06;
const GAP = 0.12;
const ACTIVE_LIFT = 0.12;
const ACTIVE_COLOR = "#2dd4bf"; // teal/cyan accent
const INACTIVE_COLOR = "#8a8a88";
const TRAY_X = -2.0; // left of grater on the platform

interface Props {
  activeStyle: GraterStyle;
  onSelect: (style: GraterStyle) => void;
}

/** Procedural mini-pattern for each grater style tile face */
function TilePattern({ style }: { style: GraterStyle }) {
  const pattern = useMemo(() => {
    const pts: { x: number; y: number; w: number; h: number; round: boolean }[] = [];
    const sw = TILE_W * 0.7;
    const sh = TILE_D * 0.65;

    switch (style) {
      case "box": {
        // Staggered round holes
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 4; c++) {
            const xOff = (r % 2) * (sw / 4) * 0.5;
            pts.push({
              x: (c / 3 - 0.5) * sw + xOff,
              y: (r / 4 - 0.5) * sh,
              w: 0.035,
              h: 0.035,
              round: true,
            });
          }
        }
        break;
      }
      case "microplane": {
        // Dense tiny holes
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 6; c++) {
            const xOff = (r % 2) * (sw / 6) * 0.5;
            pts.push({
              x: (c / 5 - 0.5) * sw + xOff,
              y: (r / 6 - 0.5) * sh,
              w: 0.018,
              h: 0.018,
              round: true,
            });
          }
        }
        break;
      }
      case "ribbon": {
        // Wide horizontal slots
        for (let r = 0; r < 4; r++) {
          pts.push({
            x: 0,
            y: (r / 3 - 0.5) * sh,
            w: sw * 0.7,
            h: 0.025,
            round: false,
          });
        }
        break;
      }
      case "drum": {
        // Circular arrangement
        const rings = [4, 8];
        rings.forEach((count, ri) => {
          const radius = (ri + 1) * 0.06;
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            pts.push({
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius,
              w: 0.022,
              h: 0.022,
              round: true,
            });
          }
        });
        // Center hole
        pts.push({ x: 0, y: 0, w: 0.025, h: 0.025, round: true });
        break;
      }
      case "fine": {
        // Dense diamond grid
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 5; c++) {
            const xOff = (r % 2) * (sw / 5) * 0.5;
            pts.push({
              x: (c / 4 - 0.5) * sw + xOff,
              y: (r / 5 - 0.5) * sh,
              w: 0.02,
              h: 0.028,
              round: false,
            });
          }
        }
        break;
      }
    }
    return pts;
  }, [style]);

  return (
    <group position={[0, TILE_H / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {pattern.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, 0]}>
          {p.round ? (
            <circleGeometry args={[p.w / 2, 6]} />
          ) : (
            <planeGeometry args={[p.w, p.h]} />
          )}
          <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Tile({
  style,
  isActive,
  positionZ,
  onClick,
}: {
  style: GraterStyle;
  isActive: boolean;
  positionZ: number;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Smooth lift/settle animation
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = isActive ? ACTIVE_LIFT : 0;
    groupRef.current.position.y +=
      (targetY - groupRef.current.position.y) * Math.min(delta * 6, 1);
  });

  return (
    <group ref={groupRef} position={[0, 0, positionZ]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        castShadow
      >
        <boxGeometry args={[TILE_W, TILE_H, TILE_D]} />
        <meshPhysicalMaterial
          color={isActive ? ACTIVE_COLOR : hovered ? "#b0b0ae" : INACTIVE_COLOR}
          roughness={isActive ? 0.3 : 0.7}
          metalness={isActive ? 0.15 : 0.05}
          emissive={isActive ? ACTIVE_COLOR : "#000000"}
          emissiveIntensity={isActive ? 0.25 : 0}
          clearcoat={isActive ? 0.3 : 0}
        />
      </mesh>

      {/* Pattern on top face */}
      <TilePattern style={style} />

      {/* Label tooltip on hover */}
      {hovered && (
        <Html
          position={[0, TILE_H + 0.15, 0]}
          center
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              padding: "3px 10px",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 600,
              whiteSpace: "nowrap",
              backdropFilter: "blur(4px)",
            }}
          >
            {GRATER_STYLE_LABELS[style]}
          </div>
        </Html>
      )}
    </group>
  );
}

export function GraterSelector({ activeStyle, onSelect }: Props) {
  const totalDepth = STYLES.length * (TILE_D + GAP) - GAP;

  return (
    <group position={[TRAY_X, 0.04, -totalDepth / 2 + TILE_D / 2]}>
      {/* Tray shelf base */}
      <mesh position={[0, -0.015, totalDepth / 2 - TILE_D / 2]}>
        <boxGeometry args={[TILE_W + 0.16, 0.02, totalDepth + 0.2]} />
        <meshStandardMaterial color="#b5b0a9" roughness={0.85} metalness={0.02} />
      </mesh>

      {STYLES.map((style, i) => (
        <Tile
          key={style}
          style={style}
          isActive={style === activeStyle}
          positionZ={i * (TILE_D + GAP)}
          onClick={() => onSelect(style)}
        />
      ))}
    </group>
  );
}
