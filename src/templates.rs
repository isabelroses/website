use std::str::from_utf8;

use lazy_static::lazy_static;
use rust_embed::Embed;
use tera::Tera;

lazy_static! {
    pub static ref TEMPLATES: Tera = {
        let mut tera = Tera::default();
        let _res = tera.add_raw_templates(Template::iter().map(|file| {
            let raw_data = Template::get(&file).unwrap();
            let content = from_utf8(raw_data.data.as_ref()).unwrap();
            (file.to_string(), content.to_string())
        }));
        tera
    };
}

#[derive(Embed)]
#[folder = "templates/"]
struct Template;

#[cfg(test)]
mod tests {
    use super::*;
    use tera::Context;

    #[test]
    fn test_templates() {
        assert!(TEMPLATES
            .render("pages/home.tera", &Context::new())
            .unwrap()
            .contains("Isabel Roses"),);
    }
}
