import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Minus, Plus, ShoppingCart, ArrowLeft, Check } from 'lucide-react'
import { getPizzaById } from '../lib/supabase'
import { useCartStore } from '../hooks/useCart'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const SIZES = [
  { name: 'Small', multiplier: 1, description: '10"' },
  { name: 'Medium', multiplier: 1.25, description: '12"' },
  { name: 'Large', multiplier: 1.5, description: '14"' },
  { name: 'Extra Large', multiplier: 1.75, description: '16"' },
]

const EXTRA_TOPPINGS = [
  { name: 'Extra Cheese', price: 2 },
  { name: 'Pepperoni', price: 2.5 },
  { name: 'Mushrooms', price: 1.5 },
  { name: 'Olives', price: 1.5 },
  { name: 'Onions', price: 1 },
  { name: 'Bell Peppers', price: 1.5 },
  { name: 'Jalapeños', price: 1.5 },
  { name: 'Bacon', price: 3 },
  { name: 'Sausage', price: 2.5 },
  { name: 'Anchovies', price: 2 },
]

export default function PizzaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  
  const [selectedSize, setSelectedSize] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [selectedToppings, setSelectedToppings] = useState<string[]>([])
  const [specialInstructions, setSpecialInstructions] = useState('')

  const { data: pizza, isLoading, error } = useQuery({
    queryKey: ['pizza', id],
    queryFn: () => getPizzaById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !pizza) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pizza not found</h2>
          <Link to="/menu" className="btn-primary">
            Back to Menu
          </Link>
        </div>
      </div>
    )
  }

  const sizeMultiplier = SIZES[selectedSize].multiplier
  const basePrice = pizza.base_price * sizeMultiplier
  const toppingsPrice = selectedToppings.reduce((acc, topping) => {
    const toppingData = EXTRA_TOPPINGS.find(t => t.name === topping)
    return acc + (toppingData?.price || 0)
  }, 0)
  const totalPrice = (basePrice + toppingsPrice) * quantity

  const handleAddToCart = () => {
    addItem({
      pizzaId: pizza.id,
      name: pizza.name,
      imageUrl: pizza.image_url,
      size: SIZES[selectedSize].name,
      sizeMultiplier,
      quantity,
      basePrice: pizza.base_price,
      toppings: selectedToppings,
      toppingsPrice,
      specialInstructions,
    })

    toast.success(`Added ${quantity} ${pizza.name} to cart!`)
    navigate('/cart')
  }

  const toggleTopping = (topping: string) => {
    setSelectedToppings(prev =>
      prev.includes(topping)
        ? prev.filter(t => t !== topping)
        : [...prev, topping]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Menu
          </button>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={pizza.image_url}
                alt={pizza.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-full font-semibold">
              {pizza.category}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              {pizza.name}
            </h1>
            
            <p className="text-gray-600 text-lg mb-6">
              {pizza.description}
            </p>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Ingredients:</h3>
              <div className="flex flex-wrap gap-2">
                {pizza.ingredients.map((ingredient: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Select Size:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SIZES.map((size, index) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(index)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedSize === index
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{size.name}</div>
                    <div className="text-sm text-gray-500">{size.description}</div>
                    <div className="text-lg font-bold mt-1">
                      ${(pizza.base_price * size.multiplier).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Toppings */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Extra Toppings:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {EXTRA_TOPPINGS.map((topping) => (
                  <button
                    key={topping.name}
                    onClick={() => toggleTopping(topping.name)}
                    className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                      selectedToppings.includes(topping.name)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm">{topping.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">+${topping.price.toFixed(2)}</span>
                      {selectedToppings.includes(topping.name) && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Special Instructions:</h3>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests? (e.g., extra sauce, well-done)"
                className="input h-24 resize-none"
              />
            </div>

            {/* Quantity and Add to Cart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-900">Quantity:</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-3xl font-bold text-primary-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-primary w-full text-lg py-4"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}