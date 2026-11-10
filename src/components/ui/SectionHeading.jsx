import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

/**
 * Section header: eyebrow (with a short line that draws in on scroll),
 * title, optional description and an optional action aligned right.
 */
export const SectionHeading = ({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
  as: Title = "h2",
}) => {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto flex flex-col items-center")}>
        {eyebrow && (
          <p className="eyebrow mb-3">
            <motion.span
              aria-hidden="true"
              className="inline-block h-px w-6 bg-primary"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              style={{ originX: 0 }}
            />
            {eyebrow}
          </p>
        )}
        <Title className="text-[1.75rem] sm:text-4xl lg:text-[2.6rem] font-bold text-foreground">{title}</Title>
        {description && (
          <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
