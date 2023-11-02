import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const postsDirectory = path.join(process.cwd(), `posts/${body.path}`)
  const fullPath = path.join(postsDirectory, `${body.id}.md`)
  const fileContent = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContent)
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    contentHtml,
    fileContent,
    ...matterResult.data,
  }
})
