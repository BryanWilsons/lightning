export const ICONS = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  package: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  truck: 'M3 6h11v9H3zM14 10h4l3 3v2h-7zM6.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  pin: 'M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  card: 'M3 6h18v12H3zM3 10h18M7 15h4',
  life: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 5l4 4M19 5l-4 4M5 19l4-4M19 19l-4-4',
  inbox: 'M4 4h16l1 8v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7zM3 12h6l1.5 3h3L15 12h6',
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 17c6 0 4-8 10-8',
  building: 'M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M14 21h6v-9l-6-4M8 7h1M8 11h1M8 15h1',
  users: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 21v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M17 11a3 3 0 1 0 0-6M23 21v-1a5 5 0 0 0-4-4.9',
  chart: 'M4 20V10M12 20V4M20 20v-7',
  menu: 'M4 6h16M4 12h16M4 18h16',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  file: 'M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18',
  files: 'M8 4H18A2 2 0 0 1 20 6V18A2 2 0 0 1 18 20H8A2 2 0 0 1 6 18V6A2 2 0 0 1 8 4ZM4 8V20A2 2 0 0 0 6 22H16M10 9H16M10 13H16M10 17H14',
};

export default function Icon({ d, size = 17 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}