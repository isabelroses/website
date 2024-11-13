use serde::{Deserialize, Serialize};
use serde_json;
use std::fs::File;
use std::io::{self, BufReader};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Donor {
    pub name: String,
    pub tier: String,
    pub url: String,
    pub avatar: String,
}

pub fn get() -> io::Result<Vec<Donor>> {
    let file_str = std::env::var("DONOS_FILE").unwrap_or_else(|_| "donors.json".to_string());
    let file = File::open(file_str)?;
    let reader = BufReader::new(file);

    let donos = serde_json::from_reader(reader)?;

    Ok(donos)
}

pub fn add(donor: Donor) {
    let file_str = std::env::var("DONOS_FILE").unwrap_or_else(|_| "donors.json".to_string());
    let file = File::open(&file_str).unwrap();
    let reader = BufReader::new(file);

    let mut donos: Vec<Donor> = serde_json::from_reader(reader).unwrap();
    donos.push(donor);

    let file = File::create(&file_str).unwrap();
    serde_json::to_writer(file, &donos).unwrap();
}
