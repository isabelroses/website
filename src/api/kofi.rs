use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};

use crate::data::donos;

#[derive(Debug, Deserialize, Serialize)]
pub struct Dono {
    message: Option<String>,
    shop_items: Option<String>,
    timestamp: String,
    #[serde(rename = "type")]
    type_: String,
    verification_token: String,
    from_name: String,
    message_id: String,
    amount: String,
    currency: String,
    email: String,
    url: String,
    shipping: Option<String>,
    tier_name: Option<String>,
    kofi_transaction_id: String,
    is_public: bool,
    is_first_subscription_payment: bool,
    is_subscription_payment: bool,
}

pub async fn handler(Json(payload): Json<Dono>) -> impl IntoResponse {
    if !payload.is_public {
        return (StatusCode::OK, "Accepted, and hidden".to_string()).into_response();
    }

    if !payload.is_first_subscription_payment && payload.type_ != "Donation" {
        return (StatusCode::OK, "Not a new donation".to_string()).into_response();
    }

    let new_data = donos::Donor {
        tier: if payload.type_ == "Donation" {
            "OneTime".to_string()
        } else {
            payload
                .tier_name
                .unwrap_or("Subscription".to_owned())
                .clone()
        },
        name: payload.from_name,
        url: payload.url,
        avatar: "https://cdn.ko-fi.com/cdn/kofi2.png?v=2".to_string(),
    };

    donos::add(new_data.clone());

    (StatusCode::OK, Json(new_data)).into_response()
}
