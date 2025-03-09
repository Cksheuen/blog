import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const postsDirectory = path.join(process.cwd(), 'posts')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log(body)
  /* const data = JSON.parse(body)
  console.log(JSON.parse(body))
 */
  const fullPath = path.join(postsDirectory, `${body.id}.md`)
  fs.writeFileSync(fullPath, body.content, 'utf8')
  return { body }
})
