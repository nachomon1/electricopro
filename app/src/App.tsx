import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from "./pages/Login"
import Directorio from "./pages/Directorio"
import Profesional from "./pages/Profesional"
import Planes from "./pages/Planes"
import Publicar from "./pages/Publicar"
import Panel from "./pages/Panel"
import PagoResultado from "./pages/PagoResultado"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/directorio" element={<Directorio />} />
      <Route path="/profesional/:slug" element={<Profesional />} />
      <Route path="/planes" element={<Planes />} />
      <Route path="/publicar" element={<Publicar />} />
      <Route path="/panel" element={<Panel />} />
      <Route path="/pago/resultado" element={<PagoResultado />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
