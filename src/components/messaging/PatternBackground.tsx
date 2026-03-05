import { MessageCircle, Music, Camera, Heart, Star, Sparkles, Circle, Radio } from 'lucide-react';

interface GradientBlobProps {
  size: number;
  color: string;
  opacity: number;
  blur: number;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
}

export function GradientBlob({ size, color, opacity, blur, position }: GradientBlobProps) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity: opacity / 100,
        filter: `blur(${blur}px)`,
        ...position,
      }}
    />
  );
}

interface MessageBubbleProps {
  text: string;
  isOutgoing?: boolean;
  timestamp: string;
}

export function MessageBubble({ text, isOutgoing = false, timestamp }: MessageBubbleProps) {
  if (isOutgoing) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[280px]">
          <div
            className="px-4 py-3 rounded-[20px] bg-gradient-to-br from-purple-500 to-pink-500"
            style={{
              boxShadow: '0 8px 20px rgba(139, 92, 246, 0.25)',
            }}
          >
            <p className="text-white text-[15px] leading-relaxed">{text}</p>
          </div>
          <p className="text-white/40 text-xs mt-1 text-right">{timestamp}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[280px]">
        <div
          className="px-4 py-3 rounded-[20px] bg-white/[0.08] backdrop-blur-[40px] border border-white/10"
        >
          <p className="text-white text-[15px] leading-relaxed">{text}</p>
        </div>
        <p className="text-white/40 text-xs mt-1">{timestamp}</p>
      </div>
    </div>
  );
}

export function PatternBackground() {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: '#0F172A' }}>
      {/* SVG Pattern Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <pattern
            id="iconPattern"
            x="0"
            y="0"
            width="90"
            height="90"
            patternUnits="userSpaceOnUse"
          >
            {/* Row 1 */}
            <g opacity="0.08" stroke="white" fill="none" strokeWidth="1.5">
              {/* MessageCircle at (12, 12) */}
              <circle cx="12" cy="12" r="5" />
              <path d="M 10 12 L 14 12" />
              
              {/* World/Globe at (34, 12) */}
              <circle cx="34" cy="12" r="5" />
              <ellipse cx="34" cy="12" rx="2" ry="5" />
              <path d="M 29 12 L 39 12" />
              <path d="M 34 7 Q 31 9 31 12 Q 31 15 34 17" />
              
              {/* Headset at (56, 12) */}
              <path d="M 51 12 C 51 9 53 7 56 7 C 59 7 61 9 61 12" />
              <path d="M 51 12 L 51 15 L 53 17 L 55 17 L 55 12" />
              <path d="M 61 12 L 61 15 L 59 17 L 57 17 L 57 12" />
              
              {/* Camera at (78, 12) */}
              <rect x="73" y="9" width="10" height="6" rx="1" />
              <circle cx="78" cy="12" r="2" />
              <path d="M 75 9 L 76 8 L 80 8 L 81 9" />
            </g>

            {/* Row 2 */}
            <g opacity="0.08" stroke="white" fill="none" strokeWidth="1.5">
              {/* Basketball at (12, 34) */}
              <circle cx="12" cy="34" r="5" />
              <path d="M 12 29 L 12 39" />
              <path d="M 7 34 L 17 34" />
              <path d="M 9 30 Q 12 32 15 30" />
              <path d="M 9 38 Q 12 36 15 38" />
              
              {/* African Drum at (34, 34) */}
              <ellipse cx="34" cy="31" rx="4" ry="2" />
              <path d="M 30 31 L 30 37" />
              <path d="M 38 31 L 38 37" />
              <ellipse cx="34" cy="37" rx="4" ry="2" />
              <path d="M 31 33 L 37 35" />
              <path d="M 31 35 L 37 33" />
              
              {/* Heart at (56, 34) */}
              <path d="M 56 36 L 51 31 C 49 29 49 27 51 25 C 53 23 55 23 56 25 C 57 23 59 23 61 25 C 63 27 63 29 61 31 Z" />
              
              {/* Music note at (78, 34) */}
              <circle cx="78" cy="37" r="2" />
              <path d="M 80 37 L 80 28 L 83 27 L 83 35" />
              <circle cx="83" cy="35" r="2" />
            </g>

            {/* Row 3 */}
            <g opacity="0.08" stroke="white" fill="none" strokeWidth="1.5">
              {/* Star at (12, 56) */}
              <path d="M 12 52 L 13 54 L 15 54 L 13.5 55.5 L 14 57.5 L 12 56 L 10 57.5 L 10.5 55.5 L 9 54 L 11 54 Z" />
              
              {/* Skateboard at (34, 56) */}
              <path d="M 28 56 L 40 56" strokeLinecap="round" />
              <circle cx="30" cy="58" r="1.5" />
              <circle cx="38" cy="58" r="1.5" />
              <path d="M 30 56 L 30 58 M 38 56 L 38 58" />
              
              {/* Triple Dices at (56, 56) */}
              <rect x="51" y="53" width="6" height="6" rx="0.8" />
              <circle cx="54" cy="56" r="0.6" fill="white" />
              <rect x="57" y="54" width="6" height="6" rx="0.8" />
              <circle cx="59" cy="56" r="0.6" fill="white" />
              <circle cx="61" cy="58" r="0.6" fill="white" />
              <rect x="54" y="57" width="6" height="6" rx="0.8" />
              <circle cx="56" cy="59" r="0.6" fill="white" />
              <circle cx="57" cy="60" r="0.6" fill="white" />
              <circle cx="58" cy="61" r="0.6" fill="white" />
              
              {/* Diamond at (78, 56) */}
              <path d="M 78 52 L 82 56 L 78 60 L 74 56 Z" />
            </g>
            
            {/* Row 4 */}
            <g opacity="0.08" stroke="white" fill="none" strokeWidth="1.5">
              {/* Circle/Dot at (12, 78) */}
              <circle cx="12" cy="78" r="2.5" />
              
              {/* Radio waves at (34, 78) */}
              <circle cx="34" cy="78" r="2" />
              <path d="M 30 78 C 30 76 31.5 74 34 74 C 36.5 74 38 76 38 78" />
              
              {/* World at (56, 78) */}
              <circle cx="56" cy="78" r="5" />
              <ellipse cx="56" cy="78" rx="2" ry="5" />
              <path d="M 51 78 L 61 78" />
              
              {/* Basketball at (78, 78) */}
              <circle cx="78" cy="78" r="4.5" />
              <path d="M 78 73.5 L 78 82.5" />
              <path d="M 73.5 78 L 82.5 78" />
              <path d="M 75 75 Q 78 77 81 75" />
            </g>
          </pattern>
        </defs>
      </svg>

      {/* Apply the pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(#iconPattern)',
          fill: 'url(#iconPattern)',
        }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="url(#iconPattern)" />
        </svg>
      </div>
    </div>
  );
}

