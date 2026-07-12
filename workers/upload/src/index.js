const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'X-Upload-Secret',
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS })
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const secret = request.headers.get('X-Upload-Secret')
    if (!secret || secret !== env.UPLOAD_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }

    const url = new URL(request.url)
    // /blog/* → blog bucket, /events/* → events bucket
    const isBlog = url.pathname.startsWith('/blog')
    const bucket = isBlog ? env.BLOG_BUCKET : env.EVENTS_BUCKET
    const publicBase = isBlog
      ? 'https://pub-fadea5a747054af085acb80790544ec2.r2.dev'
      : 'https://pub-c2f389a0273d4bb0a1f1f4ad3cb32797.r2.dev'

    let formData
    try {
      formData = await request.formData()
    } catch {
      return new Response('Invalid form data', { status: 400 })
    }

    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return new Response('No file provided', { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    await bucket.put(filename, file.stream(), {
      httpMetadata: { contentType: file.type },
    })

    return new Response(JSON.stringify({ url: `${publicBase}/${filename}` }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  },
}
