package lib

import (
	"html/template"
	"log"
	"net/http"
	"path/filepath"
	"runtime"
)

func RenderTemplate(w http.ResponseWriter, layout string, components []string, props interface{}) error {
	_, filename, _, _ := runtime.Caller(1)
	page := filepath.Base(filename)
	page = page[:len(page)-len(filepath.Ext(page))]

	templates := []string{
		GetPath("/templates/layouts/" + layout + ".tmpl"),
		GetPath("/templates/pages/" + page + ".tmpl"),
	}

	for _, component := range components {
		templates = append(templates, GetPath("/templates/components/"+component+".tmpl"))
	}

	ts, err := template.ParseFiles(templates...)
	if err != nil {
		log.Print(err.Error())
		return err
	}

	err = ts.ExecuteTemplate(w, layout, props)
	if err != nil {
		log.Print(err.Error())
		return err
	}

	return nil
}
