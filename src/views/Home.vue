<template>
    <div id="Home" class="markdown-content" v-if="html">
        <Dynamic :template="html"></Dynamic>
    </div>
    <Loading v-else></Loading>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { parseMarkdown } from '@/lib/parseMarkdown';
import { hosts } from "@/lib/constants";
import Loading from "@/components/Loading.vue";

@Options({ components: { Loading } })
export default class Home extends Vue {
    html = ""

    mounted(): void {
        // Fetch readme
        fetch(hosts.readme)
            .then(data => data.text())
            .then(async (data) => {
                this.html = await parseMarkdown(data);
            })
            .catch(error => {
                console.error('Error fetching readme:', error);
            });
    }
}
</script>

<style lang="sass">
#Home
    width: min(600px, 80vw)
    margin: auto
    padding-bottom: 100px
    padding-top: 20px

.emoji
    font-weight: normal

</style>
