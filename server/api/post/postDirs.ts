import path from 'node:path'
import process from 'node:process'
import fs from 'node:fs'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'posts')

export default defineEventHandler(() => {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
  /* const allPostsData = fileNames.map((fileName) => {
    const id = fileName.replace('/\.md$/', '')

    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)

    return {
      id,
      ...matterResult.data,
    }
  })
  return allPostsData.sort((a, b) => a.date < b.date ? 1 : -1) */
})
