import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { PRODUCTS, EBOOKS, SPECIES, TASK_TYPES, JOURNALS, COMMUNITY_POSTS, COSMETICS, VOUCHER_CATALOG } from '../data/appData'
import { addDays, todayISO, clamp } from '../lib/utils'

const STORAGE_KEY = 'potiva.state.v1'

const daysAgoISO = (n) => addDays(todayISO(), -n)

const seedMissions = () => [
  { id: 'water', label: 'Rawat 1 tanaman hari ini', target: 1, progress: 1, reward: 20 },
  { id: 'journal', label: 'Tambah 1 catatan jurnal', target: 1, progress: 0, reward: 25 },
  { id: 'tasks', label: 'Selesaikan 2 tugas perawatan', target: 2, progress: 1, reward: 30 },
  { id: 'learn', label: 'Buka 1 panduan di E-Library', target: 1, progress: 0, reward: 15 },
]

const seedState = () => ({
  version: 1,
  user: {
    name: 'Rara',
    fullName: 'Rara Anindya',
    email: 'rara@potiva.id',
    initials: 'RA',
    joined: 'November 2026',
    city: 'Bandung',
  },
  guest: false,
  wallet: { xp: 430, coins: 120, streak: 5 },
  plants: [
    {
      id: 'p1',
      speciesId: 'cabai-milo',
      name: 'Cabai Milo',
      pot: 'pot-mini',
      potTone: 'terra',
      plantedAt: daysAgoISO(16),
      growth: 68,
      needs: { water: 62, nutrient: 46, light: 78 },
      lastWater: Date.now() - 1000 * 60 * 60 * 3,
      lastFeed: Date.now() - 1000 * 60 * 60 * 50,
      location: 'Balkon',
      slotIndex: 0,
    },
    {
      id: 'p2',
      speciesId: 'basil',
      name: 'Basil Lemon',
      pot: 'pot-mini',
      potTone: 'cream',
      plantedAt: daysAgoISO(30),
      growth: 46,
      needs: { water: 32, nutrient: 64, light: 56 },
      lastWater: Date.now() - 1000 * 60 * 60 * 26,
      lastFeed: Date.now() - 1000 * 60 * 60 * 12,
      location: 'Dapur',
      slotIndex: 1,
    },
    {
      id: 'p3',
      speciesId: 'mint',
      name: 'Mint Nana',
      pot: 'pot-large',
      potTone: 'sage',
      plantedAt: daysAgoISO(42),
      growth: 84,
      needs: { water: 76, nutrient: 40, light: 88 },
      lastWater: Date.now() - 1000 * 60 * 60 * 8,
      lastFeed: Date.now() - 1000 * 60 * 60 * 72,
      location: 'Jendela kamar',
      slotIndex: 2,
    },
  ],
  tasks: [
    {
      id: 't1',
      plantId: 'p1',
      type: 'water',
      title: 'Cek kelembapan & siram',
      time: '08:00',
      date: todayISO(),
      status: 'todo',
      repeat: 'Setiap 2 hari',
    },
    {
      id: 't2',
      plantId: 'p2',
      type: 'check',
      title: 'Periksa daun basil',
      time: '10:00',
      date: todayISO(),
      status: 'todo',
      repeat: 'Mingguan',
    },
    {
      id: 't3',
      plantId: 'p3',
      type: 'light',
      title: 'Geser pot ke cahaya pagi',
      time: '15:00',
      date: todayISO(),
      status: 'todo',
      repeat: 'Harian',
    },
    {
      id: 't4',
      plantId: 'p1',
      type: 'fertilize',
      title: 'Pupuk organik dosis ringan',
      time: '07:00',
      date: todayISO(),
      status: 'done',
      repeat: '2 minggu sekali',
      completedAt: new Date().toISOString(),
    },
    {
      id: 't5',
      plantId: 'p2',
      type: 'water',
      title: 'Siram tipis media basil',
      time: '17:00',
      date: todayISO(),
      status: 'todo',
      repeat: 'Setiap 2 hari',
    },
    {
      id: 't6',
      plantId: 'p3',
      type: 'water',
      title: 'Cek kelembapan mint',
      time: '08:00',
      date: addDays(todayISO(), 1),
      status: 'todo',
      repeat: 'Setiap 2 hari',
    },
    {
      id: 't7',
      plantId: 'p1',
      type: 'prune',
      title: 'Pangkas tunas samping',
      time: '09:30',
      date: addDays(todayISO(), 2),
      status: 'todo',
      repeat: 'Mingguan',
    },
  ],
  careHistory: [
    { id: 'h1', plantId: 'p1', type: 'fertilize', at: new Date().toISOString(), label: 'Pupuk ringan' },
    { id: 'h2', plantId: 'p3', type: 'water', at: daysAgoISO(1), label: 'Cek & siram' },
    { id: 'h3', plantId: 'p2', type: 'check', at: daysAgoISO(2), label: 'Periksa daun' },
  ],
  journals: JOURNALS.map((entry, index) => ({
    ...entry,
    dateISO: daysAgoISO([15, 11, 6, 2][index] ?? 3),
    createdAt: new Date().toISOString(),
  })),
  cart: [],
  orders: [
    {
      id: 'PTV-482910',
      date: daysAgoISO(12),
      status: 'Selesai',
      items: [
        { productId: 'pot-mini', name: 'Potiva Mini Plant Kit', qty: 1, price: 6000 },
        { productId: 'benih-cabai', name: 'Benih Cabai Milo', qty: 2, price: 5000 },
      ],
      shipping: 9000,
      total: 25000,
      address: 'Jl. Cihampelas No. 24, Bandung',
      courier: 'JNE Reguler',
      payment: 'Transfer Bank',
    },
  ],
  ownedEbooks: ['menanam-cabai'],
  ownedCosmetics: ['gaya-topi-jerami'],
  potiLook: { hat: 'gaya-topi-jerami' },
  seedInventory: { 'tomat-ceri': 1 },
  supplyInventory: { 'pupuk-organik': 1 },
  harvestBasket: [],
  harvestPoints: 0,
  vouchers: [],
  likedPosts: [],
  missions: seedMissions(),
  settings: {
    reminderOn: true,
    journalOn: true,
    promoOn: false,
    emailOn: true,
    pushOn: false,
    reminderTime: '08:00',
    quietHours: true,
  },
})

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedState()
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.version !== 1) return seedState()
    const base = seedState()
    return {
      ...base,
      ...parsed,
      seedInventory: parsed.seedInventory ?? base.seedInventory,
      supplyInventory: parsed.supplyInventory ?? base.supplyInventory,
      harvestBasket: Array.isArray(parsed.harvestBasket) ? parsed.harvestBasket : base.harvestBasket,
      harvestPoints: Number.isFinite(parsed.harvestPoints) ? parsed.harvestPoints : base.harvestPoints,
      vouchers: Array.isArray(parsed.vouchers) ? parsed.vouchers : base.vouchers,
    }
  } catch {
    return seedState()
  }
}

