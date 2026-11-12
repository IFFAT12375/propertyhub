import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import Button from '../common/Button.jsx'
import FormField from '../common/FormField.jsx'
import { lahoreAreas } from '../../data/locations.js'

const residentialTypes = ['house', 'apartment', 'plot']
const commercialTypes = ['office', 'shop', 'warehouse']
const maxImages = 10
const maxFileSize = 5 * 1024 * 1024

function initialValues(property) {
  return {
    title: property?.title || '',
    description: property?.description || '',
    category: property?.category || 'residential',
    type: property?.type || 'house',
    purpose: property?.purpose || 'sale',
    price: property?.price?.toString() || '',
    priceFrequency: property?.priceFrequency || 'month',
    area: property?.area?.toString() || '',
    areaUnit: property?.areaUnit || 'marla',
    bedrooms: property?.bedrooms?.toString() ?? '',
    bathrooms: property?.bathrooms?.toString() ?? '',
    locationArea: property?.location?.area || '',
    phoneVisible: property?.phoneVisible ?? true,
  }
}

function initialImages(property) {
  return (property?.images || []).map((image) => ({
    ...image,
    previewUrl: image.url,
    existing: true,
  }))
}

export default function PropertyForm({
  property,
  onSubmit,
  onDeleteImage,
  submitLabel,
  isSubmitting = false,
  requestError = '',
}) {
  const [values, setValues] = useState(() => initialValues(property))
  const [images, setImages] = useState(() => initialImages(property))
  const [imageError, setImageError] = useState('')
  const [error, setError] = useState('')
  const previewUrls = useRef(new Set())
  const allowedTypes =
    values.category === 'residential' ? residentialTypes : commercialTypes

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  function updateField(event) {
    const { name, value, checked, type } = event.target
    if (name === 'category') {
      const nextTypes = value === 'residential' ? residentialTypes : commercialTypes
      setValues((current) => ({ ...current, category: value, type: nextTypes[0] }))
      return
    }
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleImagesChange(event) {
    const files = Array.from(event.target.files || [])
    setImageError('')

    if (images.length + files.length > maxImages) {
      setImageError(`A listing can have no more than ${maxImages} images.`)
      event.target.value = ''
      return
    }
    const invalidFile = files.find(
      (file) =>
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > maxFileSize,
    )
    if (invalidFile) {
      setImageError('Use JPG, PNG, or WebP images no larger than 5 MB each.')
      event.target.value = ''
      return
    }

    const additions = files.map((file) => {
      const previewUrl = URL.createObjectURL(file)
      previewUrls.current.add(previewUrl)
      return { file, previewUrl, existing: false }
    })
    setImages((current) => [...current, ...additions])
    event.target.value = ''
  }

  async function removeImage(image, index) {
    if (images.length <= 1) {
      setImageError('A property must retain at least one image.')
      return
    }
    setImageError('')
    if (image.existing) {
      if (!onDeleteImage || !(await onDeleteImage(image.filename))) return
    } else {
      URL.revokeObjectURL(image.previewUrl)
      previewUrls.current.delete(image.previewUrl)
    }
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (images.length === 0) {
      setError('Add at least one property photo to continue.')
      return
    }
    if (Number(values.price) <= 0 || Number(values.area) <= 0) {
      setError('Price and property area must be greater than zero.')
      return
    }
    if (
      values.bedrooms === '' || values.bathrooms === '' ||
      Number(values.bedrooms) < 0 || Number(values.bathrooms) < 0
    ) {
      setError('Enter bedroom and bathroom counts. Use 0 when a count does not apply.')
      return
    }

    const body = new FormData()
    const fields = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      type: values.type,
      purpose: values.purpose,
      price: values.price,
      priceFrequency: values.purpose === 'rent' ? values.priceFrequency : '',
      area: values.area,
      areaUnit: values.areaUnit,
      bedrooms: values.bedrooms,
      bathrooms: values.bathrooms,
      locationArea: values.locationArea,
      phoneVisible: String(values.phoneVisible),
    }
    Object.entries(fields).forEach(([name, value]) => {
      if (name !== 'title' || value) body.append(name, value)
    })
    images.filter((image) => !image.existing).forEach(({ file }) => body.append('images', file))

    setError('')
    onSubmit(body)
  }

  return (
    <form className="property-form" onSubmit={handleSubmit}>
      {(error || requestError) && (
        <div className="form-alert" role="alert">{error || requestError}</div>
      )}
      <FormField
        label="Listing title (optional)"
        name="title"
        value={values.title}
        onChange={updateField}
        maxLength={180}
      />
      <FormField
        as="textarea"
        label="Description"
        name="description"
        value={values.description}
        onChange={updateField}
        minLength={1}
        maxLength={10000}
        required
      />
      <div className="property-form__grid">
        <FormField
          as="select"
          label="Category"
          name="category"
          value={values.category}
          onChange={updateField}
          options={[
            { value: 'residential', label: 'Residential' },
            { value: 'commercial', label: 'Commercial' },
          ]}
          required
        />
        <FormField
          as="select"
          label="Property type"
          name="type"
          value={values.type}
          onChange={updateField}
          options={allowedTypes.map((type) => ({
            value: type,
            label: type.charAt(0).toUpperCase() + type.slice(1),
          }))}
          required
        />
        <FormField
          as="select"
          label="Listing purpose"
          name="purpose"
          value={values.purpose}
          onChange={updateField}
          options={[
            { value: 'sale', label: 'For sale' },
            { value: 'rent', label: 'For rent' },
          ]}
          required
        />
        <FormField
          as="select"
          label="Area in Lahore"
          name="locationArea"
          value={values.locationArea}
          onChange={updateField}
          options={[
            { value: '', label: 'Choose an area' },
            ...lahoreAreas.map((area) => ({ value: area, label: area })),
          ]}
          required
        />
        <FormField
          label="Price (PKR)"
          name="price"
          type="number"
          min="1"
          value={values.price}
          onChange={updateField}
          required
        />
        {values.purpose === 'rent' && (
          <FormField
            as="select"
            label="Rental period"
            name="priceFrequency"
            value={values.priceFrequency}
            onChange={updateField}
            options={[
              { value: 'month', label: 'Per month' },
              { value: 'year', label: 'Per year' },
            ]}
            required
          />
        )}
        <FormField
          label="Property area"
          name="area"
          type="number"
          min="1"
          value={values.area}
          onChange={updateField}
          required
        />
        <FormField
          as="select"
          label="Area unit"
          name="areaUnit"
          value={values.areaUnit}
          onChange={updateField}
          options={[
            { value: 'marla', label: 'Marla' },
            { value: 'kanal', label: 'Kanal' },
            { value: 'sq ft', label: 'Square feet' },
          ]}
          required
        />
        <FormField
          label="Bedrooms (enter 0 if not applicable)"
          name="bedrooms"
          type="number"
          min="0"
          value={values.bedrooms}
          onChange={updateField}
          required
        />
        <FormField
          label="Bathrooms (enter 0 if not applicable)"
          name="bathrooms"
          type="number"
          min="0"
          value={values.bathrooms}
          onChange={updateField}
          required
        />
      </div>

      <div className="form-field upload-field">
        <label htmlFor="property-images">Property photos (1–10)</label>
        <label className="upload-field__drop" htmlFor="property-images">
          <ImagePlus size={22} />
          <span>Choose images from your device</span>
          <small>JPG, PNG or WebP · up to 5 MB each</small>
        </label>
        <input
          className="sr-only"
          id="property-images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImagesChange}
        />
        {imageError && <span className="form-field__error" role="alert">{imageError}</span>}
        {images.length > 0 && (
          <div className="upload-field__previews">
            {images.map((image, index) => (
              <div className="upload-field__preview" key={image.filename || image.previewUrl}>
                <img src={image.previewUrl} alt={`Property image ${index + 1}`} />
                <button
                  type="button"
                  aria-label={`Remove property image ${index + 1}`}
                  onClick={() => void removeImage(image, index)}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="checkbox-field">
        <input
          type="checkbox"
          name="phoneVisible"
          checked={values.phoneVisible}
          onChange={updateField}
        />
        <span>Show my phone number on this public listing. This setting can be changed later.</span>
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving listing…' : submitLabel}
      </Button>
    </form>
  )
}
