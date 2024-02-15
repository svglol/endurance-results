<template>
  <main class="main">
    <div
      class="flex flex-col lg:grid lg:grid-cols-12 divide-x dark:divide-gray-800 divide-gray-200 min-h-screen">
      <MobileHeader class="lg:hidden" />
      <div class="hidden lg:block lg:col-span-2">
        <TheSidebar />
      </div>
      <div class="grid grow p-4 col-span-10 overflow-x-scroll"><slot /></div>
    </div>
  </main>
</template>

<script setup lang="ts"></script>
