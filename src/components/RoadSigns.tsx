// SVG Road Signs for visual identification
// These are inline SVGs that render the actual sign shapes/colors
// so teens learn to recognize them by appearance, not just text

import React from 'react';

interface SignProps {
  size?: number;
  className?: string;
}

export function StopSign({ size = 80, className }: SignProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <polygon points="50,3 85,15 97,50 85,85 50,97 15,85 3,50 15,15"
        fill="#dc2626" stroke="#ffffff" strokeWidth="4" />
      <text x="50" y="58" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold" fontFamily="sans-serif">STOP</text>
    </svg>
  );
}

export function YieldSign({ size = 80, className }: SignProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 90" className={className}>
      <polygon points="50,5 95,85 5,85" fill="#ffffff" stroke="#dc2626" strokeWidth="6" />
      <text x="50" y="65" textAnchor="middle" fill="#dc2626" fontSize="16" fontWeight="bold" fontFamily="sans-serif">YIELD</text>
    </svg>
  );
}

export function SchoolZoneSign({ size = 80, className }: SignProps) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" className={className}>
      <polygon points="50,5 95,30 95,90 50,115 5,90 5,30" fill="#f59e0b" stroke="#000" strokeWidth="3" />
      <rect x="20" y="35" width="60" height="45" rx="4" fill="#000" opacity="0.15" />
      <text x="50" y="55" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold" fontFamily="sans-serif">SCHOOL</text>
      <text x="50" y="70" textAnchor="middle" fill="#000" fontSize="9" fontFamily="sans-serif">ZONE</text>
    </svg>
  );
}

export function NoPassingSign({ size = 80, className }: SignProps) {
  return (
    <svg width={size * 1.4} height={size} viewBox="0 0 140 100" className={className}>
      <polygon points="5,50 70,5 135,50 70,95" fill="#f59e0b" stroke="#000" strokeWidth="3" />
      <text x="70" y="45" textAnchor="middle" fill="#000" fontSize="14" fontWeight="bold" fontFamily="sans-serif">NO</text>
      <text x="70" y="65" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold" fontFamily="sans-serif">PASSING</text>
      <text x="70" y="80" textAnchor="middle" fill="#000" fontSize="10" fontFamily="sans-serif">ZONE</text>
    </svg>
  );
}

export function RailroadCrossingSign({ size = 80, className }: SignProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="46" fill="#f59e0b" stroke="#000" strokeWidth="3" />
      <text x="50" y="35" textAnchor="middle" fill="#000" fontSize="30" fontWeight="bold" fontFamily="sans-serif">X</text>
      <text x="30" y="70" textAnchor="middle" fill="#000" fontSize="18" fontWeight="bold" fontFamily="sans-serif">R</text>
      <text x="70" y="70" textAnchor="middle" fill="#000" fontSize="18" fontWeight="bold" fontFamily="sans-serif">R</text>
    </svg>
  );
}

export function SlowMovingVehicleSign({ size = 80, className }: SignProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 90" className={className}>
      <polygon points="50,5 95,85 5,85" fill="#f97316" stroke="#dc2626" strokeWidth="5" />
      <text x="50" y="65" textAnchor="middle" fill="#000" fontSize="14" fontWeight="bold" fontFamily="sans-serif">SMV</text>
    </svg>
  );
}

export function WarningDiamondSign({ size = 80, className, text = '⚠' }: SignProps & { text?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <polygon points="50,5 95,50 50,95 5,50" fill="#f59e0b" stroke="#000" strokeWidth="3" />
      <text x="50" y="58" textAnchor="middle" fill="#000" fontSize="28" fontFamily="sans-serif">{text}</text>
    </svg>
  );
}

export function DoubleSolidYellowLine({ size = 200, className }: SignProps) {
  return (
    <svg width={size} height={size ? 40 : 40} viewBox="0 0 200 40" className={className}>
      <rect x="0" y="0" width="200" height="40" fill="#4a5568" rx="4" />
      <rect x="10" y="17" width="180" height="4" fill="#f59e0b" rx="2" />
      <rect x="10" y="23" width="180" height="4" fill="#f59e0b" rx="2" />
      <text x="100" y="14" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">Your side</text>
    </svg>
  );
}

