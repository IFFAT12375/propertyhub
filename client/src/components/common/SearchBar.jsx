import { useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from './Button.jsx'
import FormField from './FormField.jsx'
import { lahoreAreas } from '../../data/locations.js'

const initialSearch = {
  location: '',
  purpose: '',
}
export default function SearchBar({
  onSearch,
  initialValues = initialSearch,
  compact = false,
}) {
  const [values, setValues] = useState({ ...initialSearch, ...initialValues })
  const navigate = useNavigate()

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (onSearch) {
      onSearch(values)
      return
    }

    const query = new URLSearchParams()
    Object.entries(values).forEach(([key, value]) => {
      if (value.trim()) query.set(key, value.trim())
    })
    navigate(`/properties${query.size ? `?${query}` : ''}`)
  }

  return (
    <form
      className={`search-bar${compact ? ' search-bar--compact' : ''}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="search-bar__location">
        <MapPin size={19} aria-hidden="true" />
        <FormField
          as="select"
          label="Area"
          name="location"
          value={values.location}
          onChange={handleChange}
          options={[
            { value: '', label: 'Choose an area in Lahore' },
            ...lahoreAreas.map((area) => ({ value: area, label: area })),
          ]}
        />
      </div>
      <FormField
        as="select"
        label="Looking to"
        name="purpose"
        value={values.purpose}
        onChange={handleChange}
        options={[
          { value: '', label: 'Buy or rent' },
          { value: 'sale', label: 'Buy' },
          { value: 'rent', label: 'Rent' },
        ]}
      />
      <Button type="submit" className="search-bar__submit">
        <Search size={17} aria-hidden="true" />
        <span>Search properties</span>
      </Button>
    </form>
  )
}