'use client';

import Link from 'next/link';

const ProductCart = ({ product }) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  
  // Safely format Windows backslashes
  const imageUrl = product?.image_url 
    ? `${baseUrl}/${product.image_url.replace(/\\/g, '/')}`
    : 'https://placehold.co/400x300?text=No+Image';

  return (
    <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition">
      <Link href={`/product/${product.slug}`}>
        <img
          className="w-full h-48 object-cover rounded"
          src={imageUrl}
          alt={product.title}
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image';
          }}
        />
        <h2 className="text-lg font-semibold mt-2">{product.title}</h2>
        <p className="text-gray-600">₹ {product.price}</p>
      </Link>
    </div>
  );
};

export default ProductCart;