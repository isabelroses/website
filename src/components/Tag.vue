<template>
    <div class="tag-wrap unselectable clickable">
        <div class="tag fbox-vcenter" :class="props.direction">
            <div>
                <slot></slot>
            </div>
            <div class="after"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    direction: { type: String, default: 'left' }, // 'left' | 'right'
})
</script>

<style lang="sass" scoped>
@import "src/sass/colors"

$tag-height: 20px
$tag-color: $color-special

$padding: calc($tag-height / 2)
$triangle-width: calc($tag-height / 2) * 0.8

.tag-wrap
    display: inline-block

.tag
    background: $tag-color
    color: $color-text-invert
    display: inline-flex
    height: $tag-height
    position: relative
    transition: color 0.2s

    .after
        border-bottom: $padding solid transparent
        border-top: $padding solid transparent
        border-left: $triangle-width solid $tag-color
        position: absolute
        top: 0

.tag.right
    padding: 0 ($padding - 4) 0 $padding
    margin-right: $triangle-width
    border-radius: 3px 0 0 3px

    .after
        right: -$triangle-width

.tag.left
    padding: 0 $padding 0 ($padding - 4)
    margin-left: $triangle-width
    border-radius: 0 3px 3px 0

    .after
        transform: rotate(180deg)
        left: -$triangle-width
</style>
