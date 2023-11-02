import fs from 'node:fs'
import path, { dirname } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// console.log(__dirname)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const postsDirectory
  // path.join(__dirname, '..', '..', 'posts', body.path)
  // path.join(process.cwd(), `posts/${body.path}`)
  = `./posts/${body.path}`
  // console.log(postsDirectory)

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
