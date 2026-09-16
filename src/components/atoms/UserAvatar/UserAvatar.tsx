import Image from "next/image";
import styles from "./UserAvatar.module.css";

type UserAvatarProps = {
  src?: string;
  alt?: string;
};

export function UserAvatar({ src, alt = "User" }: UserAvatarProps) {
  return (
    <div className={styles.avatar}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={32}
          height={32}
          className={styles.image}
          unoptimized
        />
      ) : (
        <div className={styles.fallback}>
          {alt[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );
}
