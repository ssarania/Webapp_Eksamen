import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Quizzes from './pages/Quizzes'
import QuizDetail from './pages/QuizDetail'
import QuizCreate from './pages/QuizCreate'
import Layout from './components/Layout'
import Profile from './pages/Profile'
import GitHubCallbackHandler from './components/GitHubCallbackHandler'
import './index.css'

function App() {
	return (
		<BrowserRouter>
			<Layout>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/callback" element={<GitHubCallbackHandler />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/quizzes" element={<Quizzes />} />
					<Route path="/quizzes/:id" element={<QuizDetail />} />
					<Route path="/quiz-creation/create" element={<QuizCreate />} />
				</Routes>
			</Layout>
		</BrowserRouter>
	)
}

export default App