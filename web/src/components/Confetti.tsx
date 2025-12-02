import { useEffect, useState } from 'react'

type Piece = { id: number; left: number; color: string; delay: number }

const COLORS = ['#ff7b7b', '#ffd166', '#06d6a0', '#4da6ff', '#c084fc']

export default function Confetti({ count = 40, onDone }: { count?: number; onDone?: () => void }) {
	const [pieces, setPieces] = useState<Piece[]>([])

	useEffect(() => {
		const list: Piece[] = Array.from({ length: count }).map((_, i) => ({ id: i, left: Math.random() * 100, color: COLORS[i % COLORS.length], delay: Math.random() * 300 }))
		setPieces(list)
		const t = setTimeout(() => onDone && onDone(), 1800)
		return () => clearTimeout(t)
	}, [count, onDone])

	return (
		<div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
			{pieces.map(p => (
				<span key={p.id} className="absolute" style={{ left: `${p.left}%`, top: '-10%', transform: `rotate(${Math.random() * 360}deg)`, animationDelay: `${p.delay}ms` }}>
					<i className="block w-3 h-5" style={{ background: p.color, display: 'block', animation: 'confetti-fall 1.6s linear forwards' }} />
				</span>
			))}
		</div>
	)
}
