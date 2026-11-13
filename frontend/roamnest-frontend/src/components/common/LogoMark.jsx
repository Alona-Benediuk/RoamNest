const LogoMark = ({ size = 40, color = '#FCC05F' }) => (
    <svg
        width={size}
        height={size * 68 / 64}
        viewBox="0 0 64 68"
        fill={color}
        role="img"
        aria-label="RoamNest"
    >
        <path d="M7 31 L32 10 L57 31" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="44" y="9" width="7" height="12" rx="1.5" />
        <rect x="26" y="22" width="5.2" height="5.2" rx="0.8" />
        <rect x="32.8" y="22" width="5.2" height="5.2" rx="0.8" />
        <rect x="26" y="28.8" width="5.2" height="5.2" rx="0.8" />
        <rect x="32.8" y="28.8" width="5.2" height="5.2" rx="0.8" />
        <path d="M5 38 C18 46 46 46 59 38 C56 41 54 43 52 44 C40 48 24 48 12 44 C9 42 7 40 5 38 Z" />
        <path d="M11 46.5 C24 51 40 51 53 46.5 L34 64.5 C33 65.6 31 65.6 30 64.5 Z" />
    </svg>
);

export default LogoMark;