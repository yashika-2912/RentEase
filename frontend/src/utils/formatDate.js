const formatDate = (value) => {
  if (!value) {
    return 'N/A'
  }

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default formatDate
