<template>
    <div id="Blog" class="general-page" v-if="meta">
        <div class="title">
            <h2>Blog</h2>
            <div class="subtitle">Some information that might come in useful</div>
        </div>
        <div id="breadcrumb">
            <span class="clickable" @click="() => $router.push({ query: {} })">Index</span>
            <span v-if="tag" class="no-after">🏷️{{ tag }}</span>
        </div>
        <BlogIndex :tags="meta.tags" />
        <BlogPreview v-for="m of filteredPosts" :key="m.id" :meta="m" />
    </div>
    <Loading v-else></Loading>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import meta from "@/gen/metas.json";
import BlogPreview from "@/components/BlogPreview.vue";
import BlogIndex from "@/components/BlogIndex.vue";
import Loading from "@/components/Loading.vue";

const props = defineProps<{
    tag?: string
}>()

const filteredPosts = computed(() => {
    const posts = meta.posts.filter(post => post.pinned || (props.tag ? post.tags.includes(props.tag) : true))

    // Put pinned posts on top
    posts.sort((a, b) => (b.pinned ?? 0) - (a.pinned ?? 0))

    return posts
})
</script>

<style lang="sass" scoped>
@import "src/sass/colors"

#breadcrumb
    color: $color-text-light
    margin-bottom: 20px

    span:not(.no-after):after
        content: ">"
        margin: 0 10px
</style>