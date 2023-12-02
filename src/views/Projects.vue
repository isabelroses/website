<template>
    <div id="projects" class="general-page">
        <div class="title">
            <h2>Projects</h2>
            <div class="subtitle">
                A collection of projects that I maintain
            </div>
        </div>

        <div class="projects" v-if="projects">
            <div class="project card" v-for="project in projects" :key="project.name">
                <div class="banner" :style="bgStyle(project)"></div>
                <img class="icon" :src="project.icon" alt="Project icon">
                <div class="info">
                    <div class="words">
                        <span class="name">{{ project.name }}</span>
                        <span class="desc">{{ project.desc }}</span>
                    </div>
                    <div class="links">
                        <a v-for="link in getLinks(project)" :href="link.link"><i :class="link.icon"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Project } from '@/types/projects';
import { projects } from '@/lib/constants'

const excludes = new Set(["name", "icon", "banner", "desc"])
const icons = {
    website: 'fas fa-globe',
    github: 'fab fa-github',
    gitlab: 'fab fa-gitlab',
    branch: 'fas fa-code-branch',
    link: 'fas fa-link'
}

@Options({ components: {} })
export default class Projects extends Vue {
    projects: Project[] = []

    async created() {
        this.projects = projects;

        // Fix icon relative url
        this.projects.forEach(f => {
            f.icon = f.icon ? `${f.icon}` : '/images/me.webp'
            f.banner = `${f.banner}`
        })
    }

    bgStyle(f: Project) {
        if (f.banner) return { 'background-image': `url("${f.banner}")` }
        else return {}
    }

    getLinks(f: Project): { link: string, icon: string }[] {
        return Object.entries(f)
            .filter(pair => !excludes.has(pair[0]))
            .map(pair => {
                let icon;

                if (pair[0] === 'website') icon = icons.website;
                else if (pair[0] === 'repo') {
                    const link = pair[1] as string;
                    if (link.includes('github')) icon = icons.github;
                    else if (link.includes('gitlab')) icon = icons.gitlab;
                    else icon = icons.branch;
                }
                else icon = icons.link;

                return {
                    link: pair[1] as string,
                    icon: icon as string
                };
            });
    }
}
</script>

<style lang="sass" scoped>
@import "src/sass/colors"

$card-min-width: 320px

.project
  display: flex
  position: relative
  min-width: $card-min-width

  $top: calc(100px + max(min(100vw, 600px), $card-min-width + 20px * 2) * 0.1 - $card-min-width * 0.1)
  $img: 80px

  .banner
    position: absolute
    left: 0
    top: 0
    z-index: 1
    width: 100%
    height: $top
    background-color: $color-bg-light
    background-size: cover
    background-position: center

  .banner:after
    content: " "
    position: absolute
    z-index: 2
    width: 100%
    height: 100%

  .info
    z-index: 10
    display: flex
    align-items: end
    width: 100%

    .words
        white-space: nowrap
        overflow: hidden
        flex: 1
        
        .name
            font-size: 1.2em
            margin-right: 20px

        .desc
            font-size: 0.8em


    a
      color: $color-text-main

    a + a
      margin-left: 10px

  .icon
    margin-top: calc(#{$top} - #{$img} / 2 - 20px)
    width: $img
    height: $img
    object-fit: contain
    border-radius: 100%
    margin-right: 20px
    z-index: 10

// Phone layout
@media screen and (max-width: 500px), (max-height: 660px)
    .info .words .desc 
        display: none
</style>