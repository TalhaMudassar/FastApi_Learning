import ProtectedRoute from './ProtectedRoute'

export default function AdminOnly({ children }) {
  return <ProtectedRoute adminOnly>{children}</ProtectedRoute>
}