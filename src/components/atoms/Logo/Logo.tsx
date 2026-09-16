import styles from "./Logo.module.css";

type LogoProps = {
  showText?: boolean;
  mark?: "red" | "white";
  size?: number;
};

export function Logo({ showText = true, mark = "red", size = 38 }: LogoProps) {
  const isWhiteMark = mark === "white";

  return (
    <div className={styles.logo}>
      <div
        className={styles.mark}
        style={{
          width: size,
          height: size,
          background: isWhiteMark ? "#fff" : "var(--c-red)",
        }}
      >
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="7" r="2.4" fill={isWhiteMark ? "#C8102E" : "#fff"} />
          <circle cx="18" cy="6" r="2.4" fill={isWhiteMark ? "#C8102E" : "#fff"} />
          <circle cx="12" cy="17.5" r="2.4" fill={isWhiteMark ? "#C8102E" : "#fff"} />
          <path
            d="M7.6 8.6 10.6 15.4M16.4 7.8 13.4 15.4M8.1 6.9 15.9 6.2"
            stroke={isWhiteMark ? "#C8102E" : "#fff"}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showText ? <b className={styles.word}>Conecta U</b> : null}
    </div>
  );
}