const bumpMission = (missions, id, amount = 1) =>
  missions.map((m) =>
    m.id === id ? { ...m, progress: clamp(m.progress + amount, 0, m.target) } : m,
  )

const award = (wallet, xp, coins) => ({
  ...wallet,
  xp: wallet.xp + xp,
  coins: wallet.coins + coins,
})

const NEED_BY_TASK = {
  water: 'water',
  fertilize: 'nutrient',
  light: 'light',
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage quota exceeded — the demo keeps running in memory */
    }
  }, [state])

  const actions = useMemo(
    () => ({
      login: ({ name, email }) =>
        setState((s) => ({
          ...s,
          guest: false,
          user: {
            ...(s.user || {}),
            name: name.split(' ')[0] || 'Sahabat',
            fullName: name || 'Sahabat POTIVA',
            email: email || 'sahabat@potiva.id',
            initials: (name || 'SP')
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0].toUpperCase())
              .join(''),
          },
        })),

      logout: () => setState((s) => ({ ...s, guest: true })),

      updateProfile: (patch) =>
        setState((s) => ({ ...s, user: { ...s.user, ...patch } })),

      updateSettings: (patch) =>
        setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),

      waterPlant: (plantId) =>
        setState((s) => ({
          ...s,
          wallet: award(s.wallet, 15, 10),
          plants: s.plants.map((p) =>
            p.id === plantId
              ? {
                  ...p,
                  needs: { ...p.needs, water: 100 },
                  growth: clamp(p.growth + 6, 0, 100),
                  lastWater: Date.now(),
                }
              : p,
          ),
          careHistory: [
            {
              id: `h_${Date.now()}`,
              plantId,
              type: 'water',
              at: new Date().toISOString(),
              label: 'Cek & siram',
            },
            ...s.careHistory,
          ].slice(0, 40),
          missions: bumpMission(s.missions, 'water'),
        })),

      feedPlant: (plantId) =>
        setState((s) => ({
          ...s,
          wallet: award(s.wallet, 20, 15),
          plants: s.plants.map((p) =>
            p.id === plantId
              ? {
                  ...p,
                  needs: { ...p.needs, nutrient: clamp(p.needs.nutrient + 55, 0, 100) },
                  growth: clamp(p.growth + 10, 0, 100),
                  lastFeed: Date.now(),
                }
              : p,
          ),
          careHistory: [
            {
              id: `h_${Date.now()}`,
              plantId,
              type: 'fertilize',
              at: new Date().toISOString(),
              label: 'Beri pupuk',
            },
            ...s.careHistory,
          ].slice(0, 40),
          missions: bumpMission(s.missions, 'water'),
        })),

      decoratePlant: (plantId) =>
        setState((s) => ({
          ...s,
          wallet: award(s.wallet, 5, 5),
          plants: s.plants.map((p) =>
            p.id === plantId
              ? {
                  ...p,
                  potTone:
                    p.potTone === 'terra' ? 'cream' : p.potTone === 'cream' ? 'sage' : 'terra',
                }
              : p,
          ),
        })),

      collectBonus: (coins = 2, xp = 1) =>
        setState((s) => ({ ...s, wallet: award(s.wallet, xp, coins) })),

      buySeedWithCoins: (productId) => {
        let bought = false
        setState((s) => {
          const item = PRODUCTS.find((p) => p.id === productId && p.speciesId)
          if (!item || !item.coinPrice) return s
          if (s.wallet.coins < item.coinPrice) return s
          const prev = s.seedInventory?.[item.speciesId] || 0
          bought = true
          return {
            ...s,
            wallet: { ...s.wallet, coins: s.wallet.coins - item.coinPrice },
            seedInventory: { ...(s.seedInventory || {}), [item.speciesId]: prev + 1 },
          }
        })
        return bought
      },

      buySupplyWithCoins: (productId) => {
        let bought = false
        setState((s) => {
          const item = PRODUCTS.find(
            (p) => p.id === productId && p.category === 'Perawatan' && p.coinPrice,
          )
          if (!item || s.wallet.coins < item.coinPrice) return s
          const prev = s.supplyInventory?.[productId] || 0
          bought = true
          return {
            ...s,
            wallet: { ...s.wallet, coins: s.wallet.coins - item.coinPrice },
            supplyInventory: { ...(s.supplyInventory || {}), [productId]: prev + 1 },
          }
        })
        return bought
      },

      useSupplyOnPlant: (productId, plantId) => {
        let applied = false
        setState((s) => {
          const count = s.supplyInventory?.[productId] || 0
          const plant = s.plants.find((p) => p.id === plantId)
          if (count <= 0 || !plant) return s
          const boost = productId === 'pupuk-organik' ? 16 : productId === 'tanah-media' ? 14 : 10
          applied = true
          return {
            ...s,
            wallet: award(s.wallet, 25, 15),
            supplyInventory: { ...(s.supplyInventory || {}), [productId]: count - 1 },
            plants: s.plants.map((p) =>
              p.id === plantId
                ? {
                    ...p,
                    growth: clamp(p.growth + boost, 0, 100),
                    needs: {
                      water: productId === 'sprayer' ? 100 : clamp(p.needs.water + 20, 0, 100),
                      nutrient:
                        productId === 'sprayer'
                          ? p.needs.nutrient
                          : clamp(p.needs.nutrient + 65, 0, 100),
                      light: p.needs.light,
                    },
                  }
                : p,
            ),
          }
        })
        return applied
      },

      plantSeedInGarden: (speciesId, preferredSlot = null) => {
        const id = `p_${Date.now()}`
        let ok = false
        setState((s) => {
          const count = s.seedInventory?.[speciesId] || 0
          if (count <= 0) return s
          const species = SPECIES.find((sp) => sp.id === speciesId)
          if (!species) return s
          const usedSlots = new Set(
            s.plants.map((p, i) => (p.slotIndex != null ? p.slotIndex : i)),
          )
          let slotIndex = preferredSlot
          if (slotIndex == null || usedSlots.has(slotIndex)) {
            slotIndex = Array.from({ length: 32 }, (_, i) => i).find((i) => !usedSlots.has(i))
            if (slotIndex == null) slotIndex = s.plants.length % 32
          }
          ok = true
          return {
            ...s,
            wallet: award(s.wallet, 15, 5),
            seedInventory: { ...(s.seedInventory || {}), [speciesId]: count - 1 },
            plants: [
              ...s.plants,
              {
                id,
                speciesId,
                name: species.name,
                pot: species.pot || 'pot-mini',
                potTone: 'terra',
                plantedAt: todayISO(),
                growth: 12,
                needs: { water: 85, nutrient: 80, light: 80 },
                location: 'Kebun Poti',
                slotIndex,
              },
            ],
            careHistory: [
              {
                id: `h_${Date.now()}`,
                plantId: id,
                type: 'check',
                at: new Date().toISOString(),
                label: `Tanam ${species.name}`,
              },
              ...s.careHistory,
            ].slice(0, 40),
          }
        })
        return ok ? id : id
      },

      harvestPlant: (plantId) => {
        let harvested = null
        setState((s) => {
          const plant = s.plants.find((p) => p.id === plantId)
          if (!plant || plant.growth < 85) return s
          const species = SPECIES.find((sp) => sp.id === plant.speciesId)
          const item = {
            id: `hv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            speciesId: plant.speciesId,
            name: plant.name,
            emoji: species?.emoji || '🌿',
            points: species?.harvestPoints || 40,
            harvestedAt: new Date().toISOString(),
          }
          harvested = item
          return {
            ...s,
            wallet: award(s.wallet, 35, 25),
            plants: s.plants.filter((p) => p.id !== plantId),
            harvestBasket: [item, ...(s.harvestBasket || [])],
            careHistory: [
              {
                id: `h_${Date.now()}`,
                plantId: plant.id,
                type: 'check',
                at: new Date().toISOString(),
                label: `Panen ${plant.name}`,
              },
              ...s.careHistory,
            ].slice(0, 40),
          }
        })
        return harvested
      },

      redeemHarvestVoucher: (templateId) => {
        let created = null
        setState((s) => {
          const tpl = VOUCHER_CATALOG.find((v) => v.id === templateId)
          const basket = s.harvestBasket || []
          if (!tpl || basket.length < tpl.costHarvest) return s
          const code = `${tpl.codePrefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
          created = {
            id: `vc_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            templateId: tpl.id,
            code,
            target: tpl.target,
            discount: tpl.discount,
            title: tpl.title,
            createdAt: new Date().toISOString(),
            used: false,
            usedAt: null,
          }
          return {
            ...s,
            harvestBasket: basket.slice(tpl.costHarvest),
            vouchers: [created, ...(s.vouchers || [])],
          }
        })
        return created
      },

      sellHarvestItem: (harvestId) => {
        let sold = null
        setState((s) => {
          const basket = s.harvestBasket || []
          const target = basket.find((h) => h.id === harvestId)
          if (!target) return s
          const sp = SPECIES.find((x) => x.id === target.speciesId)
          const pts = target.points || sp?.harvestPoints || 40
          sold = { ...target, points: pts, coinsEarned: 10 }
          return {
            ...s,
            harvestBasket: basket.filter((h) => h.id !== harvestId),
            harvestPoints: (s.harvestPoints || 0) + pts,
            wallet: award(s.wallet, 10, 10),
          }
        })
        return sold
      },

      sellAllHarvest: () => {
        let summary = null
        setState((s) => {
          const basket = s.harvestBasket || []
          if (basket.length === 0) return s
          const pts = basket.reduce((sum, h) => {
            const sp = SPECIES.find((x) => x.id === h.speciesId)
            return sum + (h.points || sp?.harvestPoints || 40)
          }, 0)
          const coinsEarned = basket.length * 10
          summary = { count: basket.length, pointsEarned: pts, coinsEarned }
          return {
            ...s,
            harvestBasket: [],
            harvestPoints: (s.harvestPoints || 0) + pts,
            wallet: award(s.wallet, basket.length * 10, coinsEarned),
          }
        })
        return summary
      },

      redeemPointsForVoucher: (templateId) => {
        let created = null
        setState((s) => {
          const tpl = VOUCHER_CATALOG.find((v) => v.id === templateId)
          const curPts = s.harvestPoints || 0
          if (!tpl || curPts < tpl.costPoints) return s
          const code = `${tpl.codePrefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
          created = {
            id: `vc_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
            templateId: tpl.id,
            code,
            target: tpl.target,
            discount: tpl.discount,
            title: tpl.title,
            createdAt: new Date().toISOString(),
            used: false,
            usedAt: null,
          }
          return {
            ...s,
            harvestPoints: curPts - tpl.costPoints,
            vouchers: [created, ...(s.vouchers || [])],
          }
        })
        return created
      },

      addPlant: ({ speciesId, name, pot, plantedAt, location }) => {
        const id = `p_${Date.now()}`
        const species = SPECIES.find((sp) => sp.id === speciesId)
        setState((s) => ({
          ...s,
          wallet: award(s.wallet, 40, 20),
          plants: [
            ...s.plants,
            {
              id,
              speciesId,
              name: name || species?.name || 'Tanaman baru',
              pot: pot || species?.pot || 'pot-mini',
              potTone: 'terra',
              plantedAt: plantedAt || todayISO(),
              growth: 8,
              needs: { water: 80, nutrient: 70, light: 75 },
              location: location || 'Rumah',
            },
          ],
          tasks: [
            {
              id: `t_${Date.now()}`,
              plantId: id,
              type: 'water',
              title: 'Cek kelembapan awal',
              time: '08:00',
              date: addDays(todayISO(), 1),
              status: 'todo',
              repeat: 'Setiap 2 hari',
            },
            ...s.tasks,
          ],
          journals: [
            {
              id: `j_${Date.now()}`,
              plantId: id,
              date: 'Hari 1',
              dateISO: todayISO(),
              stage: 'Benih',
              title: `${name || species?.name} mulai ditanam`,
              note: 'Plant ID berhasil diaktifkan. Tanaman baru masuk ke kebunmu.',
              activity: 'Aktivasi',
              tone: 'mint',
              photo: 1,
              createdAt: new Date().toISOString(),
            },
            ...s.journals,
          ],
        }))
        return id
      },

      completeTask: (taskId) =>
        setState((s) => {
          const task = s.tasks.find((t) => t.id === taskId)
          if (!task || task.status !== 'todo') return s
          const meta = TASK_TYPES[task.type] || TASK_TYPES.check
          const needKey = NEED_BY_TASK[task.type]
          return {
            ...s,
            wallet: award(s.wallet, meta.xp, meta.coins),
            tasks: s.tasks.map((t) =>
              t.id === taskId
                ? { ...t, status: 'done', completedAt: new Date().toISOString() }
                : t,
            ),
            plants: s.plants.map((p) =>
              p.id === task.plantId
                ? {
                    ...p,
                    growth: clamp(p.growth + 2, 0, 100),
                    needs: needKey
                      ? { ...p.needs, [needKey]: clamp(p.needs[needKey] + 40, 0, 100) }
                      : p.needs,
                  }
                : p,
            ),
            careHistory: [
              {
                id: `h_${Date.now()}`,
                plantId: task.plantId,
                type: task.type,
                at: new Date().toISOString(),
                label: task.title,
              },
              ...s.careHistory,
            ].slice(0, 40),
            missions: bumpMission(s.missions, 'tasks'),
          }
        }),

      skipTask: (taskId) =>
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, status: 'skipped' } : t,
          ),
        })),

      addTask: ({ plantId, type, title, time, date, repeat }) =>
        setState((s) => ({
          ...s,
          tasks: [
            {
              id: `t_${Date.now()}`,
              plantId,
              type,
              title: title || TASK_TYPES[type]?.label || 'Perawatan',
              time,
              date,
              repeat: repeat || 'Sekali',
              status: 'todo',
            },
            ...s.tasks,
          ],
        })),

      addJournal: ({ plantId, stage, title, note, activity, dateISO, photo }) =>
        setState((s) => {
          const plant = s.plants.find((p) => p.id === plantId)
          const day = plant
            ? Math.max(
                1,
                Math.round(
                  (new Date(`${dateISO}T12:00:00`) - new Date(`${plant.plantedAt}T12:00:00`)) /
                    86400000,
                ) + 1,
              )
            : 1
          return {
            ...s,
            wallet: award(s.wallet, 20, 15),
            journals: [
              {
                id: `j_${Date.now()}`,
                plantId,
                stage,
                title,
                note,
                activity: activity || 'Catatan',
                dateISO,
                date: `Hari ${day}`,
                tone: 'mint',
                photo: (s.journals.length % 4) + 1,
                image: photo || null,
                createdAt: new Date().toISOString(),
              },
              ...s.journals,
            ],
            missions: bumpMission(s.missions, 'journal'),
          }
        }),

      claimMission: (missionId) =>
        setState((s) => {
          const mission = s.missions.find((m) => m.id === missionId)
          if (!mission || mission.progress < mission.target || mission.claimed) return s
          return {
            ...s,
            wallet: award(s.wallet, 0, mission.reward + 10),
            missions: s.missions.map((m) =>
              m.id === missionId ? { ...m, claimed: true } : m,
            ),
          }
        }),

      markGuideRead: () =>
        setState((s) => ({
          ...s,
          wallet: award(s.wallet, 10, 5),
          missions: bumpMission(s.missions, 'learn'),
        })),

      addToCart: (productId, qty = 1, meta = {}) =>
        setState((s) => {
          const variant = meta?.variant || null
          const existing = s.cart.find(
            (c) => c.productId === productId && (c.variant || null) === variant,
          )
          return {
            ...s,
            cart: existing
              ? s.cart.map((c) =>
                  c.productId === productId && (c.variant || null) === variant
                    ? { ...c, qty: c.qty + qty }
                    : c,
                )
              : [...s.cart, { productId, qty, variant }],
          }
        }),

      setCartQty: (productId, qty, variant = null) =>
        setState((s) => ({
          ...s,
          cart: s.cart.map((c) =>
            c.productId === productId && (c.variant || null) === (variant || null)
              ? { ...c, qty: clamp(qty, 1, 20) }
              : c,
          ),
        })),

      removeFromCart: (productId, variant = null) =>
        setState((s) => ({
          ...s,
          cart: s.cart.filter(
            (c) => !(c.productId === productId && (c.variant || null) === (variant || null)),
          ),
        })),

      clearCart: () => setState((s) => ({ ...s, cart: [] })),

      checkout: (details) => {
        const id = `PTV-${String(Date.now()).slice(-6)}`
        setState((s) => {
          const items = s.cart.map((c) => {
            const product = PRODUCTS.find((p) => p.id === c.productId)
            return {
              productId: c.productId,
              variant: c.variant || null,
              name: c.variant ? `${product?.name || 'Produk'} (${c.variant})` : product?.name || 'Produk',
              qty: c.qty,
              price: product?.price || 0,
              speciesId: product?.speciesId || null,
            }
          })
          const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
          const voucher = details?.voucherId
            ? (s.vouchers || []).find(
                (v) => v.id === details.voucherId && !v.used && v.target === 'shop',
              )
            : null
          const discount = voucher ? Math.round((subtotal * voucher.discount) / 100) : 0
          const shipping =
            subtotal >= 75000
              ? 0
              : details?.shippingCost !== undefined
                ? details.shippingCost
                : 9000

          const nextSeeds = { ...(s.seedInventory || {}) }
          const nextSupplies = { ...(s.supplyInventory || {}) }
          items.forEach((it) => {
            if (it.speciesId) {
              nextSeeds[it.speciesId] = (nextSeeds[it.speciesId] || 0) + it.qty
            }
            const prod = PRODUCTS.find((p) => p.id === it.productId)
            if (prod?.category === 'Perawatan') {
              nextSupplies[it.productId] = (nextSupplies[it.productId] || 0) + it.qty
            }
          })

          return {
            ...s,
            cart: [],
            seedInventory: nextSeeds,
            supplyInventory: nextSupplies,
            vouchers: voucher
              ? (s.vouchers || []).map((v) =>
                  v.id === voucher.id
                    ? { ...v, used: true, usedAt: new Date().toISOString() }
                    : v,
                )
              : s.vouchers,
            wallet: award(s.wallet, 25, 30),
            orders: [
              {
                id,
                date: todayISO(),
                status: 'Diproses',
                items,
                shipping,
                discount,
                voucherCode: voucher?.code || null,
                total: Math.max(0, subtotal - discount) + shipping,
                address: details?.address || 'Alamat demo, Bandung',
                courier: details?.courier || 'JNE Reguler',
                payment: details?.payment || 'Transfer Bank',
              },
              ...s.orders,
            ],
          }
        })
        return id
      },

      buyEbook: (ebookId, voucherId = null) =>
        setState((s) => {
          if (s.ownedEbooks.includes(ebookId)) return s
          const voucher = voucherId
            ? (s.vouchers || []).find(
                (v) => v.id === voucherId && !v.used && v.target === 'ebook',
              )
            : null
          return {
            ...s,
            ownedEbooks: [...s.ownedEbooks, ebookId],
            vouchers: voucher
              ? (s.vouchers || []).map((v) =>
                  v.id === voucher.id
                    ? { ...v, used: true, usedAt: new Date().toISOString() }
                    : v,
                )
              : s.vouchers,
            wallet: award(s.wallet, 15, 10),
          }
        }),

      equipCosmetic: (productId) =>
        setState((s) => {
          const item = COSMETICS.find((c) => c.id === productId)
          if (!item || !s.ownedCosmetics.includes(productId)) return s
          return {
            ...s,
            potiLook: { ...s.potiLook, [item.slot]: productId },
          }
        }),

      unequipCosmetic: (slot) =>
        setState((s) => ({
          ...s,
          potiLook: { ...s.potiLook, [slot]: null },
        })),

      buyCosmeticWithCoins: (productId) =>
        setState((s) => {
          const item = COSMETICS.find((c) => c.id === productId)
          if (!item) return s
          if (s.ownedCosmetics.includes(productId)) {
            return { ...s, potiLook: { ...s.potiLook, [item.slot]: productId } }
          }
          if (s.wallet.coins < item.coinPrice) return s
          return {
            ...s,
            wallet: { ...s.wallet, coins: s.wallet.coins - item.coinPrice },
            ownedCosmetics: [...s.ownedCosmetics, productId],
            potiLook: { ...s.potiLook, [item.slot]: productId },
          }
        }),

      toggleLike: (postId) =>
        setState((s) => ({
          ...s,
          likedPosts: s.likedPosts.includes(postId)
            ? s.likedPosts.filter((id) => id !== postId)
            : [...s.likedPosts, postId],
        })),

      resetDemo: () => {
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* ignore */
        }
        setState(seedState())
      },
    }),
    [],
  )

  const cartItems = useMemo(
    () =>
      state.cart
        .map((item) => {
          const product = PRODUCTS.find((p) => p.id === item.productId)
          return product ? { ...item, product } : null
        })
        .filter(Boolean),
    [state.cart],
  )

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  )
  const getPlant = (id) => state.plants.find((p) => p.id === id)
  const getSpecies = (plant) => SPECIES.find((sp) => sp.id === plant?.speciesId)
  const getProduct = (id) => PRODUCTS.find((p) => p.id === id)
  const getEbook = (id) => EBOOKS.find((b) => b.id === id)
  const posts = COMMUNITY_POSTS.map((p) => ({
    ...p,
    liked: state.likedPosts.includes(p.id),
    likeCount: p.likes + (state.likedPosts.includes(p.id) ? 1 : 0),
  }))

  const value = {
    ...state,
    actions,
    cartItems,
    cartCount,
    cartSubtotal,
    getPlant,
    getSpecies,
    getProduct,
    getEbook,
    posts,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
