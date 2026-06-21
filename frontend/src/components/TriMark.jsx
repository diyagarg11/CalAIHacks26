// mix-blend-mode: multiply makes the white background transparent on light surfaces
export function TriMark({ s = 34 }) {
  return (
    <img
      src="/logo.png"
      alt="logo"
      width={s}
      height={s}
      style={{ objectFit: "contain", mixBlendMode: "multiply", display: "block", flexShrink: 0 }}
    />
  );
}
