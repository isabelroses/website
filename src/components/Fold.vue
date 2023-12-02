<template>
    <div class="fold">
        <h3 v-html="displayTitle" class="clickable"></h3>
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Prop } from "vue-property-decorator";
import { $ } from '@/lib/constants';

@Options({ components: {} })
export default class Fold extends Vue {
    @Prop() title!: string
    @Prop({ default: false }) active = false

    show = false

    get displayTitle(): string {
        return decodeURIComponent(this.title)
    }

    mounted(): void {
        $('.fold').accordion({
            collapsible: true, header: 'h3', heightStyle: 'content',
            active: this.active
        })
    }
}
</script>

<style lang="sass">
.fold
    h3.ui-accordion-header
        margin: 0
        padding-top: 0.5em
        padding-bottom: 0.5em
        user-select: none

    h3.ui-accordion-header:not(.ui-accordion-header-active):after
        content: '...'

    .content
        padding-bottom: 0.5em
</style>