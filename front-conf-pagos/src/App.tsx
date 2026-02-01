import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}

export default App
