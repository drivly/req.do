export default {
  fetch: async (req, env, ctx) => {
    // get durable object
    const { origin, hostname, pathname } = new URL(req.url)
    
    if (pathname.startsWith('/api')) {
      return new Response(JSON.stringify(LOGS.list(), null, 2), { headers: { 'content-type': 'application/json' }})   
    }
    
    const res = await fetch(req.url.replace(hostname + '/', ''), req)
//     const response = { ...res.clone(), headers: Object.fromEntries(res.headers)
    
//     const stub = env.COUNTER.get(env.COUNTER.idFromName('logs'))
//     return stub.fetch(req)
    
    const response = res.clone()
    const body = await response.json().catch(ex => undefined)
    
    const ts = Date.now()
    const time = new Date(ts).toISOString()
    
    ctx.waitUntil(env.LOGS.put(req.headers.get('cf-ray') + '-' + req.cf.colo, JSON.stringify({ 
      ts,
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
        ip: req.headers.get('cf-connecting-ip'),
        ray: req.headers.get('cf-ray'),
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
