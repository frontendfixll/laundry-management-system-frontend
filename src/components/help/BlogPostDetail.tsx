'use client'

import { useState, useEffect } from 'react'
import { blogApi, BlogPost } from '@/services/blogApi'
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  Share2,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

interface BlogPostDetailProps {
  slug: string
  userType?: 'admin' | 'customer'
  tenantId?: string
}

export default function BlogPostDetail({ slug, userType = 'admin', tenantId }: BlogPostDetailProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const { user } = useAuthStore()

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await blogApi.getPostBySlug(
        slug, 
        'tenant', 
        userType === 'admin' ? 'both' : 'customer'
      )
      setPost(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (helpful: boolean) => {
    if (feedbackGiven !== null) return // Already gave feedback

    try {
      setFeedbackLoading(true)
      await blogApi.recordFeedback(
        slug, 
        helpful, 
        user?.id, 
        userType === 'admin' ? 'tenant_admin' : 'customer',
        tenantId
      )
      
      setFeedbackGiven(helpful)
      setFeedbackMessage(
        helpful 
          ? 'Thank you! Your feedback helps us improve our content.' 
          : 'Thank you for your feedback. We\'ll work on improving this article.'
      )
      
      // Update post stats
      if (post) {
        setPost({
          ...post,
          helpfulCount: helpful ? post.helpfulCount + 1 : post.helpfulCount,
          notHelpfulCount: !helpful ? post.notHelpfulCount + 1 : post.notHelpfulCount
        })
      }
    } catch (err: any) {
      console.error('Failed to record feedback:', err)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-4 mt-8">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-gray-900 mb-3 mt-6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium text-gray-900 mb-2 mt-4">$1</h3>')
      .replace(/^\* (.*$)/gim, '<li class="mb-1">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="mb-1">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
  }

  useEffect(() => {
    fetchPost()
  }, [slug, userType])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20 mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-lg font-medium text-red-800 mb-2">Article Not Found</h2>
          <p className="text-red-600 mb-4">
            {error || 'The article you\'re looking for doesn\'t exist or isn\'t available.'}
          </p>
          <Link
            href="/help"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Center
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <Link
        href="/help"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Help Center
      </Link>

      {/* Article Header */}
      <article className="bg-white rounded-lg shadow-sm border p-8">
        <header className="mb-8">
          {/* Category */}
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4"
            style={{ 
              backgroundColor: `${post.category.color}20`,
              color: post.category.color 
            }}
          >
            {post.category.name}
          </span>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {post.author.name}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(post.publishedAt)}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {post.readingTime || 5} min read
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              {post.viewCount} views
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share this article
          </button>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: `<p class="mb-4">${formatContent(post.content || '')}</p>` 
            }}
          />
        </div>

        {/* Feedback Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Was this article helpful?</h3>
          
          {feedbackMessage ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{feedbackMessage}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleFeedback(true)}
                disabled={feedbackLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Yes ({post.helpfulCount})</span>
              </button>
              
              <button
                onClick={() => handleFeedback(false)}
                disabled={feedbackLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>No ({post.notHelpfulCount})</span>
              </button>
            </div>
          )}
        </div>

        {/* Related Articles */}
        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {post.relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost._id}
                  href={`/help/${relatedPost.slug}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  {relatedPost.featuredImage && (
                    <img
                      src={relatedPost.featuredImage}
                      alt={relatedPost.title}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                  )}
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {relatedPost.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {relatedPost.excerpt}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {relatedPost.readingTime || 5} min read
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}