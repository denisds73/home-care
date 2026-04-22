import { useParams } from 'react-router-dom'
import { VendorEditForm } from '../../components/admin/VendorEditForm'

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null
  return <VendorEditForm vendorId={id} variant="page" />
}
