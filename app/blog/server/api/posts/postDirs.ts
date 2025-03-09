import path, { dirname } from 'node:path'
import process from 'node:process'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import axios from 'axios'
import config from './config.json'

// const baseUrl = config.path

const baseUrl = 'https://api.github.com/repos/cksheuen/blog_files/contents/posts'

async function getFileList(url: string) {
  const response = await axios.get(url)
  return response.data
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const postsDirectory = path.join(baseUrl, body.path)

  // path.join('https://cksheuen.github.io/blog_files/', 'posts', body.path)
  // const postsDirectory = path.join(process.cwd(), '___vc') , 'public', 'posts', body.path
  // https://api.github.com/repos/cksheuen/blog_files/contents/post
  // =
  // = path.join(__dirname, '..', 'public', 'posts', body.path)
  // = path.join(process.cwd(), `posts/${body.path}`)
  //  = `/posts/${body.path}`
  // console.log(postsDirectory)

  // const fileNames = fs.readdirSync(postsDirectory)

  const data = await getFileList(postsDirectory)
  // console.log(data)

  const fileNames: string[] = []

  data!.forEach((item: any) => {
    fileNames.push(item.name)
  })

  const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace('/\.md$/', '')

    /* const fsState = fs.statSync(path.join(postsDirectory, fileName))
    const cdate = fsState.ctime

    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents) */

    return {
      id, /*
      cdate,
      ...matterResult.data, */

    }
  })

  return allPostsData
})
