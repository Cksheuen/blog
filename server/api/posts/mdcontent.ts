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

export default defineEventHandler(async () => {
  const file_path = path.join(__dirname, '../', '../', 'public', '看人工智能论文.md')
  console.log(file_path)

  const md_content = fs.readFileSync(file_path, 'utf-8')
  const { content, data } = matter(md_content)

  const processedContent = await remark()
    .use(html)
    .process(content)
  const contentHtml = processedContent.toString()
  return {
    md_content,
    content: contentHtml,
    data,
  }
})
