import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from '@/routes/Login'
import ForgotPassword from '@/routes/ForgotPassword'
import UpdatePassword from '@/routes/UpdatePassword'
import { SiteLayout } from '@/components/site-layout'
import Guide from '@/routes/Guide'
import StrategyDetail from '@/routes/StrategyDetail'
import Playground from '@/routes/Playground'
import CheatSheet from '@/routes/CheatSheet'
import Quiz from '@/routes/Quiz'
import Progress from '@/routes/Progress'
import NotFound from '@/routes/NotFound'

// BrowserRouter (clean URLs, no #). The mount path is never hardcoded here — the engine
// bakes it in as Vite's `base` (VITE_APP_BASE, see vite.config.ts) and the app reads it
// back as BASE_URL, so one value covers every slot it serves. A deploy build bakes '/'
// (the app's domain root → basename normalizes to undefined = root); a preview slot bakes
// its /agent-api/… path. The trailing slash goes because react-router rejects '/a/b'
// against basename '/a/b/'.
const APP_BASE = import.meta.env.BASE_URL
const basename = (APP_BASE.startsWith('/') ? APP_BASE.replace(/\/+$/, '') : '') || undefined

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/" element={<SiteLayout><Guide /></SiteLayout>} />
        <Route path="/guide/:slug" element={<SiteLayout><StrategyDetail /></SiteLayout>} />
        <Route path="/playground" element={<SiteLayout><Playground /></SiteLayout>} />
        <Route path="/cheatsheet" element={<SiteLayout><CheatSheet /></SiteLayout>} />
        <Route path="/quiz" element={<SiteLayout><Quiz /></SiteLayout>} />
        <Route path="/progress" element={<SiteLayout><Progress /></SiteLayout>} />
        <Route path="*" element={<SiteLayout><NotFound /></SiteLayout>} />
      </Routes>
    </BrowserRouter>
  )
}
