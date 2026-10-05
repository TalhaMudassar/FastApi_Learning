'use client'

import Link from 'next/link'

const ProductCard = ({product}) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition">
      <Link href={`/product/${product.slug}`}>
        <img
          className="w-full h-48 object-cover rounded"
          src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${product.image_url.replace(/\\/g, '/')}`}
          alt={product.title}
        />
        <h2 className="text-lg font-semibold mt-2">{product.title}</h2>
        <p className="text-gray-600">₹ {product.price}</p>
      </Link>
    </div>
  )
}

export default ProductCard
