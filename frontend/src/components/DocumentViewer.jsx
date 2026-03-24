const DocumentViewer = ({ fileUrl }) => {
  const src = fileUrl ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${fileUrl}` : ''

  if (!src) {
    return <p className="empty-state">No document uploaded yet.</p>
  }

  return (
    <div className="document-viewer">
      <iframe title="Lease Document" src={src} />
      <a href={src} target="_blank" rel="noreferrer" className="button-link">
        Download Lease
      </a>
    </div>
  )
}

export default DocumentViewer
