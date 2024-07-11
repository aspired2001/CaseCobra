// actions.ts
'use server'

import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

export const getPaymentStatus = async ({ orderId }: { orderId: string }) => {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user?.id || !user.email) {
    throw new Error('You need to be logged in to view this page.')
  }

  console.log('User ID:', user.id)
  console.log('Order ID:', orderId)

  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { id: user.id },
  })
  
  if (!existingUser) {
    throw new Error('User does not exist.')
  }

  console.log('User exists:', existingUser)

  const order = await db.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: {
      billingAddress: true,
      configuration: true, 
      shippingAddress: true,
      user: true,
    },
  })

  console.log('Order fetched:', order)

  if (!order) throw new Error('This order does not exist.')

  if (order.isPaid) {
    return order
  } else {
    return false
  }
}
