import { put, del, list } from '@vercel/blob'

export const blobStorage = {
  /**
   * Upload a file to Vercel Blob
   */
  async uploadFile(
    filename: string,
    file: File | Blob | ArrayBuffer,
    pathname: string = ''
  ) {
    try {
      const path = pathname ? `${pathname}/${filename}` : filename

      const blob = await put(path, file, {
        access: 'private',
        addRandomSuffix: true
      })

      return {
        success: true,
        url: blob.url,
        pathname: blob.pathname,
        downloadUrl: blob.downloadUrl
      }
    } catch (error) {
      console.error('[v0] Blob upload error:', error)
      throw new Error('Failed to upload file')
    }
  },

  /**
   * Delete a file from Vercel Blob
   */
  async deleteFile(pathname: string) {
    try {
      await del(pathname)
      return { success: true }
    } catch (error) {
      console.error('[v0] Blob delete error:', error)
      throw new Error('Failed to delete file')
    }
  },

  /**
   * List files in a specific directory
   */
  async listFiles(directory: string = '') {
    try {
      const result = await list({
        prefix: directory,
        limit: 100
      })

      return {
        success: true,
        files: result.blobs,
        cursor: result.cursor
      }
    } catch (error) {
      console.error('[v0] Blob list error:', error)
      throw new Error('Failed to list files')
    }
  },

  /**
   * Get a file URL with optional expiration
   */
  getFileUrl(pathname: string): string {
    try {
      // Construct the Blob URL
      return `${process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN}/file/${pathname}`
    } catch (error) {
      console.error('[v0] Error getting file URL:', error)
      throw new Error('Failed to get file URL')
    }
  },

  /**
   * Check if file exists
   */
  async fileExists(pathname: string): Promise<boolean> {
    try {
      const result = await list({
        prefix: pathname
      })

      return result.blobs.length > 0
    } catch (error) {
      console.error('[v0] Error checking file existence:', error)
      return false
    }
  }
}
