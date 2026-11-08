import { useState } from 'react'
import { ImagePlus } from 'lucide-react'
import Button from '../common/Button.jsx'
import FormField from '../common/FormField.jsx'
import { lahoreAreas } from '../../data/locations.js'

const residentialTypes = ['house', 'apartment', 'plot']
const commercialTypes = ['office', 'shop', 'warehouse']
const demoMaxImages = 10
const demoMaxFileSize = 5 * 1024 * 1024

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error(`Could not read ${file.name}.`))
    }
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`))
    reader.readAsDataURL(file)
  })
}

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
    bedrooms: property?.bedrooms?.toString() || '',
    bathrooms: property?.bathrooms?.toString() || '',
    location: property?.location.area || '',
    phoneVisible: property?.seller.phoneVisible ?? true,
  }
}

export default function PropertyForm({ property, onSubmit, submitLabel }) {
  const [values, setValues] = useState(() => initialValues(property))
  const [images, setImages] = useState(() =>
    property?.images?.length
      ? property.images
      : property?.image
        ? [property.image]
        : [],
  )
  const [imageError, setImageError] = useState('')
  const [error, setError] = useState('')
  const allowedTypes =
    values.category === 'residential' ? residentialTypes : commercialTypes
  const types = allowedTypes

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

  async function handleImagesChange(event) {
    const files = Array.from(event.target.files || [])
    setImageError('')

    if (files.length > demoMaxImages) {
      setImageError(`The demo accepts up to ${demoMaxImages} images at a time.`)
      event.target.value = ''
      return
    }
    const invalidFile = files.find(
      (file) =>
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > demoMaxFileSize,
    )
    if (invalidFile) {
      setImageError(
        'Use JPG, PNG, or WebP images no larger than 5 MB each in this demo.',
      )
      event.target.value = ''
      return
    }

    try {
      const previews = await Promise.all(files.map(readImage))
      setImages(previews)
    } catch (readError) {
      setImageError(readError.message)
      event.target.value = ''
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!images.length) {
      setError('Add at least one property photo to continue.')
      return
    }
    if (Number(values.price) <= 0 || Number(values.area) <= 0) {
      setError('Price and property area must be greater than zero.')
      return
    }
    if (
      (values.bedrooms && Number(values.bedrooms) < 0) ||
      (values.bathrooms && Number(values.bathrooms) < 0)
    ) {
      setError('Bedroom and bathroom counts cannot be negative.')
      return
    }

    setError('')
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      type: values.type,
      purpose: values.purpose,
      price: Number(values.price),
      priceFrequency: values.purpose === 'rent' ? values.priceFrequency : null,
      area: Number(values.area),
      areaUnit: values.areaUnit,
      bedrooms:
        values.category === 'residential' && values.type !== 'plot'
          ? Number(values.bedrooms)
          : null,
      bathrooms: values.type !== 'plot' ? Number(values.bathrooms) : null,
      location: { area: values.location, city: 'Lahore' },
      image: images[0],
      images,
      phoneVisible: values.phoneVisible,
    })
  }

  return (
    <form className="property-form" onSubmit={handleSubmit}>
      <div className="prototype-notice">
        This is a mock listing form, not a final content specification. Photo
        type/size/count rules and other open PRD fields are demo defaults only.
      </div>
      {error && <div className="form-alert" role="alert">{error}</div>}
      <FormField
        label="Listing title"
        name="title"
        value={values.title}
        onChange={updateField}
        minLength={8}
        required
      />
      <FormField
        as="textarea"
        label="Description"
        name="description"
        value={values.description}
        onChange={updateField}
        minLength={20}
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
          value={types.includes(values.type) ? values.type : types[0]}
          onChange={updateField}
          options={types.map((type) => ({
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
          name="location"
          value={values.location}
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
            label="Rental period (demo default)"
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
        {values.category === 'residential' && values.type !== 'plot' && (
          <FormField
            label="Bedrooms"
            name="bedrooms"
            type="number"
            min="0"
            value={values.bedrooms}
            onChange={updateField}
            required
          />
        )}
        {values.type !== 'plot' && (
          <FormField
            label="Bathrooms"
            name="bathrooms"
            type="number"
            min="0"
            value={values.bathrooms}
            onChange={updateField}
            required
          />
        )}
      </div>

      <div className="form-field upload-field">
        <label htmlFor="property-images">Property photos</label>
        <label className="upload-field__drop" htmlFor="property-images">
          <ImagePlus size={22} />
          <span>Choose images from your device</span>
          <small>JPG, PNG or WebP · preview only · up to 10 files</small>
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
        {imageError && (
          <span className="form-field__error" role="alert">{imageError}</span>
        )}
        {images.length > 0 && (
          <div className="upload-field__previews">
            {images.map((image, index) => (
              <img src={image} alt={`Property preview ${index + 1}`} key={`${index}-${image.slice(0, 30)}`} />
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
        <span>
          Show my phone number on this public listing. This setting can be
          changed later.
        </span>
      </label>
      <Button type="submit">{submitLabel}</Button>
    </form>
  )
}
