'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
  }

  async function uploadImage(file: File) {
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('products').upload(fileName, file)
    if (error) return null
    const { data } = supabase.storage.from('products').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function addProduct() {
    if (!name || !price || !image) return alert('اكتب الاسم والسعر وارفع صورة')
    setLoading(true)
    const imageUrl = await uploadImage(image)
    if (!imageUrl) return alert('فشل رفع الصورة')
    await supabase.from('products').insert([{
      name, price: parseFloat(price), description, category, stock: parseInt(stock) || 0, image_url: imageUrl
    }])
    setName(''); setPrice(''); setDescription(''); setCategory(''); setStock(''); setImage(null)
    fetchProducts()
    setLoading(false)
  }

  async function deleteProduct(id: number) {
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  return (
    <div className="min-h-screen bg-black p-8" dir="rtl">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-yellow-400 tracking-widest">✦ لوحة التحكم ✦</h1>
        <p className="text-gray-500 mt-1">إدارة منتجات المتجر</p>
        <div className="w-32 h-0.5 bg-yellow-400 mx-auto mt-3"></div>
      </div>

      {/* فورم إضافة منتج */}
      <div className="border border-yellow-400 rounded-2xl p-6 mb-10 max-w-2xl mx-auto bg-gray-950 shadow-lg shadow-yellow-400/10">
        <h2 className="text-xl font-bold text-yellow-400 mb-5">➕ إضافة منتج جديد</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            className="bg-black border border-yellow-400/50 text-white rounded-lg p-2 placeholder-gray-600 focus:outline-none focus:border-yellow-400"
            placeholder="اسم المنتج"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            className="bg-black border border-yellow-400/50 text-white rounded-lg p-2 placeholder-gray-600 focus:outline-none focus:border-yellow-400"
            placeholder="السعر"
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
          <input
            className="bg-black border border-yellow-400/50 text-white rounded-lg p-2 placeholder-gray-600 focus:outline-none focus:border-yellow-400"
            placeholder="الفئة (مثال: تيشرت)"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
          <input
            className="bg-black border border-yellow-400/50 text-white rounded-lg p-2 placeholder-gray-600 focus:outline-none focus:border-yellow-400"
            placeholder="الكمية المتوفرة"
            type="number"
            value={stock}
            onChange={e => setStock(e.target.value)}
          />
          <textarea
            className="bg-black border border-yellow-400/50 text-white rounded-lg p-2 col-span-2 placeholder-gray-600 focus:outline-none focus:border-yellow-400"
            placeholder="الوصف"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <input
            className="bg-black border border-yellow-400/50 text-white rounded-lg p-2 col-span-2 file:bg-yellow-400 file:text-black file:border-0 file:rounded file:px-3 file:py-1 file:cursor-pointer"
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] || null)}
          />
        </div>
        <button
          onClick={addProduct}
          disabled={loading}
          className="mt-5 w-full bg-yellow-400 text-black font-bold py-2 rounded-lg hover:bg-yellow-300 transition"
        >
          {loading ? 'جاري الإضافة...' : '✦ إضافة المنتج'}
        </button>
      </div>

      {/* قائمة المنتجات */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        {products.map(p => (
          <div key={p.id} className="bg-gray-950 border border-yellow-400/30 rounded-2xl p-4 hover:border-yellow-400 transition shadow-lg">
            <img src={p.image_url} alt={p.name} className="w-full h-48 object-cover rounded-lg mb-3 border border-yellow-400/20" />
            <h3 className="font-bold text-lg text-white">{p.name}</h3>
            <p className="text-gray-500 text-sm">{p.category}</p>
            <p className="text-yellow-400 font-bold text-lg mt-1">{p.price} دينار</p>
            <p className="text-gray-600 text-sm">المخزون: {p.stock}</p>
            <button
              onClick={() => deleteProduct(p.id)}
              className="mt-3 w-full bg-transparent border border-red-500 text-red-500 py-1 rounded-lg hover:bg-red-500 hover:text-white transition"
            >
              حذف
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}