package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
    r := chi.NewRouter()
    r.Use(middleware.Logger)
	fs := http.FileServer(http.Dir("assets/"))
	r.Method("GET", "/assets/*", http.StripPrefix("/assets/", fs))
    r.Get("/", func(w http.ResponseWriter, r *http.Request) {
        http.ServeFile(w, r, "index.html")
    })
    http.ListenAndServe(":80", r)
}