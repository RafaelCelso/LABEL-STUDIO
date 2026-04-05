import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

export function SectionWrapper({
  id,
  className,
  children,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-12 px-4 sm:py-16 md:py-20 overflow-x-hidden",
        className,
      )}
    >
      {children}
    </section>
  );
}
