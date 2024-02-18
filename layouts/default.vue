<template>
  <main class="main">
    <div
      class="flex flex-col lg:flex-row divide-x dark:divide-gray-800 divide-gray-200 min-h-screen">
      <MobileHeader class="lg:hidden" />
      <div class="hidden lg:block basis-2/12 flex-none">
        <TheSidebar />
      </div>
      <div class="grow p-4 overflow-x-scroll"><slot /></div>
    </div>
  </main>
</template>

<script setup lang="ts"></script>
