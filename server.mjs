import { createServer } from 'node:http'
import { createHash } from 'node:crypto'

const events = [
  { id: 'evt_981', type: 'workflow.completed', source: 'cineforge', at: new Date().toISOString(), payload: { efficiency: 0.924 } },
  { id: 'evt_982', type: 'qa.preset_improved', source: 'analytics', at: new Date().toISOString(), payload: { preset: 'Neon Reflections', score: 0.97 } }
]
const metrics = { healthScore: 92.4, renderEfficiency: 18.6, activeProjects: 24, kpisTracked: 42, costPerRender: 0.84 }
const json = (res, status, body) => { res.writeHead(status, { 'content-type':'application/json', 'access-control-allow-origin':'*' }); res.end(JSON.stringify(body)) }
const server = createServer((req,res) => {
  if (req.method === 'GET' && req.url === '/api/v1/metrics') return json(res,200,metrics)
  if (req.method === 'GET' && req.url === '/api/v1/events') return json(res,200,{ events })
  if (req.method === 'GET' && req.url === '/api/v1/knowledge-graph') return json(res,200,{ nodes:248, edges:611, stores:['openai-vector-store','files-api'] })
  if (req.method === 'POST' && req.url === '/api/v1/workflows/analyze') return json(res,202,{ runId:'run_'+Date.now(), orchestrator:'openai-responses-api', status:'queued' })
  return json(res,404,{ error:'Not found' })
})
const clients = new Set()
const send = (socket, message) => {
  const data = Buffer.from(JSON.stringify(message)); const length = data.length
  const head = length < 126 ? Buffer.from([0x81, length]) : Buffer.from([0x81, 126, length >> 8, length & 255])
  socket.write(Buffer.concat([head, data]))
}
server.on('upgrade', (req, socket) => {
  if (req.url !== '/ws' || !req.headers['sec-websocket-key']) return socket.destroy()
  const accept = createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64')
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`)
  clients.add(socket); socket.on('close', () => clients.delete(socket)); socket.on('error', () => clients.delete(socket))
  send(socket, { type:'analytics.snapshot', metrics, events })
})
setInterval(() => { const message = { type:'kpi.updated', metric:'healthScore', value:Number((91 + Math.random()*4).toFixed(1)) }; clients.forEach(socket => send(socket, message)) }, 5000)
server.listen(process.env.PORT || 3001, () => console.log('BES Analytics API listening on :3001'))
