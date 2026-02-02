const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  content?: string
  category: {
    _id: string
    name: string
    slug: string
    color: string
    icon: string
  }
  author: {
    name: string
  }
  visibility: 'platform' | 'tenant' | 'both'
  targetAudience: 'admin' | 'customer' | 'both'
  publishedAt: string
  viewCount: number
  helpfulCount: number
  notHelpfulCount: number
  readingTime: number
  tags: string[]
  featuredImage?: string
  relatedPosts?: BlogPost[]
}

interface BlogCategory {
  _id: string
  name: string
  slug: string
  description: string
  color: string
  icon: string
  visibility: 'platform' | 'tenant' | 'both'
  postCount: number
}

interface BlogSearchParams {
  page?: number
  limit?: number
  category?: string
  search?: string
  visibility?: 'platform' | 'tenant' | 'both'
  audience?: 'admin' | 'customer' | 'both'
  tags?: string
}

class BlogAPI {
  private async handleResponse(response: Response) {
    const contentType = response.headers.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      throw new Error(`Server returned non-JSON response. Status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed')
    }
    
    return data
  }

  // Get published blog posts with filtering
  async getPosts(params: BlogSearchParams = {}) {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.category) searchParams.append('category', params.category)
    if (params.search) searchParams.append('search', params.search)
    if (params.visibility) searchParams.append('visibility', params.visibility)
    if (params.audience) searchParams.append('audience', params.audience)
    if (params.tags) searchParams.append('tags', params.tags)

    const response = await fetch(`${API_BASE_URL}/blog/posts?${searchParams}`)
    return this.handleResponse(response)
  }

  // Get single blog post by slug
  async getPostBySlug(slug: string, visibility: string = 'both', audience: string = 'both') {
    const searchParams = new URLSearchParams()
    searchParams.append('visibility', visibility)
    searchParams.append('audience', audience)

    const response = await fetch(`${API_BASE_URL}/blog/posts/${slug}?${searchParams}`)
    return this.handleResponse(response)
  }

  // Get blog categories
  async getCategories(visibility: string = 'both') {
    const searchParams = new URLSearchParams()
    searchParams.append('visibility', visibility)

    const response = await fetch(`${API_BASE_URL}/blog/categories?${searchParams}`)
    return this.handleResponse(response)
  }

  // Search blog posts
  async searchPosts(query: string, params: BlogSearchParams = {}) {
    const searchParams = new URLSearchParams()
    searchParams.append('q', query)
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.visibility) searchParams.append('visibility', params.visibility)
    if (params.audience) searchParams.append('audience', params.audience)

    const response = await fetch(`${API_BASE_URL}/blog/search?${searchParams}`)
    return this.handleResponse(response)
  }

  // Get popular posts
  async getPopularPosts(limit: number = 5, visibility: string = 'both', audience: string = 'both') {
    const searchParams = new URLSearchParams()
    searchParams.append('limit', limit.toString())
    searchParams.append('visibility', visibility)
    searchParams.append('audience', audience)

    const response = await fetch(`${API_BASE_URL}/blog/popular?${searchParams}`)
    return this.handleResponse(response)
  }

  // Get recent posts
  async getRecentPosts(limit: number = 5, visibility: string = 'both', audience: string = 'both') {
    const searchParams = new URLSearchParams()
    searchParams.append('limit', limit.toString())
    searchParams.append('visibility', visibility)
    searchParams.append('audience', audience)

    const response = await fetch(`${API_BASE_URL}/blog/recent?${searchParams}`)
    return this.handleResponse(response)
  }

  // Record feedback (helpful/not helpful)
  async recordFeedback(slug: string, helpful: boolean, userId?: string, userType?: string, tenantId?: string) {
    const response = await fetch(`${API_BASE_URL}/blog/posts/${slug}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        helpful,
        userId,
        userType,
        tenantId
      })
    })
    
    return this.handleResponse(response)
  }
}

export const blogApi = new BlogAPI()
export type { BlogPost, BlogCategory, BlogSearchParams }