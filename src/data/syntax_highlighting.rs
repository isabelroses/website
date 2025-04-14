use std::{
    collections::HashMap,
    io::{self, Write},
};

use autumnus::{
    formatter::{Formatter, HtmlFormatter, HtmlLinked},
    languages::Language,
};
use comrak::adapters::SyntaxHighlighterAdapter;

#[derive(Debug)]
pub struct AutumnusAdapter<'a> {
    pub source: &'a str,
}

impl<'a> AutumnusAdapter<'a> {
    pub fn new(input: &'a str) -> Self {
        Self { source: input }
    }
}

impl SyntaxHighlighterAdapter for AutumnusAdapter<'_> {
    fn write_pre_tag(
        &self,
        output: &mut dyn Write,
        _attributes: HashMap<String, String>,
    ) -> io::Result<()> {
        let formatter = HtmlLinked::default();
        write!(output, "{}", formatter.open_pre_tag())
    }

    fn write_code_tag(
        &self,
        output: &mut dyn Write,
        attributes: HashMap<String, String>,
    ) -> io::Result<()> {
        let plaintext = "language-plaintext".to_string();
        let language = attributes.get("class").unwrap_or(&plaintext);
        let split: Vec<&str> = language.split('-').collect();
        let language = split.get(1).unwrap_or(&"plaintext");
        let lang: Language = Language::guess(language, self.source);

        let formatter = HtmlLinked::default().with_lang(lang);
        write!(output, "{}", formatter.open_code_tag())
    }

    fn write_highlighted(
        &self,
        output: &mut dyn Write,
        lang: Option<&str>,
        source: &str,
    ) -> io::Result<()> {
        let lang: Language = Language::guess(lang.unwrap_or("plaintext"), source);
        let formatter = HtmlLinked::default().with_lang(lang).with_source(source);
        write!(output, "{}", formatter.highlights())
    }
}
