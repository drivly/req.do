export default {
  fetch: async (req, env) => {
    // get durable object
    const { origin, hostname, pathname } = new URL(req.url)
    
    const request = req.clone()    
    const res = await fetch(request.url.replace(hostname + '/', ''), request)
//     const response = { ...res.clone(), headers: Object.fromEntries(res.headers)
    
//     const stub = env.COUNTER.get(env.COUNTER.idFromName('logs'))
//     return stub.fetch(req)
    
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
