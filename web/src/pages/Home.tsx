import { Link } from 'react-router-dom'
export default function Home() {
	return (
		<div className="space-y-8">
			<section className="bg-white p-8 rounded shadow">
				<div className="md:flex md:items-center md:justify-between">
					<div>
						<h1 className="text-3xl font-extrabold">Quizzes made simple</h1>
						<p className="mt-2 text-slate-600">Create, share and take quizzes right from your browser. Saves locally for easy development and demoing.</p>
						<div className="mt-4 flex gap-3">
							<Link to="/quizzes" className="px-4 py-2 bg-blue-600 text-white rounded">Browse quizzes</Link>
							<Link to="/quiz-create" className="px-4 py-2 border rounded">Create a quiz</Link>
						</div>
					</div>
					<div className="mt-6 md:mt-0">
						<div className="w-64 h-40 bg-linear-to-br from-blue-50 to-indigo-50 rounded flex items-center justify-center text-slate-500">Illustration</div>
					</div>
				</div>
			</section>

			<section className="grid md:grid-cols-3 gap-4">
				<div className="bg-white p-4 rounded shadow">
					<h3 className="font-semibold">Feature-rich editor</h3>
					<p className="text-sm text-slate-600 mt-2">Add questions and options dynamically. Choose correct answers and preview before saving.</p>
				</div>
				<div className="bg-white p-4 rounded shadow">
					<h3 className="font-semibold">Local-first</h3>
					<p className="text-sm text-slate-600 mt-2">All quizzes and attempts are stored in your browser's localStorage — great for demos and classrooms.</p>
				</div>
				<div className="bg-white p-4 rounded shadow">
					<h3 className="font-semibold">Easy to extend</h3>
					<p className="text-sm text-slate-600 mt-2">Integrate with server APIs later. The UI and data shapes are ready for extension.</p>
				</div>
			</section>
		</div>
	)
}
