import { ReactNode } from "react";
import { Button, MetricCard } from "../atoms";
import styles from "./DashboardSectionShell.module.css";

type DashboardSectionMetric = {
    label: string;
    value: string;
    detail?: string;
};

type DashboardSectionCard = {
    tag?: string;
    title: string;
    description: string;
};

type DashboardSectionAction = {
    icon?: ReactNode;
    label: string;
    variant?: "primary" | "secondary";
};

type DashboardSectionShellProps = {
    eyebrow: string;
    title: string;
    description: string;
    metrics?: DashboardSectionMetric[];
    cards?: DashboardSectionCard[];
    actions?: DashboardSectionAction[];
    children?: ReactNode;
    footer?: ReactNode;
};

export function DashboardSectionShell({
    eyebrow,
    title,
    description,
    metrics,
    cards,
    actions,
    children,
    footer,
}: DashboardSectionShellProps) {
    return (
        <div className={styles.shell}>
            <section className={styles.hero}>
                <div className={styles.heroHeader}>
                    <div className={styles.heroTop}>
                        <p className={styles.eyebrow}>{eyebrow}</p>
                        <div>
                            <h1 className={styles.title}>{title}</h1>
                            <p className={styles.description}>{description}</p>
                        </div>
                    </div>

                    {actions?.length ? (
                        <div className={styles.heroActions}>
                            {actions.map((action) => (
                                <Button
                                    key={action.label}
                                    variant={action.variant ?? "secondary"}
                                    leftIcon={action.icon}
                                >
                                    {action.label}
                                </Button>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>
            {metrics && metrics.length > 0 && (
                <section className={styles.metrics}>
                    {metrics.map((metric) => (
                        <MetricCard
                            key={metric.label}
                            label={metric.label}
                            value={metric.value}
                            detail={metric.detail}
                        />
                    ))}
                </section>
            )}

            {children ? (
                <section className={styles.children}>{children}</section>
            ) : null}

            {cards && cards.length > 0 && (
                <section className={styles.cards}>
                    {cards.map((card) => (
                        <article key={card.title} className={styles.card}>
                            {card.tag ? (
                                <span className={styles.cardTag}>{card.tag}</span>
                            ) : null}
                            <h2 className={styles.cardTitle}>{card.title}</h2>
                            <p className={styles.cardDescription}>{card.description}</p>
                        </article>
                    ))}
                </section>
            )}

            {footer ? <section className={styles.footer}>{footer}</section> : null}
        </div>
    );
}
