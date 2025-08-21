import { MetadataRoute } from 'next'
import { getPublicWorkspaces, Workspace } from '@/lib/databse'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sendany.all.dev.br'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  try {
    // Get public workspaces for dynamic sitemap
    const publicWorkspaces = await getPublicWorkspaces()
    
    const workspacePages: MetadataRoute.Sitemap = publicWorkspaces.map((workspace: Workspace) => ({
      url: `${baseUrl}/${workspace.slug}`,
      lastModified: workspace.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    return [...staticPages, ...workspacePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return static pages only if there's an error
    return staticPages
  }
}
