export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Deep gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95" />

      {/* Animated gradient blobs */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full opacity-20 blur-[120px] animate-float"
        style={{
          background: 'radial-gradient(circle, hsl(172 80% 50%) 0%, transparent 70%)',
          animationDelay: '0s',
        }}
      />
      <div
        className="absolute top-1/3 -right-1/4 w-[55vw] h-[55vw] rounded-full opacity-15 blur-[120px] animate-float"
        style={{
          background: 'radial-gradient(circle, hsl(30 85% 55%) 0%, transparent 70%)',
          animationDelay: '2s',
        }}
      />
      <div
        className="absolute -bottom-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full opacity-12 blur-[120px] animate-float"
        style={{
          background: 'radial-gradient(circle, hsl(190 70% 50%) 0%, transparent 70%)',
          animationDelay: '4s',
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Vignette */}
      <div className="vignette" />
    </div>
  );
}
