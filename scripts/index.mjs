for (const [k, v] of Object.entries(process.env)) {
    if (!k.startsWith("APIFY_")) {
        continue
    }
    console.log("ressurecting:", k)
    const res = await fetch(v, { method: 'POST' })
    if (!res.ok) {
        console.log(await res.json())
    }
}