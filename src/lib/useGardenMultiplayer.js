import { useCallback, useEffect, useRef, useState } from 'react'
import { joinRoom, scale } from 'trystero'

const APP_ID = 'potiva-garden-world-v1'
const ROOM_ID = 'kebun-utama'
const SEND_INTERVAL_MS = 75
const HEARTBEAT_MS = 2000
const STALE_PEER_MS = 14000

const clampPos = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0))

export function useGardenMultiplayer({ enabled, playerName, initialState }) {
  const [status, setStatus] = useState('offline')
  const [peers, setPeers] = useState([])

  const remoteMapRef = useRef(new Map())
  const localRef = useRef({
    name: playerName || 'Poti Tamu',
    x: initialState.x,
    y: initialState.y,
    facing: initialState.facing || 1,
    moving: false,
    look: initialState.look || {},
    expression: 'happy',
    carry: initialState.carry || null,
    bubble: null,
  })
  const sendActionRef = useRef(null)
  const lastSentAtRef = useRef(0)
  const lastSigRef = useRef('')

  localRef.current.name = playerName || 'Poti Tamu'
  localRef.current.look = initialState.look || {}
  localRef.current.expression = initialState.expression || 'happy'
  localRef.current.carry = initialState.carry || null
  localRef.current.bubble = initialState.bubble || null

  const syncPeerList = useCallback(() => {
    const list = []
    remoteMapRef.current.forEach((p, peerId) => {
      list.push({
        peerId,
        name: p.name,
        look: p.look,
        expression: p.expression,
        carry: p.carry,
        bubble: p.bubble,
        x: p.curX,
        y: p.curY,
      })
    })
    setPeers(list)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setStatus('offline')
      remoteMapRef.current.clear()
      setPeers([])
      return undefined
    }

    let cancelled = false
    let room = null

    setStatus('connecting')

    try {
      room = joinRoom(
        {
          appId: APP_ID,
          identity: 'none',
          use: [scale()],
        },
        ROOM_ID,
      )

      const syncAction = room.makeAction('poti-sync')
      sendActionRef.current = syncAction

      room.ready
        .then(() => {
          if (!cancelled) setStatus('online')
        })
        .catch(() => {
          if (!cancelled) setStatus('offline')
        })

      const unsubMsg = syncAction.onMessage((data, { peerId }) => {
        if (cancelled || !data || typeof data !== 'object') return
        const prev = remoteMapRef.current.get(peerId)
        const tx = clampPos(data.x, 40, 2520)
        const ty = clampPos(data.y, 80, 1560)
        const nextName = typeof data.name === 'string' && data.name.trim() ? data.name.slice(0, 18) : 'Poti Tamu'
        const nextLook = data.look && typeof data.look === 'object' ? data.look : {}
        const nextExpr = typeof data.expression === 'string' ? data.expression : 'happy'
        const nextCarry = typeof data.carry === 'string' ? data.carry : null
        const nextBubble = typeof data.bubble === 'string' ? data.bubble.slice(0, 60) : null

        const metaChanged =
          !prev ||
          prev.name !== nextName ||
          prev.expression !== nextExpr ||
          prev.carry !== nextCarry ||
          prev.bubble !== nextBubble ||
          JSON.stringify(prev.look) !== JSON.stringify(nextLook)

        remoteMapRef.current.set(peerId, {
          peerId,
          name: nextName,
          targetX: tx,
          targetY: ty,
          curX: prev ? prev.curX : tx,
          curY: prev ? prev.curY : ty,
          facing: data.facing === -1 ? -1 : 1,
          moving: Boolean(data.moving),
          look: nextLook,
          expression: nextExpr,
          carry: nextCarry,
          bubble: nextBubble,
          lastSeen: Date.now(),
        })

        if (metaChanged) syncPeerList()
      })

      const unsubJoin = room.onPeerJoin(({ peerId }) => {
        if (cancelled) return
        setStatus('online')
        syncAction.send(localRef.current, { target: peerId }).catch(() => {})
      })

      const unsubLeave = room.onPeerLeave(({ peerId }) => {
        if (cancelled) return
        if (remoteMapRef.current.delete(peerId)) {
          syncPeerList()
        }
      })

      const unsubErr = room.onError(() => {
        // Keep playing smoothly even if a relay or peer connection drops
      })

      const heartbeatId = window.setInterval(() => {
        if (cancelled) return
        const now = Date.now()
        let pruned = false
        remoteMapRef.current.forEach((p, id) => {
          if (now - p.lastSeen > STALE_PEER_MS) {
            remoteMapRef.current.delete(id)
            pruned = true
          }
        })
        if (pruned) syncPeerList()
        if (sendActionRef.current) {
          sendActionRef.current.send(localRef.current).catch(() => {})
          lastSentAtRef.current = now
        }
      }, HEARTBEAT_MS)

      return () => {
        cancelled = true
        window.clearInterval(heartbeatId)
        unsubMsg()
        unsubJoin()
        unsubLeave()
        unsubErr()
        sendActionRef.current = null
        remoteMapRef.current.clear()
        room?.leave?.().catch(() => {})
      }
    } catch {
      setStatus('offline')
      return undefined
    }
  }, [enabled, syncPeerList])

  const broadcastState = useCallback((patch, force = false) => {
    Object.assign(localRef.current, patch)
    const sender = sendActionRef.current
    if (!sender) return
    const now = Date.now()
    const sig = `${Math.round(localRef.current.x)},${Math.round(localRef.current.y)},${localRef.current.facing},${localRef.current.moving},${localRef.current.expression},${localRef.current.carry || ''},${localRef.current.bubble || ''}`
    if (!force && (now - lastSentAtRef.current < SEND_INTERVAL_MS || sig === lastSigRef.current)) {
      return
    }
    lastSigRef.current = sig
    lastSentAtRef.current = now
    sender.send(localRef.current).catch(() => {})
  }, [])

  return {
    status,
    peers,
    remoteMapRef,
    broadcastState,
  }
}
