'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'

export default function Store() {
  const [products, setProducts] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('الكل')
  const [loading, setLoading] = useState(true)
  const [slideIndex, setSlideIndex] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const slides = ['✦ أحدث الملابس ✦', '✦ تشكيلة الصيف ✦', '✦ عروض حصرية ✦']

  useEffect(() => {
    fetchProducts()
    initParticles()
    const interval = setInterval(() => setSlideIndex(i => (i + 1) % slides.length), 3000)
    return () => clearInterval(interval)
  }, [])

  function initParticles() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: any[] = []
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random()
      })
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(250, 204, 21, ${p.alpha})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      requestAnimationFrame(animate)
    }
    animate()
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    const list = data || []
    setProducts(list)
    setFiltered(list)
    const cats = ['الكل', ...Array.from(new Set(list.map((p: any) => p.category).filter(Boolean)))]
    setCategories(cats as string[])
    setLoading(false)
  }

  function filterByCategory(cat: string) {
    setActiveCategory(cat)
    if (cat === 'الكل') setFiltered(products)
    else setFiltered(products.filter(p => p.category === cat))
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden" dir="rtl">

      {/* Particles */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />

      {/* Header / Slider */}
      <div className="relative z-10 flex flex-col items-center justify-center h-screen border-b border-yellow-400/20">
        <div className="text-center animate-fade-in">
          <p className="text-yellow-400/60 tracking-widest text-sm mb-4 uppercase">Welcome to</p>
          <h1 className="text-6xl md:text-8xl font-black text-yellow-400 tracking-widest mb-4 drop-shadow-lg">
            LUXE
          </h1>
          <div className="w-24 h-0.5 bg-yellow-400 mx-auto mb-6"></div>
          <p className="text-2xl text-white font-light tracking-wide transition-all duration-700">
            {slides[slideIndex]}
          </p>
          <button
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-10 px-8 py-3 border-2 border-yellow-400 text-yellow-400 font-bold rounded-full hover:bg-yellow-400 hover:text-black transition duration-300 tracking-widest"
          >
            تسوق الآن ↓
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-0.5 h-8 bg-yellow-400/40"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
        </div>
      </div>

      {/* المنتجات */}
      <div id="products" className="relative z-10 max-w-6xl mx-auto px-6 py-16">

        {/* فلتر */}
        <div className="flex gap-3 justify-center flex-wrap mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => filterByCategory(cat)}
              className={`px-6 py-2 rounded-full border-2 font-bold transition duration-300 tracking-wide ${
                activeCategory === cat
                  ? 'bg-yellow-400 text-black border-yellow-400 scale-105'
                  : 'bg-transparent text-yellow-400 border-yellow-400/40 hover:border-yellow-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-yellow-400 py-20 text-2xl animate-pulse">✦ جاري التحميل ✦</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filtered.map((p, i) => (
              <div
                key={p.id}
                className="group bg-gray-950 border border-yellow-400/20 rounded-3xl overflow-hidden hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-400/20 transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="overflow-hidden relative">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-72 object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                  <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition duration-300">
                    {p.category}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white text-xl mb-1">{p.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">{p.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-yellow-400 font-black text-2xl">{p.price} <span className="text-sm">دينار</span></p>
                    <p className="text-gray-600 text-xs border border-gray-700 px-2 py-1 rounded-full">
                      {p.stock > 0 ? `${p.stock} متوفر` : 'نفذت الكمية'}
                    </p>
                  </div>
                  <button className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 active:scale-95 transition duration-200 tracking-wide">
                    🛒 أضف للسلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-8 border-t border-yellow-400/20">
        <p className="text-yellow-400/40 tracking-widest text-sm">✦ LUXE STORE ✦</p>
      </div>

    </div>
  )
}
