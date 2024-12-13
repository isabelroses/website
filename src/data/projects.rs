use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Project {
    name: &'static str,
    description: Option<&'static str>,
    icon: Option<&'static str>,
    banner: Option<&'static str>,
    href: Option<&'static str>,
    repo: &'static str,
}

pub const PROJECTS: &[Project] = &[
    Project {
        name: "This site",
        description: Some("This site that your currently on."),
        icon: None,
        banner: None,
        href: Some("https://isabelroses.com"),
        repo: "https://github.com/isabelroses/website",
    },
    Project {
        name: "Userstyles",
        description: Some("Soothing pastel userstyles"),
        icon: Some("userstyles-icon.webp"),
        banner: Some("userstyles-banner.webp"),
        href: None,
        repo: "https://github.com/catppuccin/userstyles",
    },
    Project {
        name: "freeze.nvim",
        description: Some("A wrapper for charm's freeze cli tool for usage in neovim"),
        icon: Some("freeze-icon.webp"),
        banner: Some("freeze-banner.webp"),
        href: None,
        repo: "https://github.com/charm-community/freeze.nvim",
    },
    Project {
        name: "izrss",
        description: Some("An RSS feed reader for the terminal"),
        icon: None,
        banner: Some("izrss-banner.webp"),
        href: None,
        repo: "https://github.com/isabelroses/izrss",
    },
    Project {
        name: "Dotfiles",
        description: Some("My over complex system configurations"),
        icon: Some("dotfiles-icon.svg"),
        banner: Some("dotfiles-banner.svg"),
        href: None,
        repo: "https://github.com/isabelroses/dotfiles",
    },
    Project {
        name: "Bellado",
        description: Some("A fast and once simple cli todo tool"),
        icon: Some("bellado-icon.webp"),
        banner: Some("bellado-banner.webp"),
        href: None,
        repo: "https://github.com/isabelroses/bellado",
    },
];
