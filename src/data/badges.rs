use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Friend {
    link: &'static str,
    badge: &'static str,
}

pub const BADGES: &[&str] = &[
    "arc.webp",
    "blink.gif",
    "bitwarden.gif",
    "cc-by-nc-sa.gif",
    "catppuccin.webp",
    "discordserver.gif",
    "fedi.gif",
    "gaywebring.gif",
    "gimp.gif",
    "nix.gif",
    "queercoded.webp",
    "nec.gif",
    "love_blahaj.gif",
    "she-her.webp",
    "tgirl.webp",
    "transnow.png",
    "www.gif",
    "iesucks.gif",
    "scripts.gif",
];

pub const FRIENDS: &[Friend] = &[
    Friend {
        link: "https://genshibe.ca",
        badge: "gen.png",
    },
    Friend {
        link: "https://alyxia.dev",
        badge: "alyxia.png",
    },
    Friend {
        link: "https://nax.dev",
        badge: "nax.gif",
    },
    Friend {
        link: "https://aubrey.rs",
        badge: "aubrey.png",
    },
    Friend {
        link: "https://rooot.gay",
        badge: "rooot.gif",
    },
    Friend {
        link: "https://autumn.town",
        badge: "autum.webp",
    },
    Friend {
        link: "https://les.bi",
        badge: "maeve.png",
    },
    Friend {
        link: "https://basil.cafe",
        badge: "basil.gif",
    },
    //Friend {
    //    link: "https://garfunkles.space",
    //    badge: "garfunkles.webp",
    //},
];
