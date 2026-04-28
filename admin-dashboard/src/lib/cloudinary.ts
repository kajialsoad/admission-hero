import Cookies from 'js-cookie'

export interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://munns-production.up.railway.app/api'
  
  // Get auth token from cookies (admin dashboard uses cookies, not localStorage)
  const token = typeof window !== 'undefined' ? Cookies.get('admin_token') : null
  
  if (!token) {
    throw new Error('Authentication required. Please login first.')
  }

  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await fetch(`${apiUrl}/uploads/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to upload image')
    }

    const result = await response.json()
    
    if (!result.success || !result.data?.url) {
      throw new Error('Invalid response from upload server')
    }

    return result.data.url
  } catch (error) {
    console.error('Image upload error:', error)
    throw error
  }
}

export async function uploadMultipleToCloudinary(files: File[]): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadToCloudinary(file))
  return Promise.all(uploadPromises)
}