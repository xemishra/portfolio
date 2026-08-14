import { useState } from 'react'

const CANDIDATES = ["/assets/profile.png", "/assets/profile.jpg", "/assets/profile.jpeg"];

export default function Avatar({ name }: { name: string }) {
    const [idx, setIdx] = useState(0);
    const failedAll = idx >= CANDIDATES.length;

    const initials = name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className='avatar-ring'>
            <div className='avatar-circle'>
                {!failedAll ? (
                    <img
                        src={CANDIDATES[idx]}
                        alt={name}
                        onError={() => setIdx((i) => i + 1)}
                    />
                ) : (
                    <span className='avatar-fallback'>{initials}</span>
                )}
            </div>
        </div>
    );
}