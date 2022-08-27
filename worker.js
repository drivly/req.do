export default {
  fetch: async (req, env, ctx) => {
    // get durable object
    const { origin, hostname, pathname } = new URL(req.url)
    const { colo } = req.cf
    const ip = req.headers.get('cf-connecting-ip'),
    
    if (pathname == '/api') {
      const list = await env.LOGS.list()
      list.keys = list.keys.map(key => ({ url: 'https://req.do/api/' + key.name, ...key, })
      return new Response(JSON.stringify(, null, 2), { headers: { 'content-type': 'application/json' }})   
    } else if (pathname.startsWith('/api/')) {
      const [ _, id ] = pathname.split('/api/')
      return new Response(JSON.stringify(await env.LOGS.get(id), null, 2), { headers: { 'content-type': 'application/json' }})   
    }
    
    const res = await fetch(req.url.replace(hostname + '/', ''), req)
//     const response = { ...res.clone(), headers: Object.fromEntries(res.headers)
    
//     const stub = env.COUNTER.get(env.COUNTER.idFromName('logs'))
//     return stub.fetch(req)
    
    const response = res.clone()
    const body = await response.json().catch(ex => undefined)
    
    const ts = Date.now()
    const time = new Date(ts).toISOString()
    
    ctx.waitUntil(env.LOGS.put(req.headers.get('cf-ray'), JSON.stringify({ 
      ts,
      colo,
      time,
      request: {
        ...req.clone(),
        headers: Object.fromEntries(req.headers),
      },
      response: {
        ...response,
        headers: Object.fromEntries(res.headers),
        body,
      }
    }, null, 2),
    { 
      expirationTtl: 60 * 60 * 24 * 30,
      metadata: {
        colo,
        ip,
        ts,
        time,
      }
    }))
    
    return res
  },
}

// export class Counter {
//   constructor(state, env) {
//     this.state = state
//   }

//   // Handle HTTP requests from clients.
//   async fetch(req) {
//     const { origin, pathname, searchParams } = new URL(req.url)
//     // use this.value rather than storage
//     this.value = searchParams.has('reset') ? 0 : searchParams.has('read') ? this.value : this.value + 1
//     await this.state.storage.put('value', this.value)
//     const retval = {
//       key: pathname.replace(/^\/(api\/?)?/, ''),
//       value: this.value,
//       count: origin + pathname,
//       read: origin + pathname + '?read',
//       reset: origin + pathname + '?reset',
//     }
//     return new Response(JSON.stringify(retval, null, 2), { headers: { 'content-type': 'application/json' } })
//   }
// }
