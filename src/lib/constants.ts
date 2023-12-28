import { Project } from "@/types/projects";

const production = true;

export const hosts = {
  readme: production
    ? "https://isabelroses.com/isabelroses/README.md"
    : "http://localhost:3000/isabelroses/README.md",
  content: production ? "https://isabelroses.com" : "http://localhost:3000/",
};

export const $ = (window as any).jQuery;

export const projects: Project[] = [
  {
    name: "This site",
    desc: "This site that your currently on.",
    website: "https://isabelroses.com",
    repo: "https://github.com/isabelroses/website",
  },
  {
    name: "Userstyles",
    icon: "images/repos/userstyles-icon.png",
    banner: "images/repos/userstyles-banner.jpg",
    repo: "https://github.com/catppuccin/userstyles",
  },
  {
    name: "Dotfiles",
    icon: "images/repos/dotfiles-icon.svg",
    banner: "images/repos/dotfiles-banner.svg",
    repo: "https://github.com/isabelroses/dotfiles",
  },
  {
    name: "Bellado",
    desc: "A fast and once simple cli todo tool",
    icon: "images/repos/bellado-icon.png",
    banner: "images/repos/bellado-banner.png",
    repo: "https://github.com/isabelroses/bellado",
  },
];
