package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)



func main() {
    r := chi.NewRouter()
    r.Use(middleware.Logger)
	fs := http.FileServer(http.Dir("assets/"))
	r.Method("GET", "/assets/*", http.StripPrefix("/assets/", fs))
    db := initDB()

    r.Get("/", func(w http.ResponseWriter, r *http.Request) {
        http.ServeFile(w, r, "index.html")
    })
    r.Get("/schema", func(rw http.ResponseWriter, r *http.Request) {
        crearSchema(db)
        rw.Write([]byte("ok"))
    })
    r.Get("/cargar/{nombre}", func(rw http.ResponseWriter, r *http.Request) {
        nombre := chi.URLParam(r, "nombre")
        res := obtenerDatos(db, nombre)
        rw.Write(res)
    })
    r.Post("/guardar", func(rw http.ResponseWriter, r *http.Request) {
        body, err := ioutil.ReadAll(r.Body)
        if err != nil {
            log.Fatal(err)
        }
        defer r.Body.Close()
        fmt.Println("body es: ")
        fmt.Println(string(body))
        rw.Write([]byte(body))
        agregarDatos(db, "hola", string(body))
    })
    
    fmt.Println(" lis an se") 
    http.ListenAndServe(":80", r)
}






