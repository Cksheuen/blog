import path from 'node:path'
import process from 'node:process'
import fs from 'node:fs'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContent = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContent)

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()
  return {
    id,
    contentHtml,
    fileContent,
    ...matterResult.data,
  }
})
