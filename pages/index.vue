<script setup lang="ts">
const online = useOnline()
</script>

<template>
  <div>
    <div class="information" m-auto>
      <div m-auto mb-8 text-left prose>
        <h1 slide-enter-50 mb-0>
          Cksheuen
        </h1>
      </div>
      <div class="introduction" slide-enter-50 m-auto mt-5 text-left c-gray5 prose>
        <p>早上中午晚上好！</p>
        <p>
          这是某蒟蒻因为看到
          <a href="https://blog.plumbiu.top/" rel="noopener" target="_blank">佬纯手写写的blog</a>

          比hexo搭建的快好多所以自己写的一个不完善的劣质产品。后面大概会再这上面丢些奇奇怪怪的东西。
        </p>
        <p>
          页面样式风格
          <span line-through>抄袭</span>

          参考自
          <a href="https://antfu.me/" rel="noopener" target="_blank">fu神 antfu</a>。
        </p>
        <p>After all, it's just a silly personal blog.</p>
        <p>If you have some advice about it, please just contact me.</p>
      </div>
    </div>
    <Suspense>
      <template #fallback>
        <div italic op50>
          <span animate-pulse>Loading...</span>
        </div>
      </template>
    </Suspense>
  </div>
</template>
