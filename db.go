package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/dgraph-io/dgo/v210"
	"github.com/dgraph-io/dgo/v210/protos/api"
	"google.golang.org/genproto/googleapis/type/datetime"
)

type Archivo struct {
	Fecha    datetime.DateTime     `json:"dateTime,omitempty"`
	Nombre     string     `json:"nombre,omitempty"`
	Datos      string        `json:"data,omitempty"`
}

func obtenerDatos(dg *dgo.Dgraph, nombre string) []byte{
	fmt.Println("nombre: ", nombre)
	variables := map[string]string{"$nombre": nombre}

    // Query the balance for Alice and Bob.
	const q = `
        query Archivos($nombre: string){
			archivos(func: eq(nombre, $nombre)) {
				nombre
				data
			}
    	}
    `
    
    txn := dg.NewReadOnlyTxn()
    resp, err := txn.QueryWithVars(context.Background(), q, variables)
    if err != nil {
        fmt.Println("error mio")
        fmt.Println(err)
        log.Fatal(err)
    }
	type Root struct {
		Archivos []Archivo `json:"archivos"`
	}

	var r Root
    // After we get the balances, we have to decode them into structs so that
    // we can manipulate the data.
    if err := json.Unmarshal(resp.GetJson(), &r); err != nil {
        log.Fatal(err)
    }
	for index, element := range r.Archivos {
        fmt.Println("At index", index, "value is", element)
    }

	return resp.GetJson()
}

func agregarDatos(dg *dgo.Dgraph, nombre string, datos string){
    ctx := context.Background()

	archivo := Archivo{
		Nombre:    nombre,
		Datos:     datos,
		Fecha: datetime.DateTime{},
	}

	mu := &api.Mutation{
		CommitNow: true,
	}
	pb, err := json.Marshal(archivo)
	if err != nil {
		log.Fatal(err)
	}

	mu.SetJson = pb
	response, err := dg.NewTxn().Mutate(ctx, mu)
	if err != nil {
		log.Fatal(err)
	}
    fmt.Println(response)
}

func crearSchema(dg *dgo.Dgraph){
    op := &api.Operation{}
	op.Schema = `
		nombre: string @index(exact).
		data: string .
		fecha: dateTime .
		type Archivo {
			nombre: string
			data: string
			fecha: dateTime
		}
	`

	ctx := context.Background()
	if err := dg.Alter(ctx, op); err != nil {
		log.Fatal(err)
	}
}

func initDB() *dgo.Dgraph{
    conn, err := dgo.DialCloud("https://blue-surf-560077.us-east-1.aws.cloud.dgraph.io/graphql", "MWIyZmU4OTY0MDM1ZTc2ZGU3YjFkOTE1MGQ0N2ZkOWI=")
    if err != nil {
        fmt.Println("error db")
        fmt.Println(err)
        log.Fatal(err)
    }
    //defer conn.Close()
    return dgo.NewDgraphClient(api.NewDgraphClient(conn))
}