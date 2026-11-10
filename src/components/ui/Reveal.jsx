import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/** Fades + lifts its children into view once, as the user scrolls. */
export const Reveal = ({
  children,
  className,
  delay = 0,
  y = 20,
  x = 0,
  scale = 1,
  as = "div",
  amount = 0.15,
  ...rest
}) => {
  const Component = motion[as] || motion.div;
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Component>
  );
};

/** Staggers direct <RevealItem> children. */
export const RevealGroup = ({ children, className, stagger = 0.06, as = "div" }) => {
  const Component = motion[as] || motion.div;
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Component>
  );
};

export const RevealItem = ({ children, className, as = "div", ...rest }) => {
  const Component = motion[as] || motion.div;
  return (
    <Component
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
      {...rest}
    >
      {children}
    </Component>
  );
};
