type ChevronRightProps = {
  color?: string;
};

export function ChevronRight({ color = "#515B73" }: ChevronRightProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M5.25 3.5L8.75 7L5.25 10.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
