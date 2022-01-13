var app = new Vue({
  el: "#main",
  data: {
    bloques: dataBloques,
    codigo: "",
    variables: {},
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
    this.editor.on("nodeSelected", function(id){
      app.nodeSelected = id;
    });
    this.editor.on("nodeUnselected", function(){
      app.nodeSelected = 0;
    });
    var editor = this.editor;
    this.editor.on("keydown", function(event){
      if(app.nodeSelected != 0 && event.key === "Backspace"){
        editor.removeNodeId("node-" + app.nodeSelected);
        bloques = bloques.filter(function(bloque, index, arr){ 
          return bloque.id != app.nodeSelected;
      });
      }
    });
    this.editor.on("connectionCreated", function (params) {
      var bloqueOut = bloques[params.output_id - 1];
      var bloqueIn = bloques[params.input_id - 1];
      bloqueOut.esRaiz = false;

      switch (bloqueIn.icono) {
        case "=":
          bloqueIn.asignar(bloqueOut);
          app.$set(app.variables, bloqueIn.nombre, bloqueOut.darValor());
          break;
        default:
          var input_class = params.input_class.slice(-1);
          if (input_class == 1) {
            bloqueIn.hijos.splice(0, 0, bloqueOut);
          } else if(input_class == 2){
            bloqueIn.hijos.splice(1, 0, bloqueOut);
          }
          else{
            bloqueIn.hijos.splice(2, 0, bloqueOut); 
          }
          break;

      }
    });
    this.editor.start();
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
    crearBloque: function (bloque) {
      var data;
      var componente = "Operador";
      switch (bloque.id) {
        case 0:
          data = darNodo(AsignacionData);
          componente = "Asignacion";
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