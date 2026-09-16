import Image from "next/image";
import { CSSProperties } from "react";
import styles from "./UserAvatar.module.css";

type UserAvatarProps = {
  src?: string;
  alt?: string;
  initials?: string;
  size?: number;
  radius?: CSSProperties["borderRadius"];
};

export function UserAvatar({ src, alt = "Usuario", initials, size = 32, radius }: UserAvatarProps) {
  const fallbackText = initials ?? alt[0]?.toUpperCase();

  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size, borderRadius: radius, fontSize: size * 0.38 }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className={styles.image}
          unoptimized
        />
      ) : (
        <span>{fallbackText}</span>
      )}
    </div>
  );
}
