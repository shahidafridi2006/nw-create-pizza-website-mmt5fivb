import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, X } from 'lucide-react'
import { getPizzas } from '../lib/supabase'
import PizzaCard from '../components/PizzaCard'
import LoadingSpinner from '../components/LoadingSpinner'

const categories = ['All', 'Classic', 'Specialty', 'Vegetarian', 'Meat Lovers', 'Gourmet']

interface Pizza {
  id: string
  name: string
  description: string
  image_url: string
  base_price: number
  category: string
  ingredients: string[]
  is_available: boolean
}

export default function Menu() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50])

  const { data: pizzas, isLoading, error } = useQuery({
    queryKey: ['pizzas', 'all'],
    queryFn: () => getPizzas(),
  })

  const filteredPizzas = pizzas?.filter((pizza: Pizza) => {
    const matchesSearch = pizza.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pizza.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pizza.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' || pizza.category === selectedCategory
    const matchesPrice = pizza.base_price >= priceRange[0] && pizza.base_price <= priceRange[1]
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">Failed to load pizzas. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-orange-500 text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Our Menu</h1>
          <p className="text-xl text-white/90">
            Explore our delicious selection of handcrafted pizzas
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search pizzas, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-primary-50 border-primary-500' : ''}`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('All')
                    setPriceRange([0, 50])
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredPizzas?.length || 0} pizzas
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Pizza Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredPizzas?.length === 0 ? (
          <div className="text-center py-20">
            <Pizza className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No pizzas found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPizzas?.map((pizza: Pizza) => (
              <PizzaCard key={pizza.id} pizza={pizza} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Pizza({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 10 10" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="16" cy="10" r="1" fill="currentColor" />
      <circle cx="10" cy="16" r="1" fill="currentColor" />
    </svg>
  )
}