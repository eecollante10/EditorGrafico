var app = new Vue({
  el: "#main",
  data: {
    bloques: dataBloques,
    codigo: "",
    variables: [],
    nodeSelected: 0,
    editor: null
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
    this.editor.registerNode("Control", Control);
    this.editor.registerNode("Texto", Texto);
    this.editor.registerNode("Operador", Operador);
    this.editor.on("nodeCreated", function (id) {
      ultimo_id_creado = id
    })
    this.editor.on("nodeSelected", function (id) {
      app.nodeSelected = id;
    });
    this.editor.on("nodeUnselected", function () {
      app.nodeSelected = 0;
    });
    this.editor.on("connectionRemoved", function (params) {
      const nodeInfo = app.editor.getNodeFromId(params.input_id);
      var bloquePadre = bloques.find(b => b.id == params.input_id);
      var input_class = params.input_class.slice(-1);
      if (nodeInfo.inputs[params.input_class].connections.length == 0 && bloquePadre.hijos.length >= input_class) {
        bloquePadre.hijos[input_class - 1].esRaiz = true;
        bloquePadre.hijos[input_class - 1].nivel = 1;
        bloquePadre.hijos.splice(input_class - 1, 1);
      }
    });
    this.editor.on("keydown", function (event) {
      if (app.nodeSelected != 0 && (event.key === "D" || event.key === "d")) {
        app.editor.removeNodeId("node-" + app.nodeSelected);
      }
    })
    this.editor.on("nodeRemoved", function (id) {
      bloques = bloques.filter(function (bloque) {
        if (bloque.id == id) {
          if (bloque.icono == "=") {
            var index = app.variables.findIndex(function (bl) {
              return bl.id == bloque.id;
            });
            if (index >= 0) {
              app.variables.splice(index, 1);
            }
          }
        }
        return bloque.id != id;
      });
    });
    this.editor.on("connectionCreated", function (params) {
      //inpuyt node
      const nodeInfo = app.editor.getNodeFromId(params.input_id);
      const nodeInfo2 = app.editor.getNodeFromId(params.output_id);
      if (nodeInfo.inputs[params.input_class].connections.length > 1) {
        var remove_index = nodeInfo.inputs[params.input_class].connections.length - 1
        const removeConnectionInfo = nodeInfo.inputs[params.input_class].connections[remove_index];
        app.editor.removeSingleConnection(removeConnectionInfo.node, params.input_id, removeConnectionInfo.input, params.input_class);
        return;
      }
      // output node
      else if (nodeInfo2.outputs[params.output_class].connections.length > 1) {
        var remove_index = nodeInfo2.outputs[params.output_class].connections.length - 1
        const removeConnectionInfo = nodeInfo2.outputs[params.output_class].connections[remove_index];
        app.editor.removeSingleConnection(params.output_id, removeConnectionInfo.node, params.output_class, removeConnectionInfo.output);
        return;
      }

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
            console.log("splice 1");
            bloqueIn.hijos.splice(1, 0, bloqueOut);
          } else {
            console.log("splice 2");
            bloqueIn.hijos.splice(2, 0, bloqueOut);
          }
          break;
      }
    });
    this.editor.start();
  },
  methods: {
    generarCodigo: function (lang) {
      var codigo = "";
      var asignaciones = bloques.filter(b => b.icono == "=");
      var resto = bloques.filter(b => b.icono != "=");
      var generar = function(bloq){
        var cod = ""
        for (bloque of bloq) {
          if (bloque.esRaiz) {
            if (lang == 0)
              cod += bloque.darPython();
            else if (lang == 1)
              cod += bloque.darSwift();
            cod += " <br>";
          }
        }
        return cod;
      }
      codigo = generar(asignaciones);
      codigo += generar(resto);
      this.codigo = codigo;
    },
    cargar: function (event) {
      let nombre = prompt("Ingrese el nombre del archivo", "");
      if (nombre == null || nombre == "") {
        window.alert("Debe escribir un nombre de archivo para cargar");
        return
      }
      console.log("cargar: " + nombre);
      fetch('/cargar/' + nombre)
        .then(function (res) {
          return res.json() // Convert the data into JSON
        })
        .then(function (data) {
          var parsed = JSON.parse(data.archivos[data.archivos.length - 1].data); // Logs the data to the console
          bloques = parsed.bloques
          for (b of bloques) {
            b.hijos = b.hijos.map(bl => bloques.find(bloque => bloque.id == bl.id))
          }
          cargando = true
          indice_carga = 0
          app.editor.import(parsed.data);
          cargando = false
          id_inc = app.editor.nodeId
          return data;
        });
    },
    guardar: function (event) {
      var exportdata = this.editor.export();
      var bls = JSON.parse(JSON.stringify(bloques)).map(function (bloque) {
        bloque.hijos = bloque.hijos.map(b => b.id);
        return bloque
      })
      console.log("guardando: " + JSON.stringify(exportdata))
      let nombreArchivo = prompt("Ingrese el nombre del archivo", "");
      if (nombreArchivo == null || nombreArchivo == "") {
        window.alert("Debe escribir un nombre de archivo para guardar");
        return
      }
      fetch("/guardar", {
          method: 'POST',
          body: nombreArchivo + JSON.stringify({
            data: exportdata,
            bloques: bls
          }),
          headers: {
            "Content-type": "text/plain"
          }
        })
        .then(function (res) {
          return res.json() // Convert the data into JSON
        })
        .then(function (data) {
          console.log(data); // Logs the data to the console
        })
        .catch(function (error) {
          console.log(error); // Logs an error in case there is one
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
          componente = "Control";
          break;
        case 13:
          data = darNodo(ForData);
          componente = "Control";
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