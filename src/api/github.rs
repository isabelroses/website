use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};

use crate::data::donos;

#[derive(Debug, Deserialize, Serialize)]
pub struct Dono {
    action: String,
    sponsorship: Sponsorship,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Sponsorship {
    created_at: String,
    privacy_level: String,
    sponsor: Sponsor,
    tier: Tier,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Sponsor {
    avatar_url: Option<String>,
    login: String,
    html_url: Option<String>,
    name: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Tier {
    name: String,
    is_one_time: bool,
}

pub async fn handler(Json(payload): Json<Dono>) -> impl IntoResponse {
    if payload.sponsorship.privacy_level == "SECRET" {
        return (StatusCode::OK, "Accepted, and hidden".to_string()).into_response();
    }

    // Only process newly created sponsorships
    if payload.action != "created" {
        return (StatusCode::OK, "Not a new sponsorship".to_string()).into_response();
    }

    let new_data = donos::Donor {
        tier: if payload.sponsorship.tier.is_one_time {
            "OneTime".to_string()
        } else {
            payload.sponsorship.tier.name.clone()
        },
        name: get_name(&payload.sponsorship.sponsor),
        url: payload
            .sponsorship
            .sponsor
            .html_url
            .unwrap_or(String::new()),
        avatar: payload
            .sponsorship
            .sponsor
            .avatar_url
            .unwrap_or(String::new()),
    };

    donos::add(new_data.clone());

    (StatusCode::OK, Json(new_data)).into_response()
}

fn get_name(sponsor: &Sponsor) -> String {
    sponsor
        .name
        .clone()
        .unwrap_or_else(|| sponsor.login.clone())
}
