#!/usr/bin/env node
/**
 * Servidor HTTP mock para tests E2E (Playwright).
 *
 * Variables de entorno:
 *   MOCK_PORT  Puerto donde escucha (default: 3001)
 *   SCENARIO   Escenario de respuestas (default: 'happy')
 *
 * Escenarios disponibles:
 *   happy              Happy path: login exitoso, datos básicos cargados
 *   credenciales_invalidas  login devuelve exito: false
 */
const http = require('http')
const { URL } = require('url')

const PORT = process.env.MOCK_PORT || 3001
let SCENARIO = process.env.SCENARIO || 'happy'

// JWT mínimo decodificable por jwtDecode: header.payload.signature
// El payload tiene role, name y exp (año 2286 — nunca expira en tests)
const headerB64 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
const payloadB64 = Buffer.from(
  JSON.stringify({ role: 'Administrador', name: 'Admin E2E', exp: 9999999999 })
).toString('base64url')
const TOKEN_E2E = `${headerB64}.${payloadB64}.fake-e2e-signature`

// key: "MÉTODO:/ruta"  →  objeto con respuestas por escenario
const RESPONSES = {
  'POST:/api/Auth/login': {
    happy: { exito: true, token: TOKEN_E2E },
    credenciales_invalidas: { exito: false, token: null },
  },
  'GET:/api/Jugador': {
    happy: [],
  },
  'GET:/api/Club': {
    happy: [],
  },
  'GET:/api/Equipo': {
    happy: [],
  },
  'GET:/api/Delegado': {
    happy: [],
  },
  'GET:/api/AgrupadorTorneo': {
    happy: [],
  },
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`)
  const key = `${req.method}:${parsedUrl.pathname}`

  console.log(`[mock] ${req.method} ${req.url}`)

  // Endpoint interno: cambiar escenario en tiempo de ejecución
  if (key === 'POST:/_set-scenario') {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      try {
        const { scenario } = JSON.parse(body)
        SCENARIO = scenario
        console.log(`[mock] Escenario cambiado a: ${scenario}`)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      } catch {
        res.writeHead(400)
        res.end()
      }
    })
    return
  }

  const scenarioResponses = RESPONSES[key]
  if (!scenarioResponses) {
    console.warn(`[mock] sin handler para ${key}`)
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: `Sin mock para ${key}` }))
    return
  }

  const body = scenarioResponses[SCENARIO] ?? scenarioResponses['happy']
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[mock] corriendo en 0.0.0.0:${PORT}  (escenario: ${SCENARIO})`)
})
