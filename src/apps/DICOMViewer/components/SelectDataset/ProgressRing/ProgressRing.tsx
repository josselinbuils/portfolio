import { type FC } from 'preact/compat';
import styles from './ProgressRing.module.scss';

export interface ProgressRingProps {
  className?: string;
  color: string;
  progress: number;
  radius: number;
  thickness: number;
}

export const ProgressRing: FC<ProgressRingProps> = ({
  className,
  color,
  progress,
  radius,
  thickness,
}) => {
  const diameter = radius * 2;
  const normalizedRadius = radius - thickness * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference * (1 - progress);

  return (
    <svg className={className} width={diameter} height={diameter}>
      <circle
        className={styles.progressRing}
        cx={radius}
        cy={radius}
        fill="transparent"
        r={normalizedRadius}
        stroke={color}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeWidth={thickness}
      />
      <circle
        className={styles.backgroundRing}
        cx={radius}
        cy={radius}
        fill="transparent"
        r={normalizedRadius}
        stroke={color}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={0}
        strokeWidth={thickness}
      />
      <text
        dominantBaseline="middle"
        fill={color}
        lengthAdjust="spacingAndGlyphs"
        textAnchor="middle"
        textLength={radius}
        x="50%"
        y="50%"
      >
        {Math.round(progress * 100)}%
      </text>
    </svg>
  );
};
