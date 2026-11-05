import * as React from "react";
import { Crown } from "lucide-react";
import { Image as BaseImage } from "@/components/ui/image";
import { cn } from "@/lib/utils";

/* Every photo in the app goes through here. When a picture is missing, still
   uploading, or fails to load, it shows a branded kingdom panel instead of a
   broken / grey "no image" box — nothing on screen ever looks like an error. */
export const Image = React.forwardRef(function SkImage(
  { src, alt, className, style, onError, ...props },
  ref
) {
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        aria-label={alt || undefined}
        role={alt ? "img" : undefined}
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-map-royal via-map-deep-blue to-map-midnight",
          className
        )}
        style={style}
      >
        <Crown
          className="h-1/3 w-1/3 min-h-3 min-w-3 max-h-8 max-w-8 text-map-champagne/30"
          strokeWidth={1.4}
        />
      </div>
    );
  }

  return (
    <BaseImage
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      {...props}
    />
  );
});

Image.displayName = "SkImage";