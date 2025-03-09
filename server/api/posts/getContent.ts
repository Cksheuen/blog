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
const baseUrl = 'https://cksheuen.github.io/blog_files/'

function getContent(url: string) {
  return axios.get(url)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const postsDirectory = new URL(`posts/${body.path}/`, baseUrl)
  const fullPath = new URL(`${body.id}.md`, postsDirectory).toString()
  // path.join(postsDirectory, body.path, `${body.id}.md`)

  // const matterResult = await axios.get(fullPath)
  // console.log(matterResult.data)

  // const fileContent = fs.readFileSync(fullPath, 'utf8')
  console.log(fullPath)

  console.log('asd', await getContent(fullPath))

  try {
    const matterResult = await axios.get(fullPath)
    console.log(matterResult)

    const processedContent = await remark()
      .use(html)
      .process(matterResult.data)
    const contentHtml = processedContent.toString()

    return {
      contentHtml,
    }
  }
  catch (error) {
    console.error('Error fetching content:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch content' })
  }
})
