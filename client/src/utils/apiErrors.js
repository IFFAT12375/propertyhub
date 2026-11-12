export function apiErrorMessage(error, fallback = 'The request could not be completed.') {
  const apiError = error?.data?.error
  if (apiError?.message) {
    const details = Array.isArray(apiError.details)
      ? apiError.details.map(({ field, message: detail }) => `${field}: ${detail}`).join(' ')
      : ''
    return [apiError.message, details].filter(Boolean).join(' ')
  }
  if (error?.status === 'FETCH_ERROR') {
    return 'Could not reach PropertyHub. Check your connection and try again.'
  }
  if (error?.status === 'TIMEOUT_ERROR') {
    return 'The request took too long. Please try again.'
  }
  return fallback
}
