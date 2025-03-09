### Blog（×）Somewhere2Test（√）

![image-20250309162621781](C:\Users\Cksheuen\AppData\Roaming\Typora\typora-user-images\image-20250309162621781.png)

Code rust and build wasm in `./wasm`, and then import them to be used in `./app`。

Compile and develop as the script in package.json written.

```
"pw": "cd wasm/wasm-scene & wasm-pack build",
"build": "pnpm pw & pnpm build:web"
```