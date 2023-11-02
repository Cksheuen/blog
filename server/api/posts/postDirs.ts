import path, { dirname } from 'node:path'
import process from 'node:process'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// console.log('path.join(__dirname, \'..\') -- ', path.join(__dirname, '..'))

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const postsDirectory
  = path.join(process.cwd(), '..')// , 'public', 'posts', body.path
  console.log(fs.readdirSync(postsDirectory))

  // = `/posts/${body.path}`
  // = path.join(__dirname, '..', 'public', 'posts', body.path)
  // = path.join(process.cwd(), `posts/${body.path}`)
  //  = `/posts/${body.path}`
  console.log(postsDirectory)

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace('/\.md$/', '')

    const fsState = fs.statSync(path.join(postsDirectory, fileName))
    const cdate = fsState.ctime

    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)

    return {
      id,
      cdate,
      ...matterResult.data,

    }
  })
  return allPostsData.sort((a, b) => a.cdate < b.cdate ? 1 : -1)
})
