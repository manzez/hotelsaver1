'use client'
import { useState } from 'react'
import { validateReview, type ServiceReview } from '@/lib/reviews'

interface WriteReviewProps {
  serviceId: string
  serviceName: string
  onClose: () => void
  onSubmit: (review: Partial<ServiceReview>) => void
}

export default function WriteReviewForm({ 
  serviceId, 
  serviceName, 
  onClose, 
  onSubmit 
}: WriteReviewProps) {
  
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    content: '',
    customerName: '',
    customerEmail: '',
    eventDate: '',
    ratings: {
      quality: 0,
      punctuality: 0,
      communication: 0,
      value: 0,
      professionalism: 0
    }
  })
  
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreview, setPhotoPreview] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle file uploads
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (files.length + photos.length > 5) {
      alert('Maximum 5 photos allowed')
      return
    }

    setPhotos([...photos, ...files])
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPhotoPreview([...photoPreview, ...newPreviews])
  }

  // Remove photo
  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newPreviews = photoPreview.filter((_, i) => i !== index)
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(photoPreview[index])
    
    setPhotos(newPhotos)
    setPhotoPreview(newPreviews)
  }

  // Star rating component
  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number
    onChange: (rating: number) => void
    label: string 
  }) => (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium w-24">{label}:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-6 h-6 ${
              star <= value 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-500 ml-2">{value}/5</span>
    </div>
  )

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors([])

    // Validate form
    const validation = validateReview({
      ...formData,
      serviceId,
      photos: photoPreview // URLs for validation
    })

    if (!validation.valid) {
      setErrors(validation.errors)
      setIsSubmitting(false)
      return
    }

    try {
      // In production, this would upload photos and submit review
      const reviewData = {
        ...formData,
        serviceId,
        serviceName,
        photos: photoPreview, // In production, these would be uploaded URLs
        reviewDate: new Date().toISOString().split('T')[0],
        verified: false, // Would be verified after booking confirmation
        helpful: 0,
        status: 'pending' as const
      }

      onSubmit(reviewData)
      
      // Clean up preview URLs
      photoPreview.forEach(url => URL.revokeObjectURL(url))
      
    } catch (error) {
      setErrors(['Failed to submit review. Please try again.'])
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Write a Review</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">{serviceName}</div>
              <div className="text-sm text-gray-600">Share your experience with this service</div>
            </div>

            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">Overall Rating *</label>
              <StarRating
                value={formData.rating}
                onChange={(rating) => setFormData({...formData, rating})}
                label="Overall"
              />
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Review Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Summarize your experience..."
                className="input w-full"
                required
              />
            </div>

            {/* Review Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Review *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Tell others about your experience. What went well? What could be improved?"
                rows={4}
                className="input w-full"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                Minimum 20 characters ({formData.content.length}/20)
              </div>
            </div>

            {/* Detailed Ratings */}
            <div>
              <label className="block text-sm font-medium mb-3">Detailed Ratings *</label>
              <div className="space-y-3">
                <StarRating
                  value={formData.ratings.quality}
                  onChange={(rating) => setFormData({
                    ...formData, 
                    ratings: {...formData.ratings, quality: rating}
                  })}
                  label="Quality"
                />
                <StarRating
                  value={formData.ratings.punctuality}
                  onChange={(rating) => setFormData({
                    ...formData, 
                    ratings: {...formData.ratings, punctuality: rating}
                  })}
                  label="Punctuality"
                />
                <StarRating
                  value={formData.ratings.communication}
                  onChange={(rating) => setFormData({
                    ...formData, 
                    ratings: {...formData.ratings, communication: rating}
                  })}
                  label="Communication"
                />
                <StarRating
                  value={formData.ratings.value}
                  onChange={(rating) => setFormData({
                    ...formData, 
                    ratings: {...formData.ratings, value: rating}
                  })}
                  label="Value"
                />
                <StarRating
                  value={formData.ratings.professionalism}
                  onChange={(rating) => setFormData({
                    ...formData, 
                    ratings: {...formData.ratings, professionalism: rating}
                  })}
                  label="Professional"
                />
              </div>
            </div>

            {/* Event Date */}
            <div>
              <label className="block text-sm font-medium mb-2">Event Date *</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                max={new Date().toISOString().split('T')[0]}
                className="input"
                required
              />
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Add Photos (Optional)
              </label>
              <div className="space-y-3">
                {/* Photo Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label 
                    htmlFor="photo-upload"
                    className="cursor-pointer text-brand-green hover:text-brand-dark"
                  >
                    📷 Click to add photos (max 5)
                  </label>
                  <div className="text-xs text-gray-500 mt-1">
                    JPG, PNG up to 5MB each
                  </div>
                </div>

                {/* Photo Previews */}
                {photoPreview.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photoPreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name *</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  placeholder="Your full name"
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                  placeholder="your@email.com"
                  className="input w-full"
                  required
                />
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-800 font-medium mb-1">Please fix the following:</div>
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}