<template>
    <router-link :to="'/blog/' + meta.slug + '-' + meta.id" id="BlogPostPreview" class="card" :class="elClass">
        <img class="title-image" :src="image" v-if="image && imageOnTop" alt="Title Image">

        <div id="titles" class="unselectable">
            <div id="date">{{ meta.date }}</div>
            <div id="title">{{ meta.title }}</div>
            <div id="subtitle" v-if="meta.subtitle">{{ meta.subtitle }}</div>
            <div class="tags">
                <div v-if="tagOnTop" style="display: inline-block">
                    <Tag v-for="t in meta.tags" :key="t" direction="left">{{ t }}</Tag>
                </div>
                <i id="pin" class="fas fa-thumbtack" v-if="meta.pinned"></i>
            </div>
        </div>
    </router-link>
</template>

<script lang="ts" setup>
import Tag from "@/components/Tag.vue";
import { BlogPost } from "@/types/blog";
import { hosts } from "@/lib/constants";
import { computed } from 'vue';

const p = withDefaults(defineProps<{
    meta: BlogPost
    imageOnTop?: boolean
    tagOnTop?: boolean
}>(), {
    imageOnTop: false,
    tagOnTop: true,
})

const uid = (Math.random() + 1).toString(36).substring(7)

// Element classes
const elClass = computed(() => {
    let classes = [uid]
    if (p.imageOnTop) classes.push('image-top')
    if (p.tagOnTop) classes.push('tag-top')
    return classes
})

const image = p.meta.title_image ? hosts.content + '/' + p.meta.title_image : null;
</script>

<style lang="sass" scoped>
@import "src/sass/colors"

#BlogPostPreview
    color: $color-text-main
    text-decoration: none
    text-align: left
    display: flex
    flex-direction: column
    overflow: hidden

    #date
        font-size: 0.7em
        color: $color-text-light

    > * + *, #content > * + *
        padding-top: 10px

    .tags
        font-size: 0.7em
        z-index: 50

        #pin
            margin-left: 10px
            transform: rotate(45deg)

    .tag-wrap + .tag-wrap
        margin-left: 5px

    #titles
        // Position patch
        margin: -15px -20px
        padding: 15px 20px

        position: relative

        #title
            font-size: 1.2em
            font-weight: bold

        #subtitle
            font-size: 0.8em
            color: $color-text-light

    img
        $margin: 10px
        max-width: calc(100% + 2 * $margin)
        min-width: calc(100% + 2 * $margin)
        border-radius: 10px
        margin-left: -$margin
        margin-right: -$margin

    // Fix accordion overflow: none
    #content
        $padding: 20px
        margin-left: -$padding
        padding-left: $padding
        margin-right: -$padding
        padding-right: $padding

    #expand
        font-size: 0.8em
        padding-top: 10px
        color: $color-text-light

// Put image on top
#BlogPostPreview.image-top
    .title-image
        margin: -15px -20px 0px
        max-width: calc(100% + 40px)
        min-width: calc(100% + 40px)

// Put tags on top
#BlogPostPreview.tag-top
    .tags
        position: absolute
        right: 20px
        top: 15px

@media screen and (max-width: 400px)
    #BlogPostPreview
        img
            $margin: 15px
            max-width: calc(100% + 2 * $margin)
            min-width: calc(100% + 2 * $margin)
            border-radius: 10px
            margin-left: -$margin
            margin-right: -$margin

</style>