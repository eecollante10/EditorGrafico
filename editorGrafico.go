package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

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
        z := strings.SplitN(string(body), "{", 2)
        fmt.Println("nombre es:", z[0])
        fmt.Println("data es:", "{" + z[1])
        agregarDatos(db, z[0], "{" + z[1])
        rw.Write([]byte("{\"ok\": \"ok\"}"))
    })
    
    fmt.Println(" lis an se") 
    http.ListenAndServe(":80", r)
}






