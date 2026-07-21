const ICON_PATHS = {
  article: "M6 2h8l4 4v16H6V2Zm7 1.5V7h3.5M9 11h6M9 15h6M9 19h4",
  feed: "M5 4a15 15 0 0 1 15 15M5 10a9 9 0 0 1 9 9M6 19h.01",
  grid: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  reset: "M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7",
  search: "m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  signal: "M4 18V9m6 9V5m6 13v-7m4 7V3",
  source: "M4 7h16M6 3h12l2 4v14H4V7l2-4Zm2 8h3v3H8v-3Zm0 6h3v3H8v-3Zm6-6h2m-2 6h2",
  topics: "M20 12 12 20 4 12V4h8l8 8ZM8 8h.01",
};

function Icon({ name, size = 20, className = "" }) {
  return (
    <svg aria-hidden="true" className={`icon ${className}`} fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <path d={ICON_PATHS[name]} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export default Icon;