export function BrokenYellowLine({ size = 200, className }: SignProps) {
  return (
    <svg width={size} height={size ? 40 : 40} viewBox="0 0 200 40" className={className}>
      <rect x="0" y="0" width="200" height="40" fill="#4a5568" rx="4" />
      {[10, 30, 50, 70, 90, 110, 130, 150, 170].map(x => (
        <rect key={x} x={x} y="17" width="12" height="4" fill="#f59e0b" rx="2" />
      ))}
      <text x="100" y="35" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">Your side</text>
    </svg>
  );
}

export function RedCircleSign({ size = 80, className, text = '🚫' }: SignProps & { text?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="44" fill="#ffffff" stroke="#dc2626" strokeWidth="8" />
      <text x="50" y="60" textAnchor="middle" fill="#dc2626" fontSize="28" fontFamily="sans-serif">{text}</text>
    </svg>
  );
}

export function ConstructionSign({ size = 80, className, text = '🚧' }: SignProps & { text?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <polygon points="50,5 95,50 50,95 5,50" fill="#f97316" stroke="#000" strokeWidth="3" />
      <text x="50" y="60" textAnchor="middle" fill="#000" fontSize="28" fontFamily="sans-serif">{text}</text>
    </svg>
  );
}

export function GreenGuideSign({ size = 140, className, text = 'EXIT 42 →' }: SignProps & { text?: string }) {
  return (
    <svg width={size} height={size ? 50 : 50} viewBox="0 0 140 50" className={className}>
      <rect x="2" y="2" width="136" height="46" rx="4" fill="#16a34a" stroke="#fff" strokeWidth="2" />
      <text x="70" y="32" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="sans-serif">{text}</text>
    </svg>
  );
}

export function BlueServiceSign({ size = 80, className, text = '⛽ GAS' }: SignProps & { text?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <rect x="5" y="5" width="90" height="90" rx="8" fill="#2563eb" />
      <text x="50" y="58" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="sans-serif">{text}</text>
    </svg>
  );
}

export function WhiteRegulatorySign({ size = 80, className, text = '25 MPH' }: SignProps & { text?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <rect x="10" y="5" width="80" height="90" rx="4" fill="#ffffff" stroke="#000" strokeWidth="3" />
      <text x="50" y="55" textAnchor="middle" fill="#000" fontSize="18" fontWeight="bold" fontFamily="sans-serif">{text}</text>
    </svg>
  );
}

export function HandSignalRight({ size = 80, className }: SignProps) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" className={className}>
      <rect x="0" y="0" width="100" height="60" fill="transparent" />
      <circle cx="20" cy="30" r="15" fill="#8b5cf6" />
      <rect x="35" y="26" width="35" height="8" rx="4" fill="#8b5cf6" />
      <rect x="62" y="10" width="8" height="24" rx="4" fill="#8b5cf6" />
      <text x="50" y="55" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">Right turn signal</text>
    </svg>
  );
}

export function HandSignalLeft({ size = 80, className }: SignProps) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" className={className}>
      <circle cx="20" cy="30" r="15" fill="#8b5cf6" />
      <rect x="35" y="26" width="35" height="8" rx="4" fill="#8b5cf6" />
      <text x="50" y="55" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">Left turn signal</text>
    </svg>
  );
}

export function HandSignalStop({ size = 80, className }: SignProps) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" className={className}>
      <circle cx="20" cy="30" r="15" fill="#8b5cf6" />
      <rect x="35" y="26" width="35" height="8" rx="4" fill="#8b5cf6" />
      <rect x="62" y="30" width="8" height="24" rx="4" fill="#8b5cf6" />
      <text x="50" y="55" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">Stop/slow signal</text>
    </svg>
  );
}

// Map question IDs to their visual sign component
export const signQuestionVisuals: Record<number, React.FC<SignProps>> = {
  2: SchoolZoneSign,       // Pentagon = school zone
  3: RailroadCrossingSign, // Circle X RR
  4: NoPassingSign,        // Pennant
  14: StopSign,            // Octagon
  17: YieldSign,           // Triangle red border
  18: WarningDiamondSign,  // Yellow diamond (warning)
  19: WhiteRegulatorySign, // White rectangle
  20: HandSignalRight,     // Hand signal right turn
  100: HandSignalRight,    // Hand signal right turn (dupe we may have removed)
  112: WarningDiamondSign, // Yellow diamond (warning)
  113: YieldSign,          // Red & white triangle
  115: ConstructionSign,   // Orange diamond
  116: GreenGuideSign,    // Green sign
  117: BlueServiceSign,    // Blue sign
  135: WhiteRegulatorySign, // White sign red letters
  136: YieldSign,          // Inverted triangle shape
  150: WhiteRegulatorySign, // White line = stop line
};