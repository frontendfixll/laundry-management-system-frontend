'use client'

import { useState, useEffect } from 'react'
import { blogApi, BlogPost, BlogCategory } from '@/services/blogApi'
import { 
  Search, 
  FileText, 
  Clock, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  Tag,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface HelpCenterProps {
  userType?: 'admin' | 'customer'
  tenantId?: string
}

export default function HelpCenter({ userType = 'admin', tenantId }: HelpCenterProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [popularPosts, setPopularPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchResults, setSearchResults] = useState<BlogPost[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      
      // Fetch categories, recent posts, and popular posts in parallel
      const [categoriesRes, postsRes, popularRes] = await Promise.all([
        blogApi.getCategories('tenant'),
        blogApi.getPosts({ 
          visibility: 'tenant', 
          audience: userType === 'admin' ? 'both' : 'customer',
          limit: 6 
        }),
        blogApi.getPopularPosts(5, 'tenant', userType === 'admin' ? 'both' : 'customer')
      ])
      
      setCategories(categoriesRes.data || [])
      setPosts(postsRes.data || [])
      setPopularPosts(popularRes.data || [])
      
    } catch (err: any) {
      setError(err.message || 'Failed to load help content')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setShowSearchResults(false)
      return
    }

    try {
      setSearchLoading(true)
      const response = await blogApi.searchPosts(query, {
        visibility: 'tenant',
        audience: userType === 'admin' ? 'both' : 'customer',
        limit: 10
      })
      
      setSearchResults(response.data || [])
      setShowSearchResults(true)
    } catch (err: any) {
      console.error('Search failed:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleCategoryFilter = async (categoryId: string) => {
    if (categoryId === selectedCategory) {
      setSelectedCategory('')
      fetchInitialData()
      return
    }

    try {
      setLoading(true)
      setSelectedCategory(categoryId)
      
      const response = await blogApi.getPosts({
        category: categoryId,
        visibility: 'tenant',
        audience: userType === 'admin' ? 'both' : 'customer',
        limit: 12
      })
      
      setPosts(response.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to filter posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [userType])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm)
      } else {
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getIconComponent = (iconName: string) => {
    // Simple icon mapping - you can expand this
    switch (iconName) {
      case 'Tag': return <Tag className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
        <p className="text-gray-600">
          Find answers to common questions and learn how to make the most of our platform
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          {searchLoading && (
            <Loader2 className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
          )}
        </div>

        {/* Search Results */}
        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-10 max-h-96 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No articles found for "{searchTerm}"
              </div>
            ) : (
              <div className="p-2">
                {searchResults.map((post) => (
                  <Link
                    key={post._id}
                    href={`/help/${post.slug}`}
                    className="block p-3 hover:bg-gray-50 rounded-lg"
                    onClick={() => setShowSearchResults(false)}
                  >
                    <div className="font-medium text-gray-900 mb-1">{post.title}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</div>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2"
                        style={{ 
                          backgroundColor: `${post.category.color}20`,
                          color: post.category.color 
                        }}
                      >
                        {post.category.name}
                      </span>
                      <Clock className="w-3 h-3 mr-1" />
                      {post.readingTime || 5} min read
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategoryFilter(category._id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  selectedCategory === category._id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <div style={{ color: category.color }}>
                  {getIconComponent(category.icon)}
                </div>
                <span>{category.name}</span>
                <span className="text-sm text-gray-500">({category.postCount})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory ? 'Filtered Articles' : 'Recent Articles'}
            </h2>
            {selectedCategory && (
              <button
                onClick={() => handleCategoryFilter('')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear filter
              </button>
            )}
          </div>

          {posts.length === 0 && !loading ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500">
                {selectedCategory 
                  ? 'No articles found in this category.' 
                  : 'No help articles are available at the moment.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <article key={post._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span 
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                      style={{ 
                        backgroundColor: `${post.category.color}20`,
                        color: post.category.color 
                      }}
                    >
                      {post.category.name}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="w-4 h-4 mr-1" />
                      {post.viewCount}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link 
                      href={`/help/${post.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.readingTime || 5} min read
                      </span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    
                    <Link 
                      href={`/help/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      Read more
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Articles */}
          {popularPosts.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Articles</h3>
              <div className="space-y-4">
                {popularPosts.map((post, index) => (
                  <div key={post._id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/help/${post.slug}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                      >
                        {post.title}
                      </Link>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Eye className="w-3 h-3 mr-1" />
                        {post.viewCount} views
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need More Help?</h3>
            <div className="space-y-3">
              <Link
                href="/support/tickets/create"
                className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/support/chat"
                className="block w-full border border-gray-300 text-gray-700 text-center px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Live Chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}