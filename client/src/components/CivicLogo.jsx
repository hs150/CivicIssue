export default function CivicLogo({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 ${className}`}
    >
      {/* Outer Hexagonal Civic Shield */}
      <path
        d="M24 3L42 11V25C42 34.5 34.5 42.5 24 45C13.5 42.5 6 34.5 6 25V11L24 3Z"
        className="stroke-black dark:stroke-white fill-white dark:fill-black"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Internal Grid Network lines (Connecting Community Nodes) */}
      <path
        d="M24 19V37M12 20L24 27L36 20M12 29L24 37L36 29"
        className="stroke-black dark:stroke-white opacity-80"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Location Beacon Marker (Geo-Pinned Civic Action) */}
      <path
        d="M24 10C21.5 10 19.5 12 19.5 14.5C19.5 18 24 23 24 23C24 23 28.5 18 28.5 14.5C28.5 12 26.5 10 24 10Z"
        className="fill-black dark:fill-white"
      />
      <circle cx="24" cy="14.5" r="1.8" className="fill-white dark:fill-black" />
    </svg>
  );
}
