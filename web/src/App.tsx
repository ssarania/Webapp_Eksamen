import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Quizzes from './pages/Quizzes'
import QuizDetail from './pages/QuizDetail'
import QuizCreate from './pages/QuizCreate'
import QuizEdit from './pages/QuizEdit'
import Layout from './components/Layout'
import Profile from './pages/Profile'
import GitHubCallbackHandler from './components/GitHubCallbackHandler'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

function App() {
	return (
		<BrowserRouter>
			<Layout>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/callback" element={<GitHubCallbackHandler />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
					<Route path="/quizzes" element={<Quizzes />} />
					<Route path="/quizzes/:id" element={<QuizDetail />} />
					<Route path="/quizzes/:id/edit" element={<ProtectedRoute><QuizEdit /></ProtectedRoute>} />
					<Route path="/quiz-creation/create" element={<ProtectedRoute><QuizCreate /></ProtectedRoute>} />
				</Routes>
			</Layout>
		</BrowserRouter>
	)
}

export default App