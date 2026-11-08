import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationsStore } from '../store/notificationsStore'

describe('Notifications Store', () => {
  beforeEach(() => {
    useNotificationsStore.getState().clearNotifications()
  })

  it('adds notifications and keeps track of count', () => {
    useNotificationsStore.getState().addNotification({
      type: 'success',
      title: 'Pod Restored',
      message: 'Self-healing completed.'
    })

    const notifs = useNotificationsStore.getState().notifications
    expect(notifs.length).toBe(1)
    expect(notifs[0].title).toBe('Pod Restored')
    expect(notifs[0].type).toBe('success')
  })

  it('removes individual notification by id', () => {
    useNotificationsStore.getState().addNotification({
      type: 'warning',
      title: 'Alert 1',
      message: 'Warning msg'
    })

    const notifs = useNotificationsStore.getState().notifications
    const id = notifs[0].id

    useNotificationsStore.getState().removeNotification(id)
    expect(useNotificationsStore.getState().notifications.length).toBe(0)
  })
})
