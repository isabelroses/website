package templates

import (
	"embed"
	"html/template"
	"io/fs"
	"log"
	"net/http"
	"path/filepath"
	"runtime"
)

//go:embed layouts/* pages/* components/*
var templatesFS embed.FS

// RenderTemplate renders a template with the given layout, components, and properties.
func RenderTemplate(w http.ResponseWriter, layout string, components []string, props interface{}) error {
	_, filename, _, _ := runtime.Caller(1)
	page := filepath.Base(filename)
	page = page[:len(page)-len(filepath.Ext(page))]

	// Collect the template paths
	templatePaths := []string{
		"layouts/" + layout + ".tmpl",
		"pages/" + page + ".tmpl",
	}

	for _, component := range components {
		templatePaths = append(templatePaths, "components/"+component+".tmpl")
	}

	// Create a new template and parse the files from the embedded file system
	ts := template.New("")
	for _, path := range templatePaths {
		content, err := fs.ReadFile(templatesFS, path)
		if err != nil {
			log.Print(err.Error())
			return err
		}
		ts, err = ts.Parse(string(content))
		if err != nil {
			log.Print(err.Error())
			return err
		}
	}

	// Execute the template
	err := ts.ExecuteTemplate(w, layout, props)
	if err != nil {
		log.Print(err.Error())
		return err
	}

	return nil
}
