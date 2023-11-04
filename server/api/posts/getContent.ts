import fs from 'node:fs'
import path, { dirname } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import axios from 'axios'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// console.log('path.join(__dirname, \'..\') -- ', path.join(__dirname, '..'))
const baseUrl = 'https://cksheuen.github.io/blog_files/'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const postsDirectory = path.join(baseUrl, 'posts', body.path)
  // const postsDirectory= path.join(process.cwd()) , 'public', 'posts', body.path
  //  = `/posts/${body.path}`
  // = path.join(__dirname, '..', 'public', 'posts', body.path)
  // = path.join(process.cwd(), `posts/${body.path}`)
  // = `/posts/${body.path}`
  // console.log(postsDirectory)

  const fullPath = path.join(postsDirectory, `${body.id}.md`)

  const matterResult = await axios.get(fullPath)
  // console.log(matterResult.data)

  /* const fileContent = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContent) */
  const processedContent = await remark()
    .use(html)
    .process(matterResult.data)
  const contentHtml = processedContent.toString()

  return {
    contentHtml,
  }
})
