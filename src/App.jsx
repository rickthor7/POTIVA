import { Route, Routes } from 'react-router-dom'
import { AppLayout, PublicLayout } from './components/Layouts'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Garden from './pages/Garden'
import Care from './pages/Care'
import Journal from './pages/Journal'
import Library from './pages/Library'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import Community from './pages/Community'
import Account from './pages/Account'
import Scan from './pages/Scan'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/masuk" element={<Login />} />
        <Route path="/daftar" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/app" element={<Dashboard />} />
        <Route path="/garden" element={<Garden />} />
        <Route path="/care" element={<Care />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/library" element={<Library />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/community" element={<Community />} />
        <Route path="/account" element={<Account />} />
        <Route path="/scan" element={<Scan />} />
      </Route>
    </Routes>
  )
}
