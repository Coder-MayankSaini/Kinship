import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import ItemDetailPage from './pages/ItemDetailPage'
import ListItemPage from './pages/ListItemPage'
import ProfilePage from './pages/ProfilePage'
import AuthPage from './pages/AuthPage'

// Import styles
import './styles/base.css'
import './styles/navigation.css'
import './styles/homepage.css'
import './styles/browse.css'
import './styles/item-detail.css'
import './styles/list-item.css'
import './styles/profile.css'
import './styles/auth.css'
import './styles/responsive.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/item/:id" element={<ItemDetailPage />} />
            <Route path="/list-item" element={<ListItemPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  )
}

export default App
