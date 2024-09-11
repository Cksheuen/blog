import fs from 'node:fs'
import path, { dirname } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import axios from 'axios'
import config from './config.json'

const postsDirectory = config.path

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const fullPath = path.join(postsDirectory, body.path, `${body.id}.md`)

  // const matterResult = await axios.get(fullPath)
  // console.log(matterResult.data)

  const fileContent = fs.readFileSync(fullPath, 'utf8')

  const matterResult = matter(fileContent)

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    contentHtml,
  }
})
