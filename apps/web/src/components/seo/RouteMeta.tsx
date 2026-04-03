import { useEffect } from 'react'

const siteUrl = 'https://personal-finance-dashboard.vercel.app'

export function RouteMeta({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}) {
  useEffect(() => {
    document.title = `${title} | Finless`

    const ensureMeta = (name: string) => {
      let tag = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
      if (!tag) {
        tag = document.createElement('meta')
        tag.name = name
        document.head.append(tag)
      }
      return tag
    }

    const ensureProperty = (property: string) => {
      let tag = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.append(tag)
      }
      return tag
    }

    const descriptionTag = ensureMeta('description')
    descriptionTag.content = description

    const robotsTag = ensureMeta('robots')
    robotsTag.content = 'index,follow'

    const canonicalHref = `${siteUrl}${path}`
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = canonicalHref

    ensureProperty('og:title').content = `${title} | Finless`
    ensureProperty('og:description').content = description
    ensureProperty('og:type').content = 'website'
    ensureProperty('og:url').content = canonicalHref
  }, [description, path, title])

  return null
}
