import { Card } from '../components/ui/card'

export default function Dashboard() {
	return (
		<div className="container">
			<h2 className="text-xl font-semibold mb-4">Dashboard</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card className="p-4">Quick stats and recent activity will show here.</Card>
				<Card className="p-4">Shortcuts and settings.</Card>
			</div>
		</div>
	)
}
