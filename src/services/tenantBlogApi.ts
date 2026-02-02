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
  author?: {
    name: string
  }
  tenantAuthor?: {
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
  tenantId?: string
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
  tenantId?: string
}

interface BlogSearchParams {
  page?: number
  limit?: number
  category?: string
  search?: string
  visibility?: 'platform' | 'tenant' | 'both'
  audience?: 'admin' | 'customer' | 'both'
  tags?: string
  tenantId?: string
}

class TenantBlogAPI {
  private getAuthHeaders() {
    let token = null
    
    // Try to get token from localStorage
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        token = parsed.state?.token || parsed.token
      } catch (e) {
        console.error('Error parsing auth-storage:', e)
      }
    }
    
    // Fallback to other token storage methods
    if (!token) {
      token = localStorage.getItem('token') || localStorage.getItem('authToken')
    }
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

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

  // Tenant Admin Blog Management

  // Get tenant blog posts
  async getTenantPosts(params: BlogSearchParams = {}) {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.category) searchParams.append('category', params.category)
    if (params.search) searchParams.append('search', params.search)
    if (params.tags) searchParams.append('tags', params.tags)

    const response = await fetch(`${API_BASE_URL}/admin/blog/posts?${searchParams}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // Get single tenant blog post
  async getTenantPost(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/blog/posts/${id}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // Create tenant blog post
  async createTenantPost(postData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/blog/posts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(postData)
    })
    return this.handleResponse(response)
  }

  // Update tenant blog post
  async updateTenantPost(id: string, postData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/blog/posts/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(postData)
    })
    return this.handleResponse(response)
  }

  // Delete tenant blog post
  async deleteTenantPost(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/blog/posts/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // Get tenant blog categories
  async getTenantCategories() {
    const response = await fetch(`${API_BASE_URL}/admin/blog/categories`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // Create tenant blog category
  async createTenantCategory(categoryData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/blog/categories`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData)
    })
    return this.handleResponse(response)
  }

  // Update tenant blog category
  async updateTenantCategory(id: string, categoryData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/blog/categories/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData)
    })
    return this.handleResponse(response)
  }

  // Delete tenant blog category
  async deleteTenantCategory(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/blog/categories/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // Get tenant blog analytics
  async getTenantAnalytics(timeframe?: string) {
    const searchParams = new URLSearchParams()
    if (timeframe) searchParams.append('timeframe', timeframe)

    const response = await fetch(`${API_BASE_URL}/admin/blog/analytics?${searchParams}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // Public API for tenant landing pages

  // Get published posts for a specific tenant
  async getPublicTenantPosts(tenantId: string, params: BlogSearchParams = {}) {
    const searchParams = new URLSearchParams()
    searchParams.append('tenantId', tenantId)
    searchParams.append('visibility', 'tenant')
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.category) searchParams.append('category', params.category)
    if (params.search) searchParams.append('search', params.search)
    if (params.audience) searchParams.append('audience', params.audience)
    if (params.tags) searchParams.append('tags', params.tags)

    const response = await fetch(`${API_BASE_URL}/blog/posts?${searchParams}`)
    return this.handleResponse(response)
  }

  // Get single post by slug for tenant landing page
  async getPublicTenantPostBySlug(tenantId: string, slug: string, audience: string = 'customer') {
    const searchParams = new URLSearchParams()
    searchParams.append('tenantId', tenantId)
    searchParams.append('visibility', 'tenant')
    searchParams.append('audience', audience)

    const response = await fetch(`${API_BASE_URL}/blog/posts/${slug}?${searchParams}`)
    return this.handleResponse(response)
  }

  // Get categories for tenant landing page
  async getPublicTenantCategories(tenantId: string) {
    const searchParams = new URLSearchParams()
    searchParams.append('tenantId', tenantId)
    searchParams.append('visibility', 'tenant')

    const response = await fetch(`${API_BASE_URL}/blog/categories?${searchParams}`)
    return this.handleResponse(response)
  }

  // Search posts for tenant landing page
  async searchTenantPosts(tenantId: string, query: string, params: BlogSearchParams = {}) {
    const searchParams = new URLSearchParams()
    searchParams.append('q', query)
    searchParams.append('tenantId', tenantId)
    searchParams.append('visibility', 'tenant')
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.audience) searchParams.append('audience', params.audience)

    const response = await fetch(`${API_BASE_URL}/blog/search?${searchParams}`)
    return this.handleResponse(response)
  }

  // Record feedback for tenant posts
  async recordTenantFeedback(slug: string, helpful: boolean, tenantId: string, userId?: string, userType?: string) {
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

export const tenantBlogApi = new TenantBlogAPI()
export type { BlogPost, BlogCategory, BlogSearchParams }