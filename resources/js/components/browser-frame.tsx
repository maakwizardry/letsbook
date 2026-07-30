interface BrowserFrameProps {
    url: string;
    image: string;
    imageWidth: number;
    imageHeight: number;
    alt: string;
    glow?: boolean;
}

export default function BrowserFrame({ url, image, imageWidth, imageHeight, alt, glow = true }: BrowserFrameProps) {
    return (
        <div className="relative">
            {glow && (
                <div
                    className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-chart-4/10 to-chart-2/20 rounded-[2.5rem] blur-2xl"
                    aria-hidden="true"
                />
            )}
            <div className="relative bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/50">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-chart-3/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-success/40" />
                    <span className="ml-3 text-xs font-medium text-muted-foreground truncate">{url}</span>
                </div>
                <img
                    src={image}
                    alt={alt}
                    width={imageWidth}
                    height={imageHeight}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto block"
                />
            </div>
        </div>
    );
}
