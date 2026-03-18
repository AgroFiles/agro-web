import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Share2,
  Search,
  Shield,
  Cloud,
  ArrowRight,
  CheckCircle2,
  Users,
  FolderOpen,
  ChevronRight,
  MapPin,
} from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img src="/logo-icon.png" alt="AgroData" className="h-12 w-auto object-contain" />
            <span className="text-lg font-bold text-gray-900 tracking-tight -ml-1">AgroData</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600 font-medium">
            <a href="#features" className="hover:text-blue-700 transition-colors">Funcionalidades</a>
            <a href="#para-quien" className="hover:text-blue-700 transition-colors">¿Para quién?</a>
            <a href="#como-funciona" className="hover:text-blue-700 transition-colors">Cómo funciona</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/sign-in">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium">
                Iniciar sesión
              </Button>
            </Link>
            <Link to="/sign-up">
              <Button className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-5">
                Crear cuenta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="/hero-campo-azul.jpg"
            alt="Campo argentino al atardecer"
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient overlay — azul suave desde la izquierda */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/70 via-blue-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-24">
          <div className="max-w-2xl">

            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <MapPin className="w-3 h-3" />
              Hecho para el campo argentino
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] mb-6 tracking-tight">
              Todos tus documentos<br />
              del campo,{' '}
              <span className="text-blue-300">en un lugar</span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100 mb-10 leading-relaxed max-w-xl">
              Gestioná, organizá y compartí los archivos de tu establecimiento agropecuario. Sin papeles, sin pérdidas, desde cualquier lugar.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link to="/sign-up">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-6 text-base shadow-2xl shadow-blue-900/50 gap-2 transition-all">
                  Empezar gratis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/sign-in">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-medium px-8 py-6 text-base backdrop-blur-sm bg-white/5">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-14 flex flex-wrap gap-10 border-t border-white/10 pt-10">
              {[
                { value: '100%', label: 'Gratuito' },
                { value: '∞', label: 'Documentos' },
                { value: 'IA', label: 'Potenciado con inteligencia artificial' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-extrabold text-white">{s.value}</p>
                  <p className="text-sm text-blue-300 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* ── Banda de confianza ─────────────────────────────────────────────── */}
      <div className="bg-blue-950 py-5">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-10 text-blue-300 text-sm font-medium">
          {['Ganadería', 'Agricultura', 'Consignatarios', 'Veterinarios', 'Asesores técnicos'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Funcionalidades</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Todo lo que necesitás, nada de lo que no
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Diseñado específicamente para el productor agropecuario moderno
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FolderOpen,
                bg: 'bg-blue-50',
                color: 'text-blue-700',
                title: 'Gestión de documentos',
                desc: 'Romaneos, DTEs, certificados sanitarios, facturas y más. Organizados por establecimiento y rubro.',
              },
              {
                icon: Share2,
                bg: 'bg-sky-50',
                color: 'text-sky-700',
                title: 'Red de colaboración',
                desc: 'Compartí con asesores, veterinarios y contadores exactamente lo que necesitan ver, sin más.',
              },
              {
                icon: Search,
                bg: 'bg-indigo-50',
                color: 'text-indigo-700',
                title: 'Búsqueda y filtros',
                desc: 'Encontrá cualquier documento en segundos filtrando por tipo, establecimiento, rubro o fecha.',
              },
              {
                icon: Users,
                bg: 'bg-violet-50',
                color: 'text-violet-700',
                title: 'Múltiples usuarios',
                desc: 'Productores y prestadores de servicios con accesos diferenciados y control granular de permisos.',
              },
              {
                icon: Cloud,
                bg: 'bg-cyan-50',
                color: 'text-cyan-700',
                title: 'Acceso desde cualquier lugar',
                desc: 'Desde el campo, la oficina o tu celular. Sin instalar nada, siempre disponible.',
              },
              {
                icon: Shield,
                bg: 'bg-blue-50',
                color: 'text-blue-700',
                title: 'Seguro y respaldado',
                desc: 'Almacenamiento en la nube con respaldo automático. Tus archivos nunca se pierden.',
              },
            ].map(({ icon: Icon, bg, color, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${bg} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Para quién ─────────────────────────────────────────────────────── */}
      <section id="para-quien" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Imagen */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] order-2 lg:order-1">
              <img
                src="/angus.jpg"
                alt="Ganadería argentina"
                className="w-full h-full object-cover"
              />
              {/* overlay azul sutil */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-transparent" />

              {/* Card flotante */}
              <div className="absolute bottom-5 left-5 right-5">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Romaneo · Lote 4B</p>
                    <p className="text-xs text-gray-400 truncate">Compartido con consignatario · Hoy</p>
                  </div>
                  <div className="flex-shrink-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Texto */}
            <div className="order-1 lg:order-2">
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-4">¿Para quién?</p>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                Para toda la cadena del agro argentino
              </h2>
              <p className="text-gray-500 text-lg mb-10 leading-relaxed">
                Ya seas productor ganadero, agrícola o prestador de servicios, AgroData se adapta a tu flujo de trabajo sin complicaciones.
              </p>

              <div className="space-y-7">
                {[
                  {
                    n: '01',
                    title: 'Productores',
                    desc: 'Cargá documentos, organizalos por establecimiento y rubro, y controlá quién puede acceder a cada archivo.',
                  },
                  {
                    n: '02',
                    title: 'Prestadores de Servicios',
                    desc: 'Accedé a los documentos de tus clientes según los rubros autorizados. Subí archivos en su nombre directamente.',
                  },
                  {
                    n: '03',
                    title: 'Asesores y Profesionales',
                    desc: 'Recibí notificaciones cuando haya nuevo material. Consultá el historial sin depender de llamadas ni WhatsApps.',
                  },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex gap-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-extrabold text-sm shadow-md shadow-blue-200">
                      {n}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 mb-1">{title}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link to="/sign-up">
                  <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-7 py-5 gap-2 text-sm">
                    Registrarme ahora
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ──────────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-28 bg-blue-950 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-800/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-800/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">Proceso</p>
            <h2 className="text-4xl font-extrabold text-white">Empezá en 3 pasos</h2>
            <p className="text-blue-300 mt-4 max-w-md mx-auto">Sin configuraciones complicadas. En minutos ya tenés tu primer documento cargado.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Línea conectora */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-blue-500/30 via-blue-400/60 to-blue-500/30" />

            {[
              {
                step: '01',
                title: 'Creá tu cuenta',
                desc: 'Solo necesitás tu email y contraseña. Sin tarjeta, sin trámites.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Subí tus documentos',
                desc: 'Arrastrá archivos PDF e imágenes. Asocialos a un establecimiento y rubro.',
                icon: FolderOpen,
              },
              {
                step: '03',
                title: 'Compartí con tu red',
                desc: 'Invitá asesores o prestadores. Controlás exactamente qué puede ver cada uno.',
                icon: Share2,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-blue-700/50 border border-blue-500/40 backdrop-blur flex items-center justify-center shadow-xl shadow-blue-950/50 z-10 relative">
                    <Icon className="w-8 h-8 text-blue-200" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-xs font-extrabold text-white shadow-md">
                    {step.replace('0', '')}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-blue-300 text-sm leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-100">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Gratis, siempre
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            El campo que produce merece<br className="hidden md:block" /> una gestión a la altura
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
            Sumarte a AgroData es gratis. Sin letra chica, sin tarjeta de crédito.
          </p>

          {/* Checkmarks */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
            {['Sin costos ocultos', 'Soporte técnico', 'Actualizado constantemente', 'Datos seguros'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                {item}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/sign-up">
              <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-10 py-6 text-base gap-2 shadow-xl shadow-blue-200">
                Crear cuenta gratis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/sign-in">
              <Button size="lg" variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 font-medium px-10 py-6 text-base">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-blue-950 text-blue-400 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo-icon.png" alt="AgroData" className="h-9 w-auto object-contain opacity-90" />
            <span className="font-semibold text-blue-200">AgroData</span>
          </div>
          <p className="text-sm">© 2025 AgroData · Desarrollado para el campo argentino</p>
          <div className="flex gap-6 text-sm">
            <Link to="/sign-in" className="hover:text-white transition-colors">Iniciar sesión</Link>
            <Link to="/sign-up" className="hover:text-white transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
