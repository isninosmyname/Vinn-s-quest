/** Code-native pixel emblems, shared by the two Volcano-world title cards. */
export function VolcanoEmblem({ king, label }: { king: boolean; label: string }) {
    return <svg viewBox="0 0 128 104" width="240" height="195" role="img" aria-label={label} style={{ display: 'block', margin: '0 auto 12px', imageRendering: 'pixelated' }}>
        <style>{`
            @keyframes emblemSmoke { from { transform: translateY(4px); opacity: .8; } to { transform: translateY(-12px); opacity: .15; } }
            @keyframes emblemGlow { 0%,100% { fill: #ff9248; } 50% { fill: #fff2ac; } }
            @keyframes emblemFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
            .volcano-emblem-smoke { animation: emblemSmoke 1.4s steps(7) infinite; }
            .volcano-emblem-glow { animation: emblemGlow 1s steps(3) infinite; }
            .volcano-emblem-body { animation: emblemFloat 1.5s steps(5) infinite; }
            @media (prefers-reduced-motion: reduce) { .volcano-emblem-smoke,.volcano-emblem-glow,.volcano-emblem-body { animation: none; } }
        `}</style>
        <path fill="#171425" d="M16 16H112V88H100V96H28V88H16Z" />
        <path fill="none" stroke="#a65d4e" strokeWidth="3" d="M20 20H108V84H96V92H32V84H20Z" />
        <g className="volcano-emblem-smoke" fill="#976a73"><path d="M47 10H59V18H47ZM65 6H77V16H65ZM58 22H70V30H58Z" /></g>
        {king ? <g className="volcano-emblem-body">
            <path fill="#b63c43" d="M42 44H86V80H78V88H50V80H42Z" />
            <path fill="#ff762e" d="M42 44V28H50V36H58V20H66V36H74V28H86V52H42Z" />
            <path className="volcano-emblem-glow" fill="#ffcc66" d="M48 45H80V55H48ZM46 70H54V78H46ZM74 70H82V78H74Z" />
            <path fill="#231927" d="M49 58H59V63H49ZM69 58H79V63H69ZM57 73H72V78H57Z" />
            <path fill="#dffcff" d="M53 58H58V61H53ZM70 58H75V61H70Z" />
        </g> : <g>
            <path fill="#76424b" d="M53 28H75V36H82V46H90V57H98V70H109V84H19V70H29V57H38V46H46V36H53Z" />
            <path fill="#492c3c" d="M64 36H82V46H90V57H98V70H109V84H64Z" />
            <path className="volcano-emblem-glow" fill="#ff9248" d="M53 28H75V34H53ZM59 34H65V45H59ZM65 44H70V54H65Z" />
            <path fill="#201724" d="M40 55H58V66H40ZM70 55H88V66H70ZM52 73H76V83H52Z" />
            <path className="volcano-emblem-glow" fill="#fff2ac" d="M43 59H55V64H43ZM73 59H85V64H73ZM58 76H70V81H58Z" />
        </g>}
    </svg>;
}
