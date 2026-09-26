import Image from "next/image";

type NiyatnaRouteLogoProps = {
  size?: number;
  className?: string;
};

export default function NiyatnaRouteLogo({ size = 20, className = "" }: NiyatnaRouteLogoProps) {
  return (
    <Image
      src="/icon-192.png"
      width={size}
      height={size}
      alt="NiyatnaRoute"
      className={className}
      suppressHydrationWarning
    />
  );
}
