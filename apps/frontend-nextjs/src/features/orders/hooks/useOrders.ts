import { useState, useEffect } from 'react'
import { ordersApi, Order } from '../api/ordersApi'

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ordersApi.getMyOrders()
      setOrders(data)
    } catch (err) {
      setError('Не удалось загрузить заказы')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return { orders, loading, error, refetch: fetchOrders }
}

export const useOrder = (id: string) => {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ordersApi.getOrder(id)
      setOrder(data)
    } catch (err) {
      setError('Не удалось загрузить заказ')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchOrder()
    }
  }, [id])

  return { order, loading, error, refetch: fetchOrder }
}

