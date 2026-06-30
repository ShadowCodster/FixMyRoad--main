import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { AuthProvider } from './context/AuthContext'
import AuthorityPanelPage from './pages/AuthorityPanelPage'
import AuthoritiesPage from './pages/AuthoritiesPage'
import ComplaintPage from './pages/ComplaintPage'
import ContractorsPage from './pages/ContractorsPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import MapPage from './pages/MapPage'
import RoadDetailPage from './pages/RoadDetailPage'
import SignupPage from './pages/SignupPage'
import TrackComplaintPage from './pages/TrackComplaintPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="roads/:slNo" element={<RoadDetailPage />} />
            <Route path="complaint" element={<ComplaintPage />} />
            <Route path="track" element={<TrackComplaintPage />} />
            <Route path="authorities" element={<AuthoritiesPage />} />
            <Route path="contractors" element={<ContractorsPage />} />
            <Route path="authority" element={<AuthorityPanelPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
