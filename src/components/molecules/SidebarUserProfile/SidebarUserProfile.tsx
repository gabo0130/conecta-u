import { SidebarLabel, UserAvatar } from "../../atoms";
import styles from "./SidebarUserProfile.module.css";

type SidebarUserProfileProps = {
  name: string;
  role: string;
  avatarSrc?: string;
};

export function SidebarUserProfile({ name, role, avatarSrc }: SidebarUserProfileProps) {
  return (
    <div className={styles.profile}>
      <UserAvatar src={avatarSrc} alt={name} />
      <div className={styles.text}>
        <SidebarLabel tone="inverse">
          {name}
        </SidebarLabel>
        <div className={styles.role}>
          <SidebarLabel tone="muted">
            {role}
          </SidebarLabel>
        </div>
      </div>
    </div>
  );
}
