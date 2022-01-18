var app = new Vue({
  el: "#main",
  data: {
    bloques: dataBloques,
    codigo: "",
    variables: [],
    nodeSelected: 0
  },
  mounted: function () {
    // `this` points to the vm instance
    var id = document.getElementById("drawflow");
    this.editor = new Drawflow(id, Vue, this);
    this.editor.registerNode("Asignacion", Asignacion);
    this.editor.registerNode("Variable", Variable, {
      variables: this.variables
    }, {});
    this.editor.registerNode("Numero", Numero);
    this.editor.registerNode("Texto", Texto);
    this.editor.registerNode("Operador", Operador);
    this.editor.on("nodeSelected", function (id) {
      app.nodeSelected = id;
    });
    this.editor.on("nodeUnselected", function () {
      app.nodeSelected = 0;
    });
    this.eliminadoReciente = false;
    this.editor.on("connectionRemoved", function (params) {
      if (app.eliminadoReciente == false) {
        app.eliminadoReciente = true;
        app.coneccionEliminada = params;
      }
    });
    var editor = this.editor;
    this.editor.on("keydown", function (event) {
      if (app.nodeSelected != 0 && (event.key === "D" || event.key === "d")) {
        editor.removeNodeId("node-" + app.nodeSelected);
        bloques = bloques.filter(function (bloque) {
          if (bloque.id == app.nodeSelected) {
            for (b of bloque.hijos) {
              console.log("poniendo es raiz: " + JSON.stringify(b));
              b.esRaiz = true;
              b.nivel = 1;
            }
            if (bloque.icono == "=") {
              var index = app.variables.findIndex(function (bl) {
                return bl.id == bloque.id;
              });
              if (index >= 0) {
                app.variables.splice(index, 1);
              }
            }
          }
          if (app.coneccionEliminada.output_id == app.nodeSelected) {
            var bloquePadre = bloques.find(b => b.id == app.coneccionEliminada.input_id);
            var input_class = app.coneccionEliminada.input_class.slice(-1);
            bloquePadre.hijos.splice(input_class - 1, 1);
          }
          return bloque.id != app.nodeSelected;
        });
        app.eliminadoReciente = false;
      }      
    });
    this.editor.on("connectionCreated", function (params) {
      var bloqueOut = bloques.find(b => b.id == params.output_id);
      var bloqueIn = bloques.find(b => b.id == params.input_id);
      bloqueOut.esRaiz = false;

      switch (bloqueIn.icono) {
        case "=":
          bloqueIn.asignar(bloqueOut);
          app.variables.push(bloqueIn)
          break;
        case "for":
        case "if":
        case "{}":
          bloqueOut.nivel = bloqueIn.nivel + 1;
        default:
          var input_class = params.input_class.slice(-1);
          if (input_class == 1) {
            bloqueIn.hijos.splice(0, 0, bloqueOut);
          } else if (input_class == 2) {
            bloqueIn.hijos.splice(1, 0, bloqueOut);
          } else {
            bloqueIn.hijos.splice(2, 0, bloqueOut);
          }
          break;

      }
    });
    this.editor.start();
    //var im = '{"drawflow":{"Home":{"data":{"1":{"id":1,"name":"Número","data":{"id":1,"titulo":"Número","icono":"º","descripcion":"Sostiene un número para usarlo con otros bloques","entradas":0,"salidas":1,"esRaiz":true,"valor":"2","hijos":[],"nivel":1},"class":"Class","html":"Numero","typenode":"vue","inputs":{},"outputs":{"output_1":{"connections":[]}},"pos_x":-1,"pos_y":0},"2":{"id":2,"name":"Número","data":{"id":2,"titulo":"Número","icono":"º","descripcion":"Sostiene un número para usarlo con otros bloques","entradas":0,"salidas":1,"esRaiz":true,"valor":"2","hijos":[],"nivel":1},"class":"Class","html":"Numero","typenode":"vue","inputs":{},"outputs":{"output_1":{"connections":[]}},"pos_x":56,"pos_y":173}}}}}';
    //this.editor.import(im)
  },
  methods: {
    generarCodigo: function () {
      var codigo = "";
      for (bloque of bloques) {
        if (bloque.esRaiz) {
          codigo += bloque.darPython() + " <br>";
        }
      }
      this.codigo = codigo;
    },
    cargar: function(nombre){
      console.log("cargar: " + nombre);
      fetch('/cargar/'+nombre)
      .then(function(res) {
        console.log("res: " + res)
          return res.json()   // Convert the data into JSON
      })
      .then(function(data) {
          console.log(data.archivos[0].data); 
          var parsed = JSON.parse(data.archivos[0].data);  // Logs the data to the console
          console.log("print parsed:" + parsed );
          app.editor.import(parsed);
          return data;
      });
    },
    pedirNombreArchivo: function(event){
      let nombre = prompt("Ingrese el nombre del archivo", "");
      this.cargar(nombre);
    },
    guardar: function(event){
      var exportdata = this.editor.export();
      console.log("guardando: " + JSON.stringify(exportdata))
      fetch("/guardar", {
        method: 'POST',
        body: JSON.stringify(exportdata),
        headers: {
          "Content-type": "text/plain"
        }
    })
        .then(function(res) {
          console.log("data: " + JSON.stringify(res))
            return res.json()   // Convert the data into JSON
        })
        .then(function(data) {
            console.log(data);   // Logs the data to the console
        })
        .catch(function(error) {
            console.log(error);   // Logs an error in case there is one
        }); 
    },
    crearBloque: function (bloque) {
      var data;
      var componente = "Operador";
      switch (bloque.id) {
        case 0:
          data = darNodo(AsignacionData);
          componente = "Asignacion";
          break;
        case -3:
          data = darNodo(BlockData);
          break;
        case -2:
          data = darNodo(VariableData);
          componente = "Variable";
          break;
        case -1:
          data = darNodo(TextoData);
          componente = "Texto";
          break;
        case 1:
          data = darNodo(NumeroData);
          componente = "Numero";
          break;
        case 2:
          data = darNodo(SumaData);
          break;
        case 3:
          data = darNodo(RestaData);
          break;
        case 4:
          data = darNodo(MultipData);
          break;
        case 5:
          data = darNodo(DivisionData);
          break;
        case 6:
          data = darNodo(IgualData);
          break;
        case 7:
          data = darNodo(DiferenteData);
          break;
        case 8:
          data = darNodo(MayorData);
          break;
        case 9:
          data = darNodo(OrData);
          break;
        case 10:
          data = darNodo(AndData);
          break;
        case 11:
          data = darNodo(NotData);
          break;
        case 12:
          data = darNodo(IteData);
          break;
        case 13:
          data = darNodo(ForData);
          break;
        case 14:
          data = darNodo(PrintData);
          break;
      }
      this.editor.addNode(
        data.titulo,
        bloque.entradas,
        bloque.salidas,
        0,
        0,
        "Class",
        data,
        componente,
        "vue"
      );
    },
  },
});