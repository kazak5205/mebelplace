import { useState, useEffect } from 'react'
import { requestsApi, Request } from '../api/requestsApi'

export const useRequests = () => {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await requestsApi.getMyRequests()
      setRequests(data)
    } catch (err) {
      setError('Не удалось загрузить заявки')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  return { requests, loading, error, refetch: fetchRequests }
}

export const useRequest = (id: string) => {
  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequest = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await requestsApi.getRequest(id)
      setRequest(data)
    } catch (err) {
      setError('Не удалось загрузить заявку')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchRequest()
    }
  }, [id])

  return { request, loading, error, refetch: fetchRequest }
}

